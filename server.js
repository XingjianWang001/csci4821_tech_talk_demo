const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const data = require('./data');
const {FIELD_MESSAGES, blankMessage} = require('./resources/js/field-messages');
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

// One date format for question boxes, comments and replies: no seconds.
// The comment and reply APIs send created_label from this too, so items
// added in the browser show the same clock time as server-rendered ones.
// Dates in the current year leave the year out ("Nov 27, 5:20 PM"): it is
// noise in every meta line, and Atkinson's slashed zero made "2026" read
// oddly. Older dates keep it.
const dateFormatThisYear = new Intl.DateTimeFormat('en-US', {
    month : 'short',
    day : 'numeric',
    hour : 'numeric',
    minute : '2-digit'
});
const dateFormat = new Intl.DateTimeFormat('en-US', {
    month : 'short',
    day : 'numeric',
    year : 'numeric',
    hour : 'numeric',
    minute : '2-digit'
});

function formatDate(value) {
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const format = date.getFullYear() === new Date().getFullYear()
                       ? dateFormatThisYear
                       : dateFormat;
    return format.format(date);
}

// List previews: whitespace collapsed, cut on a word boundary within the
// 200-character budget.
function excerpt(text, limit = 200) {
    const flat = String(text).replace(/\s+/g, ' ').trim();
    if (flat.length <= limit) return flat;
    const cut = flat.slice(0, limit);
    const lastSpace = cut.lastIndexOf(' ');
    // A single huge word has no boundary to cut on; cut it mid-word.
    const end = lastSpace > limit / 2 ? lastSpace : limit;
    return cut.slice(0, end).replace(/[\s.,;:!?-]+$/, '') + '…';
}

