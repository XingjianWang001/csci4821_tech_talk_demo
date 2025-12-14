
DROP TABLE IF EXISTS tbl_replies;
DROP TABLE IF EXISTS tbl_comments;
DROP TABLE IF EXISTS tbl_posts;
DROP TABLE IF EXISTS tbl_accounts;

CREATE TABLE tbl_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    isAdmin TINYINT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tbl_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES tbl_accounts(id) ON DELETE CASCADE
);

CREATE TABLE tbl_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    is_anonymous TINYINT DEFAULT 0,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES tbl_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES tbl_accounts(id) ON DELETE CASCADE
);

CREATE TABLE tbl_replies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comment_id INT NOT NULL,
    user_id INT NOT NULL,
    is_anonymous TINYINT DEFAULT 0,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES tbl_comments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES tbl_accounts(id) ON DELETE CASCADE
);

CREATE INDEX idx_posts_created ON tbl_posts(created_at DESC);
CREATE INDEX idx_comments_post ON tbl_comments(post_id);
CREATE INDEX idx_replies_comment ON tbl_replies(comment_id);
