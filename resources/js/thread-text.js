// Words the server templates and main.js both write about question boxes,
// comments and replies. server.js requires this file (and hands it to the
// views as locals); the browser loads it before main.js, so a comment added
// in the browser is named and counted exactly like a server-rendered one.
(function (root) {
    // The name shown for an item's author: "Anonymous" hides it.
    function authorName(item) {
        return item.is_anonymous ? 'Anonymous' : item.username;
    }

    // Author plus the visible time, for accessible names ("Reply to comment
    // by demo_viewer, Nov 26, 10:37 AM"), so two comments by the same person
    // stay distinct. `timeLabel` is the formatted date the item shows.
    function byline(item, timeLabel) {
        const name = authorName(item);
        return timeLabel ? `${name}, ${timeLabel}` : name;
    }

    // "comment" or "comments" after a count.
    function commentWord(count) {
        return count === 1 ? 'comment' : 'comments';
    }

    const api = {authorName, byline, commentWord};
    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    } else {
        root.ThreadText = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
