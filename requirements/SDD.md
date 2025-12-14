
---

# Software Design Document (SDD)
## 项目名称: Q&A Box Blog Platform (Shiba Blog)
**Version:** 1.0
**Reference:** Based on Homework 6 Architecture
**Target Audience:** AI Coding Agent / Developer

---

## 1. 系统架构与项目结构 (System Architecture)

### 1.1 目录结构
项目应与 `Homework6` 文件夹位于同一父目录下。保持与 HW6 相同的扁平化+资源分离结构：

```text
/FinalProject
│
├── package.json          (Dependencies: express, mysql2, pug, bcrypt, express-session)
├── server.js             (Entry point, follows HW6 server.js pattern)
├── data.js               (Database logic, follows HW6 data.js pattern)
├── db-con.js             (Database connection pool config - separated for security)
├── schema.sql            (SQL to create tables)
├── readme.txt            (Required by PDF)
│
├── views/                (Pug Templates)
│   ├── layout.pug        (Master template: Header, Sidebar, Footer)
│   ├── index.pug         (Home: Post list/previews)
│   ├── post.pug          (Detail: Full post + comments)
│   ├── login.pug         (Login form)
│   ├── register.pug      (Register form)
│   ├── post-form.pug     (Create/Edit post)
│   └── 404.pug           (Error page)
│
└── resources/            (Static files)
    ├── css/
    │   └── main.css      (Based on HW6 styling)
    ├── js/
    │   └── main.js       (Client-side AJAX for comments)
    └── images/           (Assets)
```

### 1.2 技术栈指令
*   **Server:** Node.js + Express.
*   **Database:** MySQL (accessed via `mysql2/promise`).
*   **Templating:** Pug.
*   **Auth:** `express-session` for state, `bcrypt` for password hashing.
*   **Styling:** Native CSS (Flexbox/Grid), strict adherence to HW6 color palette.

---

## 2. 数据库设计 (Data Layer Design)

### 2.1 数据库连接 (`db-con.js` & `data.js`)
*   **Pattern:** 必须完全参照 HW6 的 `data.js`。
*   使用 `mysql.createPool`。
*   所有数据库函数必须是 `async` 的。
*   **必须使用** `try...finally` 块来确保 `conn.release()` 被调用。
*   **SQL注入防护:** 所有参数必须通过 `?` 占位符传递，严禁字符串拼接 SQL。

### 2.2 Schema Definitions (`schema.sql`)

```sql
-- Table: tbl_accounts
CREATE TABLE tbl_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    isAdmin TINYINT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Table: tbl_posts (The Q&A Boxes)
CREATE TABLE tbl_posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    author_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES tbl_accounts(id) ON DELETE CASCADE
);

-- Table: tbl_comments
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
```

### 2.3 数据访问函数 (`data.js`)
在 `data.js` 中实现以下函数导出给 `server.js` 使用：

1.  **Users:**
    *   `addUser(username, hashedPassword)`: Returns new user ID.
    *   `getUserByUsername(username)`: Returns user object (for login).
    *   `makeUserAdmin(userId)`: Sets `isAdmin = 1`.
2.  **Posts:**
    *   `addPost(authorId, title, content)`: Returns new post ID.
    *   `getRecentPosts(limit, offset)`: Returns list of posts with author username.
    *   `getTotalPostsCount()`: Returns total number of posts (for pagination calculation).
    *   `getPostById(id)`: Returns single post object with author info.
    *   `getPostOwner(id)`: Returns author_id of a post (for permission checking).
    *   `deletePost(id)`: Deletes post.
    *   `updatePost(id, title, content)`: Updates post and `updated_at` timestamp.
3.  **Comments:**
    *   `addComment(postId, userId, content, isAnonymous)`: Returns new comment ID.
    *   `getCommentsByPostId(postId)`: Returns list of comments joined with `tbl_accounts` (to get real usernames for Admin view).
    *   `getCommentOwner(id)`: Returns user_id of a comment (for permission checking).
    *   `deleteComment(id)`: Deletes comment.

---

## 3. 服务器逻辑设计 (Server Design)

### 3.1 Middleware Configuration (`server.js`)
*   **Reference HW6:** Use `app.use(express.urlencoded({extended: true}))` and `app.use(express.json())`.
*   **Session:** Configure `express-session`:
    ```javascript
    app.use(session({
        secret: 'shiba_inu_secret_key', // In prod use env var
        resave: false,
        saveUninitialized: true
    }));
    ```
