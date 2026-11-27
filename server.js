const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const data = require('./data');
const app = express();
const port = process.env.PORT || 4131;

app.set('views', 'views');
app.set('view engine', 'pug');

app.use(express.urlencoded({extended : true}));
app.use(express.json());
app.use('/css', express.static('resources/css'));
app.use('/js', express.static('resources/js'));
app.use('/images', express.static('resources/images'));

app.use(session({
    secret : 'shiba_inu_secret_key',
    resave : false,
    saveUninitialized : false,
    cookie : {maxAge : 60 * 60 * 24}
}));

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    res.locals.message = req.session.message;
    res.locals.messageType = req.session.messageType;
    delete req.session.message;
    delete req.session.messageType;
    next();
});

function requireLogin(req, res, next) {
    if (!req.session.user) {
        req.session.message = 'Please login first';
        req.session.messageType = 'error';
        return res.redirect('/login');
    }
    next();
}

app.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const posts = await data.getRecentPosts(limit, offset);
    const totalCount = await data.getTotalPostsCount();
    const totalPages = Math.ceil(totalCount / limit);
    res.render('index',
               {posts, currentPage : page, totalPages, title : 'Q&A Box Blog'});
});

app.get('/register', (req, res) => {
    res.render('register', {title : 'Register'});
});

