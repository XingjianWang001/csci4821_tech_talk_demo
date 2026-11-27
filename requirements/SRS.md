
---

# Software Requirements Specification (SRS)
## 项目名称: Q&A Box Blog Platform (提问箱博客平台)
**Version:** 2.0
**Date:** 2025-12-13

---

## 1. 简介 (Introduction)

### 1.1 目的 (Purpose)
本项目旨在构建一个基于 Web 的**提问箱式博客平台**。用户注册后可以发布"提问箱"（博客文章），其他**登录用户**可以在提问箱下方评论（可选择匿名或实名显示）。

**核心概念：**
*   **提问箱 (Question Box)** = **博客文章 (Blog Post)**
*   **评论 (Comment)** = 对提问箱（博客文章）的回复讨论

**这不是传统的"提问-回答"模式，而是：**
- 博主直接发布提问箱（博客内容）
- 读者直接评论提问箱

**关键澄清：**
*   **"匿名"的含义：** 前端显示可以是匿名的，但后端数据库始终记录真实用户ID（便于管理员追踪和权限管理）。
*   **权限要求：** 未登录用户只能浏览提问箱，不能发布提问箱或评论（符合PDF的A-grade要求）。

### 1.2 范围 (Scope)
系统将使用 Node.js (Express framework) 作为后端，MySQL 作为数据库，Pug 作为模板引擎。前端采用原生 JavaScript 和 CSS（需实现响应式布局）。系统需部署在 CSELabs 机器上，并支持 SSH 隧道连接数据库。

---

## 2. 总体描述 (Overall Description)

### 2.1 用户角色 (User Roles)
1.  **游客 (Guest/Visitor):**
    *   可以浏览所有已发布的提问箱（博客文章）和评论。
    *   **不能**发布提问箱、评论或修改任何数据（符合PDF A-grade要求）。

2.  **注册用户 (Registered User/Blogger):**
    *   拥有所有游客权限。
    *   可以发布提问箱（博客文章）。
    *   可以编辑和删除自己发布的提问箱。
    *   可以评论任何提问箱（可选择实名或匿名显示）。
    *   可以删除自己发表的评论。

3.  **管理员 (Admin):**
    *   拥有最高权限。
    *   可以删除任何提问箱或评论。
    *   可以查看"匿名"评论者的真实身份（用于管理和测试）。
    *   可以对任何内容进行操作（用于助教测试评分）。

### 2.2 核心流程 (User Flow)

**发布提问箱（博客）：**
1.  用户 A 注册并登录。
2.  用户 A 点击"新建提问箱"或"发布文章"。
3.  用户 A 填写标题和内容。
4.  系统创建一个 `Post` 记录（公开可见）。

**评论提问箱：**
1.  用户 B 登录后浏览提问箱。
2.  用户 B 在某个提问箱下方输入评论（可选择匿名显示）。
3.  系统创建一个 `Comment` 记录（关联到该提问箱）。
4.  评论立即显示（使用AJAX，不刷新页面）。

**浏览：**
1.  任何人（包括未登录用户）都可以浏览所有提问箱。
2.  点击提问箱进入详情页，查看完整内容和所有评论。

---

## 3. 功能需求 (Functional Requirements)

### 3.1 用户账户 (Account Management) - [A-Grade Req]
*   **FR-01 注册:** 用户需提供用户名和密码。密码必须使用 `bcrypt` 加密存储 (Lecture 28)。
*   **FR-02 登录/登出:** 使用 `express-session` 维持登录状态。
*   **FR-03 权限升级:**
    *   数据库中 `tbl_accounts` 表需包含 `isAdmin` 字段。
    *   **必须实现:** 访问特定 URL `/make-me-admin-please` 可将当前登录用户升级为管理员。
    *   **防呆设计（重要）:**
        - 如果用户**未登录**：设置session消息"To become an admin, you need to log in first"（通过`req.session.message`和`req.session.messageType = "error"`），然后重定向到登录页。
        - 如果用户**已登录**：执行 `UPDATE tbl_accounts SET isAdmin=1 WHERE id=?`，更新session，设置成功消息"You are now Admin!"（通过`req.session.message`和`req.session.messageType = "success"`），然后重定向回主页。
        - 这样设计可以让助教测试时有顺滑的体验。

### 3.2 提问箱管理 (Blog Post Management) - [C-Grade Req]
*   **FR-04 发布提问箱 (Creating Posts):**
    *   **仅登录用户**可以发布提问箱（符合A-grade要求）。
    *   需要输入**标题**和**内容**（都是必填项）。
    *   内容支持多行文本，必须保留空白符和换行 (CSS: `white-space: pre-wrap`)。
    *   未登录用户访问发布页面时，应提示"请先登录"。