*   **Auth Middleware:** Create a helper middleware `requireLogin` to protect routes like `/post/new`.
*   **View Locals & Message Handling:** Use middleware to pass session data to templates:
    ```javascript
    app.use((req, res, next) => {
        res.locals.user = req.session.user;
        // Pass message to template if exists, then clear it
        res.locals.message = req.session.message;
        res.locals.messageType = req.session.messageType; // 'success' or 'error'
        delete req.session.message;
        delete req.session.messageType;
        next();
    });
    ```

### 3.2 路由规范 (Route Specification)

| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | 支持分页参数：`?page=1`（默认为1）。每页显示10条posts（可配置）。计算offset：`(page-1)*limit`。调用`data.getRecentPosts(limit, offset)`和`data.getTotalPostsCount()`。Render `index.pug`，传入posts数组、当前页码、总页数等。 | Public |
| `GET` | `/post/:id` | Fetch post + comments. Render `post.pug`. | Public |
| `GET` | `/login` | Render login form. | Public |
| `POST` | `/login` | Validate creds using `bcrypt.compare`. Set `req.session.user`. | Public |
| `GET` | `/register` | Render register form. | Public |
| `POST` | `/register` | Hash password, call `data.addUser`. | Public |
| `GET` | `/logout` | Destroy session. Redirect `/`. | Public |
| `GET` | `/make-me-admin-please` | **Admin彩蛋路由（参考SRS FR-03）：**<br>1. 检查用户是否已登录（`req.session.user`）。<br>2. **如果未登录**：设置`req.session.message = "To become an admin, you need to log in first"`和`req.session.messageType = "error"`，重定向到`/login`。<br>3. **如果已登录**：调用`data.makeUserAdmin(userId)`，更新session（`req.session.user.isAdmin = 1`），设置`req.session.message = "You are now Admin! 🎉"`和`req.session.messageType = "success"`，重定向到`/`。 | User |
| `GET` | `/post/new` | Render `post-form.pug`. | User |
| `POST` | `/post/new` | Call `data.addPost`. Redirect `/`. | User |
| `GET`  | `/post/:id/edit` | 显示编辑表单。权限检查：仅Post作者或Admin可访问。如果用户未登录或无权限，重定向到登录页或提示错误。Render `post-form.pug` with existing post data. | User/Admin |
| `POST` | `/post/:id/edit` | 处理编辑请求。调用`data.updatePost(id, title, content)`。权限检查：验证当前用户是作者（通过`data.getPostOwner(id)`）或Admin。成功后重定向到`/post/:id`。 | User/Admin |
| `POST` | `/api/comment` | JSON API. Call `data.addComment`. Return JSON with new comment HTML or data. | User |
| `DELETE`| `/api/post/:id` | Delete post. 权限检查：仅Post作者或Admin可删除。 | Admin/Owner |
| `DELETE`| `/api/comment/:id` | 删除评论。权限检查：评论作者（通过`data.getCommentOwner(id)`）或Admin可删除。返回JSON `{success: true}` 或错误信息。 | User/Admin |

---

## 4. 前端界面设计 (Interface Design)

### 4.1 视觉风格 (Visual Style - CSS)
**Constraint:** 必须继承 HW6 `main.css` 的配色方案和字体，但针对博客布局进行调整。

*   **Color Palette (Inherited):**
    *   Background: `#fffdea` (Cream)
    *   Header/Nav: `#f5eeae` (Light Yellow) -> Hover: `#e5deae` (Darker Yellow)
    *   Cards/Containers: `#eae9e1` (Light Grey)
    *   Text Emphasis: `darkgoldenrod`, `darkorange`
    *   Tables/Borders: `#e5deae` / `#ccc`

*   **Layout Components:**
    *   **Navbar:** Flexbox row, similar to HW6 `nav`. Right-aligned links.
    *   **Container:** Main content wrapper with `max-width: 1200px` and `margin: 0 auto`.
    *   **Card (Post Preview):**
        *   Background: `#f0f0f0` (or white).
        *   Border: `1px solid #e5deae`.
        *   Border Radius: `10px`.
        *   Padding: `20px`.
        *   Margin: `15px 0`.
        *   Shadow: `0 2px 4px rgba(0,0,0,0.1)`.
    *   **Buttons:** Style like HW6 nav items (background `#f5eeae`, padding `10px 20px`, rounded).

