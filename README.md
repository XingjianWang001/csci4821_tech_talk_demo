# Q&A Box Blog Platform

A simple blog platform for creating posts and comments.

## Setup

Requires Node.js 22.13 or newer (uses the built-in `node:sqlite` module). No external database is needed.

1. Install dependencies:
```
npm install
```

2. Start server:
```
npm start
```
On first run, a local SQLite file `data.db` is created and initialized from `schema.sql`.

3. Open browser to http://localhost:4131

To reset all data, stop the server and delete `data.db`. Optional environment variables: `PORT` (default `4131`) and `DB_PATH` (default `./data.db`).

## Testing

1. Register a new account at /register
2. Create a post using "New Post" button
3. View your post and add comments
4. Test admin features by visiting /make-me-admin-please
5. As admin, you can edit and delete any post or comment

## Features

C-Grade: Create, edit, delete blog posts with pagination

B-Grade: AJAX comments and browsing with pagination

A-Grade: User authentication, admin system, bcrypt password hashing

## URLs

- Home: http://localhost:4131/
- Register: http://localhost:4131/register
- Login: http://localhost:4131/login
- Admin access: http://localhost:4131/make-me-admin-please
