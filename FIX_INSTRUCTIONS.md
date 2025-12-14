# How to Fix Reply Feature Issues

## Problem 1: Foreign Key Constraint Error
The database needs to be updated with the new `tbl_replies` table.

## Problem 2: Reply Button Not Showing
Server needs to restart to load new code.

## Solution Steps:

### Step 1: Update Database Schema
Run the updated schema.sql file to recreate your database tables.

**On MySQL command line:**
```bash
mysql -u C4131F25U149 -p C4131F25U149 < schema.sql
```

**Or in MySQL Workbench/phpMyAdmin:**
1. Open schema.sql file
2. Execute all SQL statements
3. This will drop and recreate all tables with the new tbl_replies table

**IMPORTANT**: This will delete all existing data! If you want to preserve data, manually add just the tbl_replies table instead:

```sql
CREATE TABLE IF NOT EXISTS tbl_replies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    comment_id INT NOT NULL,
    user_id INT NOT NULL,
    is_anonymous TINYINT DEFAULT 0,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (comment_id) REFERENCES tbl_comments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES tbl_accounts(id) ON DELETE CASCADE
);

CREATE INDEX idx_replies_comment ON tbl_replies(comment_id);
```

### Step 2: Restart Your Server
1. Stop the current Node.js server (Ctrl+C in the terminal)
2. Start it again: `node server.js`

### Step 3: Test the Feature
1. Log in to your account
2. Go to a post you created
3. Look at any comment - you should now see a "Reply" button
4. Click Reply, write a reply, and submit
5. The reply should appear nested under the comment

## Expected Behavior:

**Who can reply to a comment:**
- Post author (you)
- Comment author (the person who wrote the comment)
- Admin users

**Reply button should show when:**
- You are the post author
- You are the comment author
- You are an admin

If you still don't see the Reply button after following these steps, please check:
1. Are you logged in?
2. Are you viewing your own post?
3. Check browser console for JavaScript errors (F12 > Console tab)