*   **FR-05 编辑提问箱 (Editing Posts):**
    *   用户可以编辑自己发布的提问箱。
    *   管理员可以编辑任何提问箱。

*   **FR-06 删除提问箱 (Deleting Posts):**
    *   用户可以删除自己发布的提问箱。
    *   管理员可以删除任何提问箱。
    *   删除提问箱时，应同时删除该提问箱下的所有评论（级联删除）。

### 3.3 浏览与展示 (Browsing) - [B-Grade Req]
*   **FR-07 主页 (Home Page):**
    *   展示所有用户最近发布的提问箱列表。
    *   如果内容较长，只显示预览（如前200字），提供"查看全文"链接。
    *   显示发布者、发布时间、评论数量等元信息。

*   **FR-08 详情页 (Post Detail Page):**
    *   每个提问箱拥有独立 URL (如 `/post/:id`)。
    *   显示完整的标题、内容、发布时间、作者。
    *   显示该提问箱下的所有评论（按时间排序）。
    *   登录用户可以看到评论输入框。

*   **FR-09 分页/排序:**
    *   主页支持按时间倒序排列（最新的在最前）。
    *   限制每页显示数量 (如 10 条)。
    *   提供分页导航（上一页/下一页或页码）。

### 3.4 评论系统 (Comments) - [B-Grade Req]
*   **FR-10 评论权限控制:**
    *   **所有登录用户**都可以对任何提问箱发表评论（符合PDF B-grade要求）。
    *   未登录用户不能评论（符合PDF A-grade要求）。
    *   用户可选择"匿名评论"或"实名评论"。
    *   数据库始终记录真实user_id，但前端根据is_anonymous字段决定显示为用户名或"Anonymous"。
    *   管理员可以查看匿名评论者的真实身份（如在管理面板或悬停提示中显示）。
    *   用户可以删除自己的评论。
    *   管理员可以删除任何评论。

*   **FR-11 异步提交 (AJAX):**
    *   评论提交必须使用 JavaScript `fetch` API。
    *   提交后**不刷新页面**，新评论立即显示在评论列表中。

---

## 4. 数据与数据库设计 (Data Requirements)
*参考 Lecture 26/27，使用 `db-con.js` 和 Connection Pool*

### 4.1 Schema Design

#### `tbl_accounts`
| Column | Type | Notes |
| :--- | :--- | :--- |
| id | INT (PK) | Auto Increment |
| username | VARCHAR(50) | Unique, 用户名 |
| password | VARCHAR(255) | Hashed via bcrypt |
| isAdmin | TINYINT | 0=User, 1=Admin |
| created_at | DATETIME | 账户创建时间 |

#### `tbl_posts` (提问箱/博客文章)
| Column | Type | Notes |
| :--- | :--- | :--- |
| id | INT (PK) | Auto Increment |
| author_id | INT (FK) | 发布者ID (references tbl_accounts.id) |
| title | VARCHAR(255) | 必填，提问箱标题 |
| content | TEXT | 必填，提问箱内容 |
| created_at | DATETIME | 发布时间 |
| updated_at | DATETIME | 最后编辑时间 (可为NULL) |

#### `tbl_comments`
| Column | Type | Notes |
| :--- | :--- | :--- |
| id | INT (PK) | Auto Increment |
| post_id | INT (FK) | 关联的提问箱ID (references tbl_posts.id) |
| user_id | INT (FK) | 评论者的真实用户ID (references tbl_accounts.id)，必填 |
| is_anonymous | TINYINT | 0=实名显示, 1=匿名显示 |
| content | TEXT | 评论内容 |
| created_at | DATETIME | 评论时间 |

**注意：** 不需要tbl_questions表，因为提问箱就是博客文章本身（tbl_posts）。

---

## 5. 界面与非功能需求 (Interface & Non-functional)

### 5.1 页面布局要求 (Page Layout Requirements)
每个页面都应包含以下三个核心组件：

*   **Header（页头）：**
    *   位于页面顶部，包含用户相关操作。
    *   未登录状态：显示"登录"和"注册"按钮/链接。
    *   已登录状态：显示"欢迎，[用户名]"、"新建提问箱"、"我的文章"、"登出"等链接。
    *   可选：网站Logo或标题（如"提问箱博客"）。

*   **Sidebar（侧边栏）：**
    *   包含主要导航链接。
    *   建议包含：
        - 首页（最新提问箱）
        - 浏览所有文章
        - 我的文章（登录后可见）
        - 关于/帮助
    *   可以使用固定定位或响应式设计（移动端可折叠成汉堡菜单）。