### 4.2 模板结构 (Pug)

*   **`layout.pug`**:
    *   **Header:** Dynamic based on `user` variable.
        *   If user: Show "Welcome [User]", "New Box", "Logout".
        *   If guest: Show "Login", "Register".
    *   **Messages:** Display success/error messages from session:
        ```pug
        if message
            .message(class=messageType)= message
        ```
        *   Style `.message.success` with green background, `.message.error` with red background.
    *   **Sidebar:**
        *   导航链接：
            - 🏠 Home (`/`) - 显示最新提问箱
            - 📚 Browse All (`/?page=1`) - 浏览所有文章（分页）
            - ✏️ My Posts (`/my-posts`) - 我的文章（仅登录后显示，可选实现）
            - ℹ️ About - 关于页面（可选）
        *   使用`nav`标签包裹，样式参考HW6的导航栏。
        *   响应式：桌面端固定在左侧，移动端可折叠或移至顶部。
    *   **Block Content:** Where page-specific content goes.
    *   **Footer:** Simple copyright (e.g., "© 2025 Q&A Box Blog | CSCI4131 Final Project").

*   **`index.pug` (Home Page)**:
    *   显示Post列表（使用mixin渲染卡片）。
    *   **分页导航：**
        *   如果 `currentPage > 1`：显示"上一页"链接 `?page=#{currentPage-1}`
        *   如果 `currentPage < totalPages`：显示"下一页"链接 `?page=#{currentPage+1}`
        *   可选：显示页码按钮 `1 2 3 ... N`
        *   示例结构：
            ```pug
            .pagination
                if currentPage > 1
                    a(href=`/?page=${currentPage-1}`) ← Previous
                span Page #{currentPage} of #{totalPages}
                if currentPage < totalPages
                    a(href=`/?page=${currentPage+1}`) Next →
            ```

*   **`post.pug` (Detail)**:
    *   Display Post Title (`h1`) and Content (`div` with `white-space: pre-wrap`).
    *   **Comment Section:**
        *   Loop through comments.
        *   **Anonymous Logic:**
            ```pug
            if comment.is_anonymous && !user.isAdmin
                strong Anonymous
            else
                strong= comment.username
                if comment.is_anonymous
                    span (Anonymous)
            ```
        *   **Form:** Textarea + Checkbox "Post Anonymously" + Submit Button.

---

## 5. 客户端逻辑 (`main.js`)

### 5.1 异步评论 (AJAX)
*   监听评论表单的 `submit` 事件。
*   `e.preventDefault()` 阻止跳转。
*   收集数据：`post_id`, `content`, `is_anonymous`.
*   使用 `fetch('/api/comment', ...)` 发送 POST 请求。
*   **Success:**
    *   解析返回的 JSON。
    *   动态创建 HTML 元素 (div class="comment")。
    *   插入到评论列表底部。
    *   清空输入框。
*   **Error:** `alert()` 错误信息。

---

## 6. 指令给 Coding Agent (Instructions to Coding Agent)

在生成代码时，请遵循以下规则：

1.  **Data Layer First:** 编写 `data.js` 时，直接复制 HW6 的连接池配置和 `try...finally` 模式。不要引入 ORM（如 Sequelize），使用原生 SQL。
2.  **Route Implementation:** `server.js` 中不要把逻辑堆在路由里，尽量调用 `data.js` 的函数。
3.  **Security:** 必须使用 `bcrypt.hash` 处理密码，使用 `bcrypt.compare` 验证密码。
4.  **Admin Feature:** 确保 `/make-me-admin-please` 路由逻辑简单且有效（Update database -> Update Session）。
5.  **CSS Adaption:** 编写 CSS 时，引用 HW6 `main.css` 的 class 名（如 `.content`, `nav`, `body`），但扩展它以支持 `.card`, `.comment-section`, `.form-group`。保持颜色一致性。
6.  **Pug Mixins:** 如果可能，使用 Mixin 来渲染 Post Preview 卡片，以保持代码整洁。
7.  **No Node Modules:** 生成文件结构时，提醒用户不要提交 `node_modules`。

---
