# Q&A Box Blog Platform

A simple blog platform for creating posts and comments.

## Setup

1. Install dependencies:
```
npm install
```

2. Set up database:
```
mysql -u C4131F25U149 -p -h cse-mysql-classes-02.cse.umn.edu -P 3306 C4131F25U149 < schema.sql
```
Enter a valid password

3. Start SSH tunnel if working from home:
```
ssh -L 3306:cse-mysql-classes-02.cse.umn.edu:3306 x500@csel-kh1262-01.cselabs.umn.edu
```
x500 should be your x500

4. Start server (in another new terminal):
```
node server.js
```

5. Open browser to http://localhost:4131

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

## Important URLs

- Home: http://localhost:4131/
- Register: http://localhost:4131/register
- Login: http://localhost:4131/login
- Admin access: http://localhost:4131/make-me-admin-please

## Notes

Database connection is configured for localhost to work with SSH tunnel.
All passwords are hashed with bcrypt.
Comments use AJAX so no page reload is needed.