*   **Footer（页脚）：**
    *   位于页面底部。
    *   可包含：
        - 版权信息 (如 "© 2025 Q&A Box Blog")
        - 课程信息 ("CSCI4131 Final Project")
        - 开发者信息或学生姓名
        - 社交链接（可选）
    *   建议简洁但不空白。

### 5.2 视觉风格 (Visual Requirements)
*   **禁止:** 纯黑白页面、简单的列表堆砌。
*   **要求:**
    *   使用 CSS Grid 或 Flexbox 进行布局（Header/Sidebar/Main/Footer结构）。
    *   **响应式设计 (Responsive Design):** 适配桌面端和移动端 (参考 Lecture 28 Media Queries)。
    *   卡片式设计 (Card UI) 展示提问箱列表。
    *   合理的配色方案（不要纯黑白，但也不要过于刺眼）。
    *   适当的间距和留白 (padding/margin)。
    *   交互元素（按钮、链接）应有hover效果和过渡动画。

### 5.3 安全性 (Security)
*   **SQL Injection:** 所有数据库查询必须使用 `?` 占位符 (Prepared Statements)。
*   **XSS:** 输出用户内容 (提问箱内容/评论) 时必须进行转义 (Pug 默认支持，注意不要用 `!=` 除非必要)。
*   **Password:** 禁止明文存储密码，必须使用bcrypt加密。
*   **Session Security:** 使用安全的session配置，设置合理的过期时间和secret。
*   **权限验证:** 所有需要登录的操作（发布、编辑、删除、评论）都必须在后端验证session。

### 5.4 提交规范 (Submission)
*   包含 `package.json`。
*   包含 `readme.txt` 或 `readme.md`，说明：
    - 如何运行项目
    - 测试账户（如果有）
    - Admin彩蛋链接 (`/make-me-admin-please`)
    - 实现的功能列表（C/B/A-grade对照）
*   **不包含** `node_modules`。
*   所有必要的静态文件（CSS、JS、图片等）都应包含在提交中。

---

## 6. 开发路线图 (Implementation Roadmap)

作为全栈程序员，建议按照以下顺序开发：

### Phase 1: Setup & Database
*   初始化 `npm`，安装 `express`, `mysql2`, `pug`, `bcrypt`, `express-session`。
*   在 MySQL Workbench 中创建上述三张表。
*   编写 `db-con.js` 并在 `server.js` 中测试数据库连接。

### Phase 2: Auth System
*   实现注册路由 (`GET /register`, `POST /register`)。
*   实现登录路由 (`GET /login`, `POST /login`)。
*   实现登出路由 (`GET /logout`)。
*   配置 Session 中间件。
*   实现 `/make-me-admin-please` 管理员升级路由。
*   创建Header组件，显示当前登录状态。

### Phase 3: 基础布局
*   创建Pug layout模板 (`views/layout.pug`)，包含Header、Sidebar、Footer。
*   实现响应式CSS布局（使用Grid或Flexbox）。
*   添加基本样式和配色方案。
*   实现移动端适配（Media Queries）。

### Phase 4: 提问箱（博客）核心功能 (C-Grade)
*   实现发布提问箱功能：
    - `GET /post/new` - 显示发布表单（需要登录）
    - `POST /post/new` - 处理发布请求，写入tbl_posts
*   实现编辑提问箱功能：
    - `GET /post/:id/edit` - 显示编辑表单（权限检查）
    - `POST /post/:id/edit` - 处理编辑请求
*   实现删除提问箱功能：
    - `POST /post/:id/delete` - 删除提问箱及其评论（权限检查）

### Phase 5: 浏览功能 (B-Grade)
*   实现主页 `GET /`：
    - 从tbl_posts读取所有文章（按时间倒序）
    - 实现分页（LIMIT和OFFSET）
    - 显示文章预览（卡片式设计）
*   实现提问箱详情页 `GET /post/:id`：
    - 显示完整内容
    - 显示所有评论（JOIN tbl_comments和tbl_accounts）
    - 根据is_anonymous决定显示用户名或"Anonymous"

### Phase 6: 评论系统 (B-Grade)
*   实现评论API：
    - `POST /api/post/:id/comment` - 异步提交评论
    - 返回JSON格式的新评论数据
*   前端JavaScript：
    - 使用`fetch`提交评论
    - 动态插入新评论到DOM
    - 处理错误情况
*   实现评论删除：
    - `POST /api/comment/:id/delete` - 删除评论（权限检查）