// For <time datetime>: '' instead of a RangeError on an unparsable date.
function isoDate(value) {
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

app.locals.formatDate = formatDate;
app.locals.isoDate = isoDate;
app.locals.excerpt = excerpt;

app.use((req, res, next) => {
    res.locals.currentPath = req.path;
    res.locals.user = req.session.user;
    res.locals.message = req.session.message;
    res.locals.messageType = req.session.messageType;
    res.locals.clearDraft = req.session.clearDraft;
    res.locals.clearAllDrafts = req.session.clearAllDrafts;
    res.locals.loginHref = authLink('/login', req);
    res.locals.registerHref = authLink('/register', req);
    delete req.session.message;
    delete req.session.messageType;
    delete req.session.clearDraft;
    delete req.session.clearAllDrafts;
    next();
});

function requireLogin(req, res, next) {
    if (!req.session.user) {
        if (req.method === 'GET') {
            req.session.returnTo = req.originalUrl;
            req.session.message = 'Log in to continue.';
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

// Question box form: a message per blank field for the form to show next to
// it. When it's ok, the title is saved trimmed and the content exactly as
// typed (line breaks matter). blankMessage is the only blank check.
function checkQuestionBox(body) {
    const errors = fieldErrors({
        title : blankMessage(body.title, 'title'),
        content : blankMessage(body.content)
    });
    const ok = Object.keys(errors).length === 0;
    return {
        title : ok ? body.title.trim() : '',
        content : ok ? body.content : '',
        errors,
        ok
    };
}

// Drops the fields with no message, so `errors` only names real problems.
function fieldErrors(messages) {
    return Object.fromEntries(
        Object.entries(messages).filter(([ , message ]) => message));
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
               {posts, currentPage : page, totalPages, title : 'Question Box Blog'});
});

app.get('/register', (req, res) => {
    const returnTo = localPath(req.query.returnTo, req);
    if (returnTo) req.session.returnTo = returnTo;
    res.render('register', {title : 'Register', username : ''});
});

// Usernames are compared and stored trimmed, so " devon " and "devon" are the
// same person and a name made only of spaces is empty.
function cleanUsername(value) {
    return typeof value === 'string' ? value.trim() : '';
}

app.post('/register', async (req, res) => {
    const {password, password2} = req.body;
    const username = cleanUsername(req.body.username);
    // Field errors re-show the form (400) with the message under the field
    // and the username kept; flashes are only for outcomes.
    const fail = (errors) => res.status(400).render(
        'register', {title : 'Register', username, errors});
    const blank = fieldErrors({
        username : blankMessage(req.body.username),
        password : blankMessage(password, 'password'),
        password2 : blankMessage(password2, 'password')
    });
    if (Object.keys(blank).length) return fail(blank);
    if (password !== password2) {
        return fail({password2 : FIELD_MESSAGES.passwordMismatch});
    }
    const existingUser = await data.getUserByUsername(username);
    if (existingUser) {
        return fail({username : FIELD_MESSAGES.usernameTaken});
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = await data.addUser(username, hashedPassword);
    req.session.user = {id : userId, username, isAdmin : 0};
    req.session.message = `Account created. Welcome, ${username}!`;
    req.session.messageType = 'success';
    res.redirect(takeReturnTo(req));
});

app.get('/login', (req, res) => {
    const returnTo = localPath(req.query.returnTo, req);
    if (returnTo) req.session.returnTo = returnTo;
    res.render('login', {title : 'Log In', username : ''});
});

app.post('/login', async (req, res) => {
    const {password} = req.body;
    const username = cleanUsername(req.body.username);
    const fail = (errors) => res.status(400).render(
        'login', {title : 'Log In', username, errors});
    const blank = fieldErrors({
        username : blankMessage(req.body.username),
        password : blankMessage(password, 'password')
    });
    if (Object.keys(blank).length) return fail(blank);
    // An unknown username and a wrong password get the same message, at the
    // password field, so the form never says which part was wrong.
    const user = await data.getUserByUsername(username);
    const match = user && await bcrypt.compare(password, user.password);
    if (!match) {
        return fail({password : FIELD_MESSAGES.wrongCredentials});
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

// Logging out is a POST from the header form, so a prefetch, crawler or
// stray image request can't end someone's session. A GET just goes home.
app.get('/logout', (req, res) => res.redirect('/'));

app.post('/logout', (req, res, next) => {
    // A fresh, empty session carries the goodbye flash; the old one (and
    // everything in it) is gone. clearAllDrafts tells main.js to remove
    // every saved draft, so the next person at this computer sees none.
    req.session.regenerate((err) => {
        if (err) return next(err);
        req.session.message = "You're logged out. See you next time!";
        req.session.messageType = 'success';
        req.session.clearAllDrafts = true;
        res.redirect('/');
    });
});

app.get(
    '/make-me-admin-please',
    async (req,
           res) => {  // This Easter egg enables you to become an administrator.
                      // Login is required for it to take effect.
        if (!req.session.user) {
            req.session.message = 'Log in first, then open this page again to become an admin.';
            req.session.messageType = 'error';
            return res.redirect('/login');
        }
        await data.makeUserAdmin(req.session.user.id);
        req.session.user.isAdmin = 1;
        req.session.message = "You're now an admin. You can edit or delete any question box, comment or reply, and see who wrote anonymous ones.";
        req.session.messageType = 'success';
        res.redirect('/');
    });

app.get('/post/new', requireLogin, (req, res) => {
    res.render('post-form',
               {title : 'New Question Box', post : null, isEdit : false});
});

app.post('/post/new', requireLogin, async (req, res) => {
    const {title, content, errors, ok} = checkQuestionBox(req.body);
    if (!ok) {
        // Re-show the form with what was typed and an error at each field.
        return res.status(400).render('post-form', {
            title : 'New Question Box',
            post : null,
            isEdit : false,
            values : req.body,
            errors
        });
    }
    try {
        const user = await data.getUserByUsername(req.session.user.username);
        if (!user) {  // you need to login to create a question box
            req.session.message = "Your account couldn't be found. Log in again to continue.";
            req.session.messageType = 'error';
            req.session.destroy();
            return res.redirect('/login');
        }
        req.session.user.id = user.id;
        const postId = await data.addPost(user.id, title, content);
        req.session.message = 'Question box published.';
        req.session.messageType = 'success';
        req.session.clearDraft = 'draft:/post/new';
        res.redirect(`/post/${postId}`);
    } catch (error) {
        console.error('Error creating post');
        req.session.message = "Couldn't publish your question box. Please try again.";
        req.session.messageType = 'error';
        res.redirect('/post/new');
    }
});

app.get('/post/:id', async (req, res) => {
    const post = await data.getPostById(req.params.id);
    if (!post) {
        return res.status(404).render('404', {title : 'Page Not Found'});
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
        return res.status(404).render('404', {title : 'Page Not Found'});
    }
    if (post.author_id !== req.session.user.id && !req.session.user.isAdmin) {
        req.session.message = 'Only the author or an admin can edit this question box.';
        req.session.messageType = 'error';
        return res.redirect(`/post/${req.params.id}`);
    }
    res.render('post-form', {title : 'Edit Question Box', post, isEdit : true});
});

app.post('/post/:id/edit', requireLogin, async (req, res) => {
    const ownerId = await data.getPostOwner(req.params.id);
    if (ownerId === null) {
        return res.status(404).render('404', {title : 'Page Not Found'});
    }
    if (ownerId !== req.session.user.id && !req.session.user.isAdmin) {
        return denyPermission(req, res,
                              'Only the author or an admin can edit this question box.',
                              req.params.id);
    }
    const {title, content, errors, ok} = checkQuestionBox(req.body);
    if (!ok) {
        return res.status(400).render('post-form', {
            title : 'Edit Question Box',
            post : {id : req.params.id},
            isEdit : true,
            values : req.body,
            errors
        });
    }
    await data.updatePost(req.params.id, title, content);
    req.session.message = 'Question box updated.';
    req.session.messageType = 'success';
    req.session.clearDraft = `draft:/post/${req.params.id}/edit`;
    res.redirect(`/post/${req.params.id}`);
});

app.post('/post/:id/delete', requireLogin, async (req, res) => {
    const ownerId = await data.getPostOwner(req.params.id);
    if (ownerId === null) {
        return res.status(404).render('404', {title : 'Page Not Found'});
    }
    if (ownerId !== req.session.user.id && !req.session.user.isAdmin) {
        return denyPermission(req, res,
                              'Only the author or an admin can delete this question box.',
                              req.params.id);
    }
    const commentCount = (await data.getCommentsByPostId(req.params.id)).length;
    await data.deletePost(req.params.id);
    req.session.message = commentCount === 0
        ? 'Question box deleted.'
        : 'Question box deleted, along with its comments and replies.';
    req.session.messageType = 'success';
    res.redirect('/');
});

// The comment and reply APIs. A missing or unknown id is a problem with the
// page, not with what was typed, so it gets its own message and no `field`.
// Blank content is a field problem: {error, field: 'content'}, with the same
// wording the browser uses, so main.js shows it under the textarea.
function rejectBlankContent(res, content) {
    const message = blankMessage(content);
    if (message) res.status(400).json({error : message, field : 'content'});
    return Boolean(message);
}

app.post('/api/comment', requireApiLogin, async (req, res) => {
    const {post_id, content, is_anonymous} = req.body;
    if (!post_id) {
        return res.status(400).json({
            error : "Couldn't tell which question box this comment is for. Refresh the page and try again."
        });
    }
    if (rejectBlankContent(res, content)) return;
    try {
        const user = await data.getUserByUsername(req.session.user.username);
        if (!user) {
            return res.status(401).json(
                {error : "Your account couldn't be found. Log in again to continue."});
        }
        req.session.user.id = user.id;
        if (!await data.getPostById(post_id)) {
            return res.status(404).json({error : 'This question box no longer exists. Go back to the home page to see the latest ones.'});
        }
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
                created_at : comment.created_at,
                created_label : formatDate(comment.created_at)
            }
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json(
            {error : "Couldn't add your comment. Please try again."});
    }
});

app.delete('/api/comment/:id', requireApiLogin, async (req, res) => {
    const ownerId = await data.getCommentOwner(req.params.id);
    if (ownerId === null) {
        return res.status(404).json({error : 'This comment no longer exists. Refresh the page to see the latest comments.'});
    }
    if (ownerId !== req.session.user.id && !req.session.user.isAdmin) {
        return res.status(403).json({error : 'Only the author or an admin can delete this comment.'});
    }
    await data.deleteComment(req.params.id);
    res.json({success : true});
});

app.post('/api/reply', requireApiLogin, async (req, res) => {
    const {comment_id, content, is_anonymous} = req.body;
    if (!comment_id) {
        return res.status(400).json({
            error : "Couldn't tell which comment this reply is for. Refresh the page and try again."
        });
    }
    if (rejectBlankContent(res, content)) return;
    try {
        const user = await data.getUserByUsername(req.session.user.username);
        if (!user) {
            return res.status(401).json(
                {error : "Your account couldn't be found. Log in again to continue."});
        }
        req.session.user.id = user.id;
        const comment = await data.getCommentById(comment_id);
        if (!comment) {
            return res.status(404).json({error : 'This comment no longer exists. Refresh the page to see the latest comments.'});
        }
        const post = await data.getPostById(comment.post_id);
        const isPostAuthor = post.author_id === user.id;
        const isCommentAuthor = comment.user_id === user.id;
        const isAdmin = user.isAdmin;
        if (!isPostAuthor && !isCommentAuthor && !isAdmin) {
            return res.status(403).json({error : 'Only the question box author, the commenter or an admin can reply.'});
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
                created_at : reply.created_at,
                created_label : formatDate(reply.created_at)
            }
        });
    } catch (error) {
        console.error('Error adding reply:', error);
        res.status(500).json(
            {error : "Couldn't add your reply. Please try again."});
    }
});

app.delete('/api/reply/:id', requireApiLogin, async (req, res) => {
    const ownerId = await data.getReplyOwner(req.params.id);
    if (ownerId === null) {
        return res.status(404).json({error : 'This reply no longer exists. Refresh the page to see the latest replies.'});
    }
    if (ownerId !== req.session.user.id && !req.session.user.isAdmin) {
        return res.status(403).json({error : 'Only the author or an admin can delete this reply.'});
    }
    await data.deleteReply(req.params.id);
    res.json({success : true});
});

app.use((req, res) => {
    res.status(404).render('404', {title : 'Page Not Found'});
});

app.listen(port, () => {
    console.log(`Starting server http://localhost:${port}`);
});
