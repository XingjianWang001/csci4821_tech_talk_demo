const mysql = require('mysql2/promise');

var connPool = mysql.createPool({
  connectionLimit: 5,
  host: 'cse-mysql-classes-02.cse.umn.edu',
  port: 3306,
  user: 'C4131F25U149',
  database: 'C4131F25U149',
  password: '22251',
});


function getCentralTime() {
  const date = new Date();
  const centralTime =
      new Date(date.toLocaleString('en-US', {timeZone: 'America/Chicago'}));
  const year = centralTime.getFullYear();
  const month = String(centralTime.getMonth() + 1).padStart(2, '0');
  const day = String(centralTime.getDate()).padStart(2, '0');
  const hours = String(centralTime.getHours()).padStart(2, '0');
  const minutes = String(centralTime.getMinutes()).padStart(2, '0');
  const seconds = String(centralTime.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// users
async function addUser(username, hashedPassword) {
  let conn;
  try {
    conn = await connPool.getConnection();
    const [result] = await conn.execute(
        'INSERT INTO tbl_accounts (username, password) VALUES (?, ?)',
        [username, hashedPassword]);
    return result.insertId;
  } finally {
    if (conn) conn.release();
  }
}

async function getUserByUsername(username) {
  let conn;
  try {
    conn = await connPool.getConnection();
    const [rows] = await conn.execute(
        'SELECT * FROM tbl_accounts WHERE username = ?', [username]);
    return rows[0] || null;
  } finally {
    if (conn) conn.release();
  }
}

async function makeUserAdmin(userId) {
  let conn;
  try {
    conn = await connPool.getConnection();
    await conn.execute(
        'UPDATE tbl_accounts SET isAdmin = 1 WHERE id = ?', [userId]);
  } finally {
    if (conn) conn.release();
  }
}

// posts
async function addPost(authorId, title, content) {
  let conn;
  try {
    conn = await connPool.getConnection();
    const [result] = await conn.execute(
        'INSERT INTO tbl_posts (author_id, title, content, created_at) VALUES (?, ?, ?, ?)',
        [authorId, title, content, getCentralTime()]);
    return result.insertId;
  } finally {
    if (conn) conn.release();
  }
}

async function getRecentPosts(limit, offset) {
  let conn;
  try {
    conn = await connPool.getConnection();
    const [rows] = await conn.query(
        `SELECT p.*, a.username as author_name,
             (SELECT COUNT(*) FROM tbl_comments WHERE post_id = p.id) as comment_count
             FROM tbl_posts p
             JOIN tbl_accounts a ON p.author_id = a.id
             ORDER BY p.created_at DESC
             LIMIT ? OFFSET ?`,
        [limit, offset]);
    return rows;
  } finally {
    if (conn) conn.release();
  }
}

async function getTotalPostsCount() {
  let conn;
  try {
    conn = await connPool.getConnection();
    const [rows] =
        await conn.execute('SELECT COUNT(*) as count FROM tbl_posts');
    return rows[0].count;
  } finally {
    if (conn) conn.release();
  }
}

async function getPostById(id) {
  let conn;
  try {
    conn = await connPool.getConnection();
    const [rows] = await conn.execute(
        `SELECT p.*, a.username as author_name, a.id as author_id
             FROM tbl_posts p
             JOIN tbl_accounts a ON p.author_id = a.id
             WHERE p.id = ?`,
        [id]);
    return rows[0] || null;
  } finally {
    if (conn) conn.release();
  }
}

async function getPostOwner(id) {
  let conn;
  try {
    conn = await connPool.getConnection();
    const [rows] = await conn.execute(
        'SELECT author_id FROM tbl_posts WHERE id = ?', [id]);
    return rows[0] ? rows[0].author_id : null;
  } finally {
    if (conn) conn.release();
  }
}

async function updatePost(id, title, content) {
  let conn;
  try {
    conn = await connPool.getConnection();
    await conn.execute(
        'UPDATE tbl_posts SET title = ?, content = ?, updated_at = ? WHERE id = ?',
        [title, content, getCentralTime(), id]);
  } finally {
    if (conn) conn.release();
  }
}

async function deletePost(id) {
  let conn;
  try {
    conn = await connPool.getConnection();
    await conn.execute('DELETE FROM tbl_posts WHERE id = ?', [id]);
  } finally {
    if (conn) conn.release();
  }
}

// comments
async function addComment(postId, userId, content, isAnonymous) {
  let conn;
  try {
    conn = await connPool.getConnection();
    const [result] = await conn.execute(
        'INSERT INTO tbl_comments (post_id, user_id, content, is_anonymous, created_at) VALUES (?, ?, ?, ?, ?)',
        [postId, userId, content, isAnonymous ? 1 : 0, getCentralTime()]);
    return result.insertId;
  } finally {
    if (conn) conn.release();
  }
}

async function getCommentsByPostId(postId) {
  let conn;
  try {
    conn = await connPool.getConnection();
    const [rows] = await conn.execute(
        `SELECT c.*, a.username
             FROM tbl_comments c
             JOIN tbl_accounts a ON c.user_id = a.id
             WHERE c.post_id = ?
             ORDER BY c.created_at ASC`,
        [postId]);
    return rows;
  } finally {
    if (conn) conn.release();
  }
}

async function getCommentOwner(id) {
  let conn;
  try {
    conn = await connPool.getConnection();
    const [rows] = await conn.execute(
        'SELECT user_id FROM tbl_comments WHERE id = ?', [id]);
    return rows[0] ? rows[0].user_id : null;
  } finally {
    if (conn) conn.release();
  }
}

async function deleteComment(id) {
  let conn;
  try {
    conn = await connPool.getConnection();
    await conn.execute('DELETE FROM tbl_comments WHERE id = ?', [id]);
  } finally {
    if (conn) conn.release();
  }
}

async function getCommentById(id) {
  let conn;
  try {
    conn = await connPool.getConnection();
    const [rows] = await conn.execute(
        `SELECT c.*, a.username
             FROM tbl_comments c
             JOIN tbl_accounts a ON c.user_id = a.id
             WHERE c.id = ?`,
        [id]);
    return rows[0] || null;
  } finally {
    if (conn) conn.release();
  }
}

// replies
async function addReply(commentId, userId, content, isAnonymous) {
  let conn;
  try {
    conn = await connPool.getConnection();
    const [result] = await conn.execute(
        'INSERT INTO tbl_replies (comment_id, user_id, content, is_anonymous, created_at) VALUES (?, ?, ?, ?, ?)',
        [commentId, userId, content, isAnonymous ? 1 : 0, getCentralTime()]);
    return result.insertId;
  } finally {
    if (conn) conn.release();
  }
}

async function getRepliesByCommentId(commentId) {
  let conn;
  try {
    conn = await connPool.getConnection();
    const [rows] = await conn.execute(
        `SELECT r.*, a.username
             FROM tbl_replies r
             JOIN tbl_accounts a ON r.user_id = a.id
             WHERE r.comment_id = ?
             ORDER BY r.created_at ASC`,
        [commentId]);
    return rows;
  } finally {
    if (conn) conn.release();
  }
}

async function getReplyById(id) {
  let conn;
  try {
    conn = await connPool.getConnection();
    const [rows] = await conn.execute(
        `SELECT r.*, a.username
             FROM tbl_replies r
             JOIN tbl_accounts a ON r.user_id = a.id
             WHERE r.id = ?`,
        [id]);
    return rows[0] || null;
  } finally {
    if (conn) conn.release();
  }
}

async function getReplyOwner(id) {
  let conn;
  try {
    conn = await connPool.getConnection();
    const [rows] = await conn.execute(
        'SELECT user_id FROM tbl_replies WHERE id = ?', [id]);
    return rows[0] ? rows[0].user_id : null;
  } finally {
    if (conn) conn.release();
  }
}

async function deleteReply(id) {
  let conn;
  try {
    conn = await connPool.getConnection();
    await conn.execute('DELETE FROM tbl_replies WHERE id = ?', [id]);
  } finally {
    if (conn) conn.release();
  }
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
