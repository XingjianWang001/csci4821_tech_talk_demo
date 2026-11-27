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
    rolling : true,  // every request pushes the expiry back
    // 24 hours. SESSION_MAX_AGE_MS lets a local run shorten it to test expiry.
    cookie : {
        maxAge : Number(process.env.SESSION_MAX_AGE_MS) || 1000 * 60 * 60 * 24
    }
}));

// Pages a user should never be sent back to after logging in.
const AUTH_PATHS = [ '/login', '/register', '/logout' ];

// Turn a returnTo value or a Referer header into a path on this site, or
// null. Anything that resolves to another origin (//evil.com, /\evil.com,
// https://evil.com) is rejected so it can't become an open redirect.
function localPath(value, req) {
    if (typeof value !== 'string' || value === '') return null;
    const origin = `${req.protocol}://${req.get('host')}`;
    let url;
    try {
        url = new URL(value, origin);
    } catch {
        return null;
    }
    if (url.origin !== origin || AUTH_PATHS.includes(url.pathname)) {
        return null;
    }
    return url.pathname + url.search;
}

// Login and register links carry the current page so the user comes back.
function authLink(page, req) {
    const here = req.originalUrl;
    if (here === '/' || AUTH_PATHS.includes(req.path)) return page;
    return `${page}?returnTo=${encodeURIComponent(here)}`;
}

// Where to go after a successful login or registration.
function takeReturnTo(req) {
    const target = localPath(req.session.returnTo, req) || '/';
    delete req.session.returnTo;
    return target;
}

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    res.locals.message = req.session.message;
    res.locals.messageType = req.session.messageType;
    res.locals.clearDraft = req.session.clearDraft;
    res.locals.loginHref = authLink('/login', req);
    res.locals.registerHref = authLink('/register', req);
    delete req.session.message;
    delete req.session.messageType;
    delete req.session.clearDraft;
    next();
});

function requireLogin(req, res, next) {
    if (!req.session.user) {
        if (req.method === 'GET') {
            req.session.returnTo = req.originalUrl;
            req.session.message = 'Please log in first';
        } else {
            // A form was submitted after the session ended. Send the user back
            // to the page the form was on; main.js kept the draft there.
            req.session.returnTo = localPath(req.get('Referer'), req);
            req.session.message =
                'Your session ended. Log in again and your draft will be there.';
        }
        req.session.messageType = 'error';
        return res.redirect('/login');
    }
    next();
}

// JSON endpoints answer 401 instead of redirecting, so fetch() callers can
// tell the session ended and keep what the user typed.
function requireApiLogin(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json(
            {error : 'Your session ended. Log in again.', sessionEnded : true});
    }
    next();
}

// Form POSTs answer permission errors with a flash on the post, not JSON.
function denyPermission(req, res, message, postId) {
    req.session.message = message;
    req.session.messageType = 'error';
    res.redirect(`/post/${postId}`);
}

app.get('/', async (req, res) => {
    const limit = 10;
    const totalCount = await data.getTotalPostsCount();
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    let page = 1;
    if (req.query.page !== undefined) {
        const requested = Number.parseInt(req.query.page, 10);
        page = Number.isNaN(requested)
                   ? 1
                   : Math.min(Math.max(requested, 1), totalPages);
        // ?page=99, ?page=0, ?page=-1 or ?page=abc go to the nearest real page
        if (String(page) !== req.query.page) {
            return res.redirect(`/?page=${page}`);
        }
    }
    const offset = (page - 1) * limit;
    const posts = await data.getRecentPosts(limit, offset);
    res.render('index',
               {posts, currentPage : page, totalPages, title : 'Q&A Box Blog'});
});

app.get('/register', (req, res) => {
    const returnTo = localPath(req.query.returnTo, req);
    if (returnTo) req.session.returnTo = returnTo;
    const username = req.session.formUsername || '';
    delete req.session.formUsername;
    res.render('register', {title : 'Register', username});
});

app.post('/register', async (req, res) => {
    const {username, password, password2} = req.body;
    // Validation errors keep the username for the next render of the form.
    const fail = (message) => {
        req.session.message = message;
        req.session.messageType = 'error';
        req.session.formUsername = typeof username === 'string' ? username : '';
        res.redirect('/register');
    };
    if (!username || !password || !password2) {
        return fail('All fields are required');
    }
    if (password !== password2) {
        return fail('Passwords do not match');
    }
    const existingUser = await data.getUserByUsername(username);
    if (existingUser) {
        return fail('Username already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await data.addUser(username, hashedPassword);
    req.session.user = {id : userId, username, isAdmin : 0};
    req.session.message = 'Registration successful';
    req.session.messageType = 'success';
    res.redirect(takeReturnTo(req));
});

app.get('/login', (req, res) => {
    const returnTo = localPath(req.query.returnTo, req);
    if (returnTo) req.session.returnTo = returnTo;
    const username = req.session.formUsername || '';
    delete req.session.formUsername;
    res.render('login', {title : 'Login', username});
});

app.post('/login', async (req, res) => {
    const {username, password} = req.body;
    const fail = (message) => {
        req.session.message = message;
        req.session.messageType = 'error';
        req.session.formUsername = typeof username === 'string' ? username : '';
        res.redirect('/login');
    };
    if (!username || !password) {
        return fail('Please enter username and password');
    }
    const user = await data.getUserByUsername(username);
    if (!user) {
        return fail('Invalid username or password');
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return fail('Invalid username or password');
    }
    req.session.user = {
        id : user.id,
        username : user.username,
        isAdmin : user.isAdmin
    };
    req.session.message = `Welcome back, ${user.username}!`;
    req.session.messageType = 'success';
    res.redirect(takeReturnTo(req));
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
        req.session.clearDraft = 'draft:/post/new';
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
    if (ownerId === null) {
        return res.status(404).render('404', {title : '404 - Not Found'});
    }
    if (ownerId !== req.session.user.id && !req.session.user.isAdmin) {
        return denyPermission(req, res,
                              'You do not have permission to edit this post',
                              req.params.id);
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
    req.session.clearDraft = `draft:/post/${req.params.id}/edit`;
    res.redirect(`/post/${req.params.id}`);
});

app.post('/post/:id/delete', requireLogin, async (req, res) => {
    const ownerId = await data.getPostOwner(req.params.id);
    if (ownerId === null) {
        return res.status(404).render('404', {title : '404 - Not Found'});
    }
    if (ownerId !== req.session.user.id && !req.session.user.isAdmin) {
        return denyPermission(req, res,
                              'You do not have permission to delete this post',
                              req.params.id);
    }
    await data.deletePost(req.params.id);
    req.session.message = 'Post deleted successfully';
    req.session.messageType = 'success';
    res.redirect('/');
});

app.post('/api/comment', requireApiLogin, async (req, res) => {
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

app.delete('/api/comment/:id', requireApiLogin, async (req, res) => {
    const ownerId = await data.getCommentOwner(req.params.id);
    if (ownerId === null) {
        return res.status(404).json({error : 'Comment not found'});
    }
    if (ownerId !== req.session.user.id && !req.session.user.isAdmin) {
        return res.status(403).json({error : 'Permission denied'});
    }
    await data.deleteComment(req.params.id);
    res.json({success : true});
});

app.post('/api/reply', requireApiLogin, async (req, res) => {
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

app.delete('/api/reply/:id', requireApiLogin, async (req, res) => {
    const ownerId = await data.getReplyOwner(req.params.id);
    if (ownerId === null) {
        return res.status(404).json({error : 'Reply not found'});
    }
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