### Phase 7: 管理员功能 & Final Polish (A-Grade)
*   实现管理员特殊功能：
    - 在提问箱列表和详情页显示删除按钮（仅Admin可见）
    - 在评论旁显示真实用户名（仅Admin可见匿名用户身份）
*   优化CSS样式：
    - 给所有按钮添加hover效果
    - 给卡片添加box-shadow和圆角
    - 优化颜色搭配和字体
    - 确保所有页面响应式正常
*   测试所有功能
*   编写详细的README文档

---

## 7. 给开发者的特别提示 (Tips for A Grade)

### 7.1 必须注意的关键点

*   **彩蛋路由:**
    - 实现 `/make-me-admin-please` 路由
    - 在README中明确写出这个URL
    - 助教会依赖这个来测试Admin功能

*   **评论权限:**
    1.  未登录用户只能看评论，看不到评论框。
    2.  登录用户可以评论任何提问箱。
    3.  管理员可以删除任何评论（助教会测试这个）。

*   **匿名功能的实现:**
    1.  前端：在评论框旁提供"匿名评论"复选框。
    2.  后端：始终保存真实user_id到数据库。
    3.  显示：查询时JOIN tbl_accounts，但根据is_anonymous决定显示用户名或"Anonymous"。
    4.  管理员视图：可以看到匿名评论者的真实身份（如悬停提示或括号标注）。

*   **"提问箱"就是博客文章:**
    - 不需要复杂的"提问→回答"流程
    - 用户直接创建提问箱（tbl_posts）
    - 其他用户直接评论（tbl_comments）

### 7.2 CSS美化建议
*   **不要偷懒!** 视觉风格占10-15分，很容易拿也很容易丢。
*   给按钮加`hover`、`active`、`focus`效果。
*   给卡片加`box-shadow`和圆角`border-radius`。
*   使用合理的配色（推荐Material Design或类似配色方案）。
*   注意文字可读性：
    - 正文字号建议16px
    - 行高建议1.5-1.6
    - 确保背景和文字有足够对比度
*   适当使用图标（Unicode字符如 ✉️📝🗑️ 或CSS形状）。

### 7.3 测试清单
在提交前，请逐项测试：
- [ ] 未登录用户可以浏览提问箱和评论。
- [ ] 未登录用户不能发布提问箱或评论。
- [ ] 注册功能正常（密码加密）。
- [ ] 登录/登出功能正常。
- [ ] 访问`/make-me-admin-please`可以获得管理员权限。
- [ ] 登录用户可以发布提问箱（带标题和内容）。
- [ ] 用户可以编辑自己的提问箱。
- [ ] 用户可以删除自己的提问箱。
- [ ] 管理员可以编辑/删除任何提问箱。
- [ ] 所有登录用户都可以评论任何提问箱。
- [ ] 评论可以选择匿名或实名。
- [ ] 评论使用AJAX提交（不刷新页面）。
- [ ] 用户可以删除自己的评论。
- [ ] 管理员可以删除任何评论。
- [ ] 管理员可以看到匿名评论者的真实身份。
- [ ] 主页有分页功能。
- [ ] 提问箱详情页显示所有评论。
- [ ] 页面在不同窗口大小下正常显示（响应式）。
- [ ] 所有页面都有Header、Sidebar、Footer。
- [ ] CSS样式美观，配色合理。
- [ ] 无SQL注入漏洞（使用prepared statements）。
- [ ] 无XSS漏洞（使用Pug默认转义）。

### 7.4 常见错误
*   **忘记后端权限验证:** 前端隐藏按钮≠安全，必须在后端验证session。
*   **SQL注入漏洞:** 使用`?`占位符，不要直接拼接SQL字符串。
*   **XSS漏洞:** 不要用`!=`在Pug中输出用户内容。
*   **忘记处理边界情况:**
    - 删除提问箱时，级联删除所有相关评论
    - 提交空内容时的验证
    - 访问不存在的提问箱ID
*   **响应式设计不完整:** 在大屏幕美观，在小屏幕布局崩溃。
*   **Session配置不当:** 忘记设置secret，或者session过期时间太短。

---

## 8. 项目名称说明

虽然项目叫"Anonymous Q&A Blog Platform"（匿名提问箱博客平台），但这里的"Q&A"指的是：
- **Q (Question Box)** = 提问箱 = 博客文章内容
- **A (Answer/Response)** = 评论 = 读者对提问箱的回应

这是一个**博客系统**，不是传统的"提问-回答"论坛。

---

**最后的话：** 这个项目考察的是你整合本学期所学知识的能力。保持代码整洁，注重用户体验，确保安全性。不要只追求"能用"，要追求"专业"和"美观"。Good luck, 加油！🎉
