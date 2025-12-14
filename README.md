# Q&A Box Blog Platform

A blog platform where users can create "Question Boxes" (blog posts) and other users can comment on them (with optional anonymity).

## Features Implemented

### C-Grade Features (Core Blog Functionality)
- ✅ User registration and login with bcrypt password hashing
- ✅ Create, edit, and delete blog posts (Question Boxes)
- ✅ View all posts with pagination (10 posts per page)
- ✅ View individual post details
- ✅ Multi-line text support with preserved whitespace
- ✅ Post preview on home page (200 characters)

### B-Grade Features (Comments & Browsing)
- ✅ Comment system with AJAX (no page reload)
- ✅ Anonymous commenting option (frontend anonymity, backend tracks real user)
- ✅ Users can delete their own comments
- ✅ Time-ordered browsing with pagination
- ✅ Each post and page has unique URLs for bookmarking

### A-Grade Features (User Management)
- ✅ User authentication with session management
- ✅ Non-logged-in users can only browse (no posting/commenting)
- ✅ Logged-in users can post and comment
- ✅ Admin privileges system
- ✅ Admin can edit/delete any post or comment
- ✅ Admin can see real usernames behind anonymous comments
- ✅ Special admin escalation URL: `/make-me-admin-please`

## Technologies Used

- **Backend**: Node.js with Express
- **Database**: MySQL (using HW6 database credentials)
- **Templating**: Pug
- **Authentication**: express-session + bcrypt
- **Frontend**: Vanilla JavaScript (AJAX with Fetch API)
- **Styling**: Custom CSS with responsive design

## How to Run

### 1. Install Dependencies

```bash
cd CSCI4131-Final-Project
npm install
```

### 2. Set Up Database

Run the following SQL file in MySQL Workbench or command line:

```bash
mysql -u C4131F25U149 -p C4131F25U149 < schema.sql
```

Or manually execute the contents of `schema.sql` in MySQL Workbench.

### 3. Start SSH Tunnel (if testing from home)

```bash
ssh -L 3306:db.cselabs.umn.edu:3306 x500@csel-kh4250-01.cselabs.umn.edu
```

### 4. Start the Server

```bash
node server.js
```

The server will start at `http://localhost:4131`

## Testing Guide

### Basic Testing Flow

1. **Visit Home Page**: `http://localhost:4131`
   - Should see "No posts yet" message if database is empty

2. **Register a New Account**: Click "Register" in navbar
   - Username: `testuser`
   - Password: `password123`
   - Confirm Password: `password123`

3. **Create Your First Post**: Click "New Post" after logging in
   - Title: "My First Question Box"
   - Content: "This is my first post!"
   - Click "Publish"

4. **View Post Detail**: Click on the post title
   - Should see full post content
   - Should see comment form

5. **Add a Comment**: Fill in comment form
   - Try both anonymous and non-anonymous comments
   - Comment should appear immediately without page reload

6. **Test Admin Features**: Visit `/make-me-admin-please`
   - Should see success message
   - Should see [Admin] badge in navbar
   - Try deleting other users' comments
   - Try viewing real username behind anonymous comments

### Advanced Testing

#### Test Pagination
- Create 15+ posts
- Navigate to home page
- Click "Next" to see page 2

#### Test Edit/Delete
- Edit your own post
- Delete your own post
- Try editing others' posts (should fail unless admin)

#### Test Anonymous Comments
- Log in as regular user
- Comment anonymously on a post
- Log in as admin
- View the same post - admin should see real username

#### Test Permissions
- Log out
- Try to access `/post/new` - should redirect to login
- Try to comment - should see "Please login to leave a comment"

## Important URLs

- **Home Page**: `http://localhost:4131/`
- **Login**: `http://localhost:4131/login`
- **Register**: `http://localhost:4131/register`
- **New Post**: `http://localhost:4131/post/new`
- **Admin Easter Egg**: `http://localhost:4131/make-me-admin-please`

## Database Schema

### tbl_accounts
- `id`: Primary key
- `username`: Unique username
- `password`: Bcrypt hashed password
- `isAdmin`: Admin flag (0 or 1)
- `created_at`: Account creation timestamp

### tbl_posts
- `id`: Primary key
- `author_id`: Foreign key to tbl_accounts
- `title`: Post title
- `content`: Post content (supports multi-line text)
- `created_at`: Post creation timestamp
- `updated_at`: Last edit timestamp

### tbl_comments
- `id`: Primary key
- `post_id`: Foreign key to tbl_posts
- `user_id`: Foreign key to tbl_accounts (always stored)
- `is_anonymous`: Boolean flag for frontend display
- `content`: Comment content
- `created_at`: Comment timestamp

## Grading Checklist

- [x] All required dependencies in package.json
- [x] No node_modules in submission
- [x] README.md with clear instructions
- [x] Database connection configured for localhost (SSH tunnel)
- [x] bcrypt password hashing
- [x] Session-based authentication
- [x] AJAX comments (no page reload)
- [x] Responsive CSS layout
- [x] Header, Sidebar, Footer on all pages
- [x] Admin easter egg URL documented
- [x] Proper permission checks on all routes
- [x] SQL injection protection (prepared statements)
- [x] XSS protection (Pug default escaping)

## Known Limitations

- Passwords stored with bcrypt (not plaintext)
- Markdown not supported in posts (preserves whitespace only)
- No image upload functionality
- Mobile responsive but optimized for desktop

## Credits

Developed for CSCI4131 Final Project
Database structure inspired by Homework 6
Color scheme adapted from Homework 6 Shiba theme
