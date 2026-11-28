const fs = require('fs');
const path = require('path');
const {DatabaseSync} = require('node:sqlite');

// Local SQLite file, created on first run. Delete it to reset all data.
const dbPath = process.env.DB_PATH || path.join(__dirname, 'data.db');
const db = new DatabaseSync(dbPath);
db.exec('PRAGMA foreign_keys = ON');  // needed for ON DELETE CASCADE
db.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

function getCentralTime() {
    const date = new Date();
    const centralTime =
        new Date(date.toLocaleString('en-US', {timeZone : 'America/Chicago'}));
    const year = centralTime.getFullYear();
    const month = String(centralTime.getMonth() + 1).padStart(2, '0');
    const day = String(centralTime.getDate()).padStart(2, '0');
    const hours = String(centralTime.getHours()).padStart(2, '0');
    const minutes = String(centralTime.getMinutes()).padStart(2, '0');
    const seconds = String(centralTime.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// SQLite stores dates as text; turn them back into Date objects so views and
// the JSON API get the same values they did with MySQL.
function toDate(value) {
    return value ? new Date(value.replace(' ', 'T')) : value;
}

function normalize(row) {
    if (!row) return null;
    const result = {...row};
    if ('created_at' in result) result.created_at = toDate(result.created_at);
    if ('updated_at' in result) result.updated_at = toDate(result.updated_at);
    return result;
}

function all(sql, params) {
    return db.prepare(sql).all(...params).map(normalize);
}

function get(sql, params) {
    return normalize(db.prepare(sql).get(...params));
}

function run(sql, params) {
    const result = db.prepare(sql).run(...params);
    return Number(result.lastInsertRowid);
}

// users
async function addUser(username, hashedPassword) {
    return run('INSERT INTO tbl_accounts (username, password) VALUES (?, ?)',
               [ username, hashedPassword ]);
}

async function getUserByUsername(username) {
    return get('SELECT * FROM tbl_accounts WHERE username = ?', [ username ]);
}

async function makeUserAdmin(userId) {
    run('UPDATE tbl_accounts SET isAdmin = 1 WHERE id = ?', [ userId ]);
}

// posts
async function addPost(authorId, title, content) {
    return run(
        'INSERT INTO tbl_posts (author_id, title, content, created_at) VALUES (?, ?, ?, ?)',
        [ authorId, title, content, getCentralTime() ]);
}

async function getRecentPosts(limit, offset) {
    return all(`SELECT p.*, a.username as author_name,
             (SELECT COUNT(*) FROM tbl_comments WHERE post_id = p.id) as comment_count
             FROM tbl_posts p
             JOIN tbl_accounts a ON p.author_id = a.id
             ORDER BY p.created_at DESC, p.id DESC
             LIMIT ? OFFSET ?`,
               [ limit, offset ]);
}

async function getTotalPostsCount() {
    return get('SELECT COUNT(*) as count FROM tbl_posts', []).count;
}

async function getPostById(id) {
    return get(`SELECT p.*, a.username as author_name, a.id as author_id
             FROM tbl_posts p
             JOIN tbl_accounts a ON p.author_id = a.id
             WHERE p.id = ?`,
               [ id ]);
}

async function getPostOwner(id) {
    const row = get('SELECT author_id FROM tbl_posts WHERE id = ?', [ id ]);
    return row ? row.author_id : null;
}

async function updatePost(id, title, content) {
    run('UPDATE tbl_posts SET title = ?, content = ?, updated_at = ? WHERE id = ?',
        [ title, content, getCentralTime(), id ]);
}

async function deletePost(id) {
    run('DELETE FROM tbl_posts WHERE id = ?', [ id ]);
}

// comments
async function addComment(postId, userId, content, isAnonymous) {
    return run(
        'INSERT INTO tbl_comments (post_id, user_id, content, is_anonymous, created_at) VALUES (?, ?, ?, ?, ?)',
        [ postId, userId, content, isAnonymous ? 1 : 0, getCentralTime() ]);
}

async function getCommentsByPostId(postId) {
    return all(`SELECT c.*, a.username
             FROM tbl_comments c
             JOIN tbl_accounts a ON c.user_id = a.id
             WHERE c.post_id = ?
             ORDER BY c.created_at ASC, c.id ASC`,
               [ postId ]);
}

async function getCommentOwner(id) {
    const row = get('SELECT user_id FROM tbl_comments WHERE id = ?', [ id ]);
    return row ? row.user_id : null;
}

async function deleteComment(id) {
    run('DELETE FROM tbl_comments WHERE id = ?', [ id ]);
}

async function getCommentById(id) {
    return get(`SELECT c.*, a.username
             FROM tbl_comments c
             JOIN tbl_accounts a ON c.user_id = a.id
             WHERE c.id = ?`,
               [ id ]);
}

// replies
async function addReply(commentId, userId, content, isAnonymous) {
    return run(
        'INSERT INTO tbl_replies (comment_id, user_id, content, is_anonymous, created_at) VALUES (?, ?, ?, ?, ?)',
        [ commentId, userId, content, isAnonymous ? 1 : 0, getCentralTime() ]);
}

async function getRepliesByCommentId(commentId) {
    return all(`SELECT r.*, a.username
             FROM tbl_replies r
             JOIN tbl_accounts a ON r.user_id = a.id
             WHERE r.comment_id = ?
             ORDER BY r.created_at ASC, r.id ASC`,
               [ commentId ]);
}

async function getReplyById(id) {
    return get(`SELECT r.*, a.username
             FROM tbl_replies r
             JOIN tbl_accounts a ON r.user_id = a.id
             WHERE r.id = ?`,
               [ id ]);
}

async function getReplyOwner(id) {
    const row = get('SELECT user_id FROM tbl_replies WHERE id = ?', [ id ]);
    return row ? row.user_id : null;
}

async function deleteReply(id) {
    run('DELETE FROM tbl_replies WHERE id = ?', [ id ]);
}

module.exports = {
    addUser,
    getUserByUsername,
    makeUserAdmin,
    addPost,
    getRecentPosts,
    getTotalPostsCount,
    getPostById,
    getPostOwner,
    updatePost,
    deletePost,
    addComment,
    getCommentsByPostId,
    getCommentOwner,
    deleteComment,
    getCommentById,
    addReply,
    getRepliesByCommentId,
    getReplyById,
    getReplyOwner,
    deleteReply,
    getCentralTime,
};
