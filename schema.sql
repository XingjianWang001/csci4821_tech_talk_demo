-- SQLite schema. data.js runs this automatically on startup, so it must be
-- safe to run repeatedly. To reset all data, stop the server and delete data.db.

CREATE TABLE IF NOT EXISTS tbl_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    isAdmin INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tbl_posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT,
    FOREIGN KEY (author_id) REFERENCES tbl_accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tbl_comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    post_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    is_anonymous INTEGER DEFAULT 0,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES tbl_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES tbl_accounts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tbl_replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    comment_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    is_anonymous INTEGER DEFAULT 0,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES tbl_comments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES tbl_accounts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_posts_created ON tbl_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post ON tbl_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_replies_comment ON tbl_replies(comment_id);
