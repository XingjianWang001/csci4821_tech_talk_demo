# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary audience is the people watching a CSCI4821 tech talk on AI design tooling. They see the app through a screen share or a recording, on their own screens, and judge in a few seconds whether the redesign is a real improvement.

The in-app roles still exist and still have to work, but they come second. They are the characters in the demo, not the people design work is optimized for:

- **Guest:** browses question boxes and comments. Cannot post or comment.
- **Registered user:** posts question boxes, edits and deletes their own, and comments or replies, by name or anonymously.
- **Admin:** reached through `/make-me-admin-please`. Can edit and delete anything, and can see who wrote an anonymous comment.

## Product Purpose

This is a live before/after demo. The working CSCI4131 "Q&A Box Blog" final project is the subject: a generic student UI that an agent working with a design skill (Impeccable) turns into a crafted one while the audience watches. Success means the audience can see the difference right away and believe that the tooling, not hand polish, made it.

## Positioning

This is a real, working full-stack app, not a mockup made for the talk. Its auth, CRUD, pagination, AJAX comments and admin flows all keep working before and after. The redesign happens in place on code the audience can see running, and the original UI stays recoverable in git history as the "before".

## Operating Context

- Shown through a screen share or a recording, so it is viewed at whatever size and compression the viewer's screen and the video give it.
- Presented as a sequence: baseline UI, then the agent working, then the redesigned UI, with the comparison as the payoff.
- Run locally with `npm start` on `http://localhost:4131`. Demo content lives in a local `data.db` that is created on first run and not tracked in git.
- Redesign work happens on the `feat/better-ui` branch. `main` holds the baseline.

## Capabilities and Constraints

- **Stack (existing):** Node.js ≥ 22.13, Express 5, Pug templates, vanilla CSS (`resources/css/main.css`) and vanilla JS (`resources/js/main.js`), built-in `node:sqlite`, bcrypt, express-session. No frontend build step or HMR.
- **Routes:** `/`, which lists posts newest-first at 10 per page; `/register`, `/login` and `/logout`; `/post/new`; `/post/:id`; `/post/:id/edit`; `/post/:id/delete`; `/make-me-admin-please`; and the AJAX endpoints `/api/comment` and `/api/reply` (create and delete).
- **Terminology:** a "question box" is a blog post. A comment is a reader's response to it, and replies thread under comments. This is a blog, not a question-and-answer forum. Anonymous comments display as "Anonymous", but the real author is always stored, and admins can see it.
- **Post content** is multi-line and must keep whitespace and line breaks.
- **Security behavior must survive any redesign:** parameterized queries, escaped user content (Pug's default escaping, with no `!=` on user data), bcrypt hashing, and a backend session check on every write.
- **Not binding (user confirmed):** the course-era UI rules. These were the header, sidebar and footer on every page, card UI for posts, the desktop-only layout from the commit that removed mobile CSS, and the "Q&A Box Blog" / "Made with love by Shiba" branding. Design work may keep or replace any of them.

## Brand Commitments

None are binding. The existing name, "Q&A Box Blog", and the footer credits ("CSCI4131 Final Project", "Made with love by Shiba") are incumbent copy, not commitments.

## Evidence on Hand

- `requirements/SRS.md`, `requirements/SDD.md` and `requirements/FINAL PROJECT.pdf`: the original course requirements and design docs, mostly in Chinese.
- The baseline UI on `main` and in git history. It is the "before" of the demo.
- Demo posts and comments in the local `data.db`, whatever has been seeded on the presenting machine.
- There are no real users, testimonials, metrics or usage data. Do not invent any.

## Product Principles

1. **The difference reads at a glance.** The improvement has to be obvious within seconds through screen-share compression and at unknown viewer sizes. Subtle wins that only show at full resolution do not carry the demo.
2. **Function holds still while design moves.** Every route, flow and permission works the same after a redesign, so the before/after is a fair comparison of design alone.
3. **Real, not staged.** Improvements ship in the running app with real data flowing through them, never as a static comp swapped in for the talk.
4. **Keep the "before" honest.** Do not quietly polish the baseline. Its value as evidence depends on it staying as it was.