app.post('/register', async (req, res) => {
    const {username, password, password2} = req.body;
    if (!username || !password || !password2) {
        req.session.message = 'All fields are required';
        req.session.messageType = 'error';
        return res.redirect('/register');
    }
    if (password !== password2) {
        req.session.message = 'Passwords do not match';
        req.session.messageType = 'error';
        return res.redirect('/register');
    }
    const existingUser = await data.getUserByUsername(username);
    if (existingUser) {
        req.session.message = 'Username already exists';
        req.session.messageType = 'error';
        return res.redirect('/register');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await data.addUser(username, hashedPassword);
    req.session.user = {id : userId, username, isAdmin : 0};
    req.session.message = 'Registration successful';
    req.session.messageType = 'success';
    res.redirect('/');
});

app.get('/login', (req, res) => {
    res.render('login', {title : 'Login'});
});

app.post('/login', async (req, res) => {
    const {username, password} = req.body;
    if (!username || !password) {
        req.session.message = 'Please enter username and password';
        req.session.messageType = 'error';
        return res.redirect('/login');
    }
    const user = await data.getUserByUsername(username);
    if (!user) {
        req.session.message = 'Invalid username or password';
        req.session.messageType = 'error';
        return res.redirect('/login');
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        req.session.message = 'Invalid username or password';
        req.session.messageType = 'error';
        return res.redirect('/login');
    }
    req.session.user = {
        id : user.id,
        username : user.username,
        isAdmin : user.isAdmin
    };
    req.session.message = `Welcome back, ${user.username}!`;
    req.session.messageType = 'success';
    res.redirect('/');
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get(
    '/make-me-admin-please',
    async (req,
           res) => {  // This Easter egg enables you to become an administrator.
                      // Login is required for it to take effect.
        if (!req.session.user) {
            req.session.message = 'You need to log in first';
            req.session.messageType = 'error';
            return res.redirect('/login');
        }
        await data.makeUserAdmin(req.session.user.id);
        req.session.user.isAdmin = 1;
        req.session.message = 'You are now Admin';
        req.session.messageType = 'success';
        res.redirect('/');
    });

app.get('/post/new', requireLogin, (req, res) => {
    res.render('post-form',
               {title : 'New Question Box', post : null, isEdit : false});
});

app.post('/post/new', requireLogin, async (req, res) => {
    const {title, content} = req.body;
    if (!title || !content) {
        req.session.message = 'Title and content are required';
        req.session.messageType = 'error';
        return res.redirect('/post/new');
    }
    try {
        const user = await data.getUserByUsername(req.session.user.username);
        if (!user) {  // you need to login to create a question box
            req.session.message = 'User account not found. Please login again.';
            req.session.messageType = 'error';
            req.session.destroy();
            return res.redirect('/login');
        }
        req.session.user.id = user.id;
        const postId = await data.addPost(user.id, title, content);
        req.session.message = 'Post created successfully';
        req.session.messageType = 'success';
        res.redirect(`/post/${postId}`);
    } catch (error) {
        console.error('Error creating post');
        req.session.message = 'Failed to create post. Please try again.';
        req.session.messageType = 'error';
        res.redirect('/post/new');
    }
});

app.get('/post/:id', async (req, res) => {
    const post = await data.getPostById(req.params.id);
    if (!post) {
        return res.status(404).render('404', {title : '404 - Not Found'});
    }
    const comments = await data.getCommentsByPostId(req.params.id);
    for (let comment of comments) {
        comment.replies = await data.getRepliesByCommentId(comment.id);
    }
    res.render('post', {post, comments, title : post.title});
});

app.get('/post/:id/edit', requireLogin, async (req, res) => {
    const post = await data.getPostById(req.params.id);
    if (!post) {
        return res.status(404).render('404', {title : '404 - Not Found'});
    }
    if (post.author_id !== req.session.user.id && !req.session.user.isAdmin) {
        req.session.message = 'You do not have permission to edit this post';
        req.session.messageType = 'error';
        return res.redirect(`/post/${req.params.id}`);
    }
    res.render('post-form', {title : 'Edit Post', post, isEdit : true});
});

app.post('/post/:id/edit', requireLogin, async (req, res) => {
    const ownerId = await data.getPostOwner(req.params.id);
    if (ownerId !== req.session.user.id && !req.session.user.isAdmin) {
        return res.status(403).json({error : 'Permission denied'});
    }
    const {title, content} = req.body;
    if (!title || !content) {
        req.session.message = 'Title and content are required';
        req.session.messageType = 'error';
        return res.redirect(`/post/${req.params.id}/edit`);
    }
    await data.updatePost(req.params.id, title, content);
    req.session.message = 'Post updated';
    req.session.messageType = 'success';
    res.redirect(`/post/${req.params.id}`);
});

app.post('/post/:id/delete', requireLogin, async (req, res) => {
    const ownerId = await data.getPostOwner(req.params.id);
    if (ownerId !== req.session.user.id && !req.session.user.isAdmin) {
        return res.status(403).json({error : 'Permission denied'});
    }
    await data.deletePost(req.params.id);
    req.session.message = 'Post deleted successfully';
    req.session.messageType = 'success';
    res.redirect('/');
});

app.post('/api/comment', requireLogin, async (req, res) => {
    const {post_id, content, is_anonymous} = req.body;
    if (!post_id || !content) {
        return res.status(400).json({error : 'Missing required fields'});
    }
    try {
        const user = await data.getUserByUsername(req.session.user.username);
        if (!user) {
            return res.status(401).json(
                {error : 'User not found. Please login again.'});
        }
        req.session.user.id = user.id;
        const commentId = await data.addComment(
            post_id,
            user.id,
            content,
            is_anonymous === 'true' || is_anonymous === true);
        const comment = await data.getCommentById(commentId);
        res.json({
            success : true,
            comment : {
                id : comment.id,
                content : comment.content,
                is_anonymous : comment.is_anonymous,
                username : comment.username,
                user_id : comment.user_id,
                created_at : comment.created_at
            }
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json(
            {error : 'Failed to add comment. Please try again.'});
    }
});

app.delete('/api/comment/:id', requireLogin, async (req, res) => {
    const ownerId = await data.getCommentOwner(req.params.id);
    if (ownerId !== req.session.user.id && !req.session.user.isAdmin) {
        return res.status(403).json({error : 'Permission denied'});
    }
    await data.deleteComment(req.params.id);
    res.json({success : true});
});

app.post('/api/reply', requireLogin, async (req, res) => {
    const {comment_id, content, is_anonymous} = req.body;
    if (!comment_id || !content) {
        return res.status(400).json({error : 'Missing required fields'});
    }
    try {
        const user = await data.getUserByUsername(req.session.user.username);
        if (!user) {
            return res.status(401).json(
                {error : 'User not found. Please login again.'});
        }
        req.session.user.id = user.id;
        const comment = await data.getCommentById(comment_id);
        if (!comment) {
            return res.status(404).json({error : 'Comment not found'});
        }
        const post = await data.getPostById(comment.post_id);
        const isPostAuthor = post.author_id === user.id;
        const isCommentAuthor = comment.user_id === user.id;
        const isAdmin = user.isAdmin;
        if (!isPostAuthor && !isCommentAuthor && !isAdmin) {
            return res.status(403).json({error : 'Permission denied'});
        }
        const replyId = await data.addReply(
            comment_id,
            user.id,
            content,
            is_anonymous === 'true' || is_anonymous === true);
        const reply = await data.getReplyById(replyId);
        res.json({
            success : true,
            reply : {
                id : reply.id,
                content : reply.content,
                is_anonymous : reply.is_anonymous,
                username : reply.username,
                user_id : reply.user_id,
                created_at : reply.created_at
            }
        });
    } catch (error) {
        console.error('Error adding reply:', error);
        res.status(500).json(
            {error : 'Failed to add reply. Please try again.'});
    }
});

app.delete('/api/reply/:id', requireLogin, async (req, res) => {
    const ownerId = await data.getReplyOwner(req.params.id);
    if (ownerId !== req.session.user.id && !req.session.user.isAdmin) {
        return res.status(403).json({error : 'Permission denied'});
    }
    await data.deleteReply(req.params.id);
    res.json({success : true});
});

app.use((req, res) => {
    res.status(404).render('404', {title : '404 - Not Found'});
});

app.listen(port, () => {
    console.log(`Starting server http://localhost:${port}`);
});
