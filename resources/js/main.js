// Client behavior for the Question Box Blog.
// Rule: user content only ever reaches the page through textContent, never
// through innerHTML or insertAdjacentHTML, so typed HTML shows up as text.
document.addEventListener('DOMContentLoaded', () => {
    // sessionStorage can be missing or throw (private mode, blocked storage).
    // Drafts are a convenience, so every access fails quietly.
    const drafts = {
        get(key) {
            try {
                return window.sessionStorage.getItem(key);
            } catch {
                return null;
            }
        },
        set(key, value) {
            try {
                if (value) {
                    window.sessionStorage.setItem(key, value);
                } else {
                    window.sessionStorage.removeItem(key);
                }
            } catch {
                // ignore
            }
        },
        remove(key) {
            try {
                window.sessionStorage.removeItem(key);
            } catch {
                // ignore
            }
        }
    };

    // The server names a draft to drop after it saved that form for real.
    if (document.body.dataset.clearDraft) {
        drafts.remove(document.body.dataset.clearDraft);
    }

    const prefersReducedMotion =
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // The server formats dates (created_label) so AJAX-added items match
    // server-rendered ones regardless of the browser's time zone.
    function timeEl(className, item) {
        const node = document.createElement('time');
        node.className = className;
        node.textContent = item.created_label || '';
        const date = new Date(item.created_at);
        if (!Number.isNaN(date.getTime())) node.dateTime = date.toISOString();
        return node;
    }

    // Flash messages can be dismissed. Focus moves to the page heading so
    // keyboard users aren't dropped at the top of the document.
    document.querySelectorAll('.message-dismiss').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.message').remove();
            const pageHeading = document.querySelector('h1');
            if (pageHeading) {
                pageHeading.setAttribute('tabindex', '-1');
                pageHeading.focus();
            }
        });
    });

    // A small decorative paw for posted acknowledgements. Matches the paw
    // mixin in views/mixins/shiba.pug.
    function pawIcon() {
        const ns = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        const attrs = {
            class : 'paw',
            viewBox : '0 0 24 24',
            width : '16',
            height : '16',
            'aria-hidden' : 'true',
            focusable : 'false'
        };
        Object.entries(attrs).forEach(([ k, v ]) => svg.setAttribute(k, v));
        const shapes = [
            [ 'ellipse', {cx : 12, cy : 16, rx : 5.5, ry : 4.5} ],
            [ 'circle', {cx : 5.5, cy : 10, r : 2.3} ],
            [ 'circle', {cx : 9.5, cy : 5.8, r : 2.3} ],
            [ 'circle', {cx : 14.5, cy : 5.8, r : 2.3} ],
            [ 'circle', {cx : 18.5, cy : 10, r : 2.3} ]
        ];
        shapes.forEach(([ tag, shapeAttrs ]) => {
            const shape = document.createElementNS(ns, tag);
            Object.entries(shapeAttrs)
                .forEach(([ k, v ]) => shape.setAttribute(k, String(v)));
            svg.append(shape);
        });
        return svg;
    }

    // Accessible replacement for confirm(). Falls back to confirm() only in
    // browsers without <dialog>.
    function confirmAction(message) {
        const dialog = document.getElementById('confirm-dialog');
        if (!dialog || typeof dialog.showModal !== 'function') {
            return Promise.resolve(window.confirm(message));
        }
        dialog.querySelector('#confirm-dialog-message').textContent = message;
        dialog.returnValue = '';
        dialog.showModal();
        return new Promise(resolve => {
            // The form's submit names the button right away; close covers
            // Escape. Whichever comes first answers.
            const listeners = new AbortController();
            const answer = (confirmed) => {
                listeners.abort();
                resolve(confirmed);
            };
            dialog.querySelector('form').addEventListener(
                'submit',
                (e) => answer(Boolean(e.submitter) &&
                              e.submitter.value === 'confirm'),
                {signal : listeners.signal});
            dialog.addEventListener(
                'close', () => answer(dialog.returnValue === 'confirm'),
                {signal : listeners.signal});
        });
    }

    // fetch() wrapper that always resolves to {ok, data} or {ok, error}.
    // failMessage is shown when the server gives no message of its own.
    async function send(url, options, failMessage) {
        let response;
        try {
            response = await fetch(url, {
                ...options,
                headers : {
                    'Accept' : 'application/json',
                    ...(options.body ? {'Content-Type' : 'application/json'}
                                     : {})
                }
            });
        } catch {
            return {
                ok : false,
                error :
                    "Couldn't reach the server. Check your connection and try again."
            };
        }
        let data = null;
        try {
            data = await response.json();
        } catch {
            // not JSON (for example a redirect to the login page)
        }
        const landedOnLogin = response.redirected &&
                              new URL(response.url).pathname === '/login';
        if (response.status === 401 || landedOnLogin) {
            return {
                ok : false,
                sessionEnded : true,
                error : 'Your session ended. What you typed is still here.'
            };
        }
        if (!response.ok || !data) {
            return {
                ok : false,
                error : (data && data.error) || failMessage
            };
        }
        return {ok : true, data};
    }

    // Inline, announced feedback instead of alert(). Posted acknowledgements
    // pass options.paw to get the Shiba paw.
    function showStatus(statusEl, message, type, sessionEnded, options) {
        if (!statusEl) return;
        statusEl.replaceChildren(message);
        if (options && options.paw) statusEl.prepend(pawIcon());
        statusEl.dataset.type = type;
        if (sessionEnded) {
            const link = document.createElement('a');
            link.href = '/login?returnTo=' +
                        encodeURIComponent(window.location.pathname);
            link.textContent = 'Log in again';
            statusEl.append(' ', link, '.');
        }
    }

    function clearStatus(statusEl) {
        if (!statusEl) return;
        statusEl.replaceChildren();
        delete statusEl.dataset.type;
    }

    // ----- Question box form (new and edit): keep a draft per form -----
    document.querySelectorAll('form[data-draft-key]').forEach(form => {
        const key = form.dataset.draftKey;
        const fields = form.querySelectorAll('input[type="text"], textarea');
        try {
            const saved = JSON.parse(drafts.get(key) || 'null');
            if (saved) {
                fields.forEach(field => {
                    if (typeof saved[field.name] === 'string') {
                        field.value = saved[field.name];
                    }
                });
            }
        } catch {
            drafts.remove(key);
        }
        form.addEventListener('input', () => {
            const values = {};
            fields.forEach(field => { values[field.name] = field.value; });
            drafts.set(key, JSON.stringify(values));
        });
        const discard = form.querySelector('.js-discard-draft');
        if (discard) discard.addEventListener('click', () => drafts.remove(key));
    });

    // ----- Plain forms that need a confirmation (delete question box) -----
    document.querySelectorAll('form[data-confirm]').forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (await confirmAction(form.dataset.confirm)) {
                HTMLFormElement.prototype.submit.call(form);
            }
        });
    });

    // ----- Post page: comments and replies -----
    const section = document.querySelector('.comments-section');
    if (!section) return;

    const commentsList = section.querySelector('.comments-list');
    const heading = document.getElementById('comments-heading');
    const countEl = document.getElementById('comment-count');
    const countLabelEl = document.getElementById('comment-count-label');
    const viewerIsAdmin = section.dataset.viewerAdmin === 'true';
    const draftPrefix = `draft:${window.location.pathname}`;
    const commentDraftKey = `${draftPrefix}:comment`;
    const replyDraftKey = (commentId) => `${draftPrefix}:reply:${commentId}`;

    // Feedback rules: success shows next to what changed (the comment's own
    // status line), errors next to the control that was used. One message at
    // a time: showing a status clears every other one, so the thread never
    // says "posted" and "deleted" at once.
    function report(statusEl, message, type, sessionEnded, options) {
        section.querySelectorAll('.form-status').forEach(other => {
            if (other === statusEl) return;
            clearStatus(other);
            // A deleted comment's placeholder goes as soon as it's cleared.
            const removed = other.closest('.comment.is-removed');
            if (removed) finishRemoval(removed);
        });
        showStatus(statusEl, message, type, sessionEnded, options);
    }

    function commentStatus(commentEl) {
        return commentEl.querySelector(':scope > .comment-status');
    }

    // Keep keyboard and screen-reader users in place after something they
    // were on disappears: focus the nearest remaining item.
    function focusItem(itemEl) {
        itemEl.setAttribute('tabindex', '-1');
        itemEl.focus();
    }

    function changeCount(delta) {
        if (!countEl) return;
        const next = Math.max(0, (parseInt(countEl.textContent, 10) || 0) + delta);
        countEl.textContent = String(next);
        if (countLabelEl) {
            countLabelEl.textContent = next === 1 ? 'comment' : 'comments';
        }
    }

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    // Mirrors the authorLine mixin in views/post.pug: the header line, plus
    // the admin's anonymous-author reveal under it. Returns a node list.
    function authorHeader(kind, item) {
        const header = el('div', `author-line ${kind}-header`);
        header.append(
            el('strong', 'author-name',
               item.is_anonymous ? 'Anonymous' : item.username),
            timeEl(`${kind}-date`, item));
        if (!(item.is_anonymous && viewerIsAdmin)) return [ header ];
        const reveal = el('p', 'real-user', 'Posted anonymously by ');
        reveal.append(el('strong', '', item.username), ' ',
                      el('span', 'real-user-note', '· only admins see this'));
        return [ header, reveal ];
    }

    // Names used in accessible labels so each Reply/Delete is distinct.
    function authorName(item) {
        return item.is_anonymous ? 'Anonymous' : item.username;
    }

    function buildReply(reply) {
        const replyEl = el('div', 'reply');
        replyEl.dataset.replyId = reply.id;
        const deleteBtn = el('button', 'btn btn-small btn-delete-reply', 'Delete');
        deleteBtn.type = 'button';
        deleteBtn.dataset.replyId = reply.id;
        deleteBtn.setAttribute('aria-label',
                               `Delete reply by ${authorName(reply)}`);
        const actions = el('div', 'reply-actions');
        actions.append(deleteBtn);
        replyEl.append(...authorHeader('reply', reply),
                       el('div', 'reply-content', reply.content), actions);
        return replyEl;
    }

    function buildComment(comment) {
        const commentEl = el('div', 'comment');
        commentEl.dataset.commentId = comment.id;
        commentEl.dataset.commentAuthorId = comment.user_id;

        const actions = el('div', 'comment-actions');
        const deleteBtn =
            el('button', 'btn btn-small btn-delete-comment', 'Delete');
        deleteBtn.type = 'button';
        deleteBtn.dataset.commentId = comment.id;
        deleteBtn.setAttribute('aria-label',
                               `Delete comment by ${authorName(comment)}`);
        // The author of a comment can always reply to it.
        const replyBtn = el('button', 'btn btn-small btn-reply', 'Reply');
        replyBtn.type = 'button';
        replyBtn.dataset.commentId = comment.id;
        replyBtn.setAttribute('aria-label',
                              `Reply to comment by ${authorName(comment)}`);
        replyBtn.setAttribute('aria-expanded', 'false');
        replyBtn.setAttribute('aria-controls', `reply-form-${comment.id}`);
        actions.append(replyBtn, deleteBtn);

        const container = el('div', 'reply-form-container');
        container.id = `reply-form-${comment.id}`;
        container.hidden = true;
        const form = el('form', 'reply-form');
        form.dataset.commentId = comment.id;
        const textarea = el('textarea', 'reply-input');
        textarea.id = `reply-input-${comment.id}`;
        textarea.name = 'content';
        textarea.placeholder = 'Write your reply…';
        textarea.required = true;
        const textareaLabel = el('label', 'visually-hidden', 'Your reply');
        textareaLabel.htmlFor = textarea.id;
        const hint = el('p', 'field-hint',
                        'Hidden from other readers. Admins can still see who wrote it.');
        hint.id = `reply-anonymous-hint-${comment.id}`;
        const checkbox = el('input', 'reply-anonymous-checkbox');
        checkbox.type = 'checkbox';
        checkbox.name = 'is_anonymous';
        checkbox.setAttribute('aria-describedby', hint.id);
        const label = el('label');
        label.append(checkbox, ' Reply anonymously');
        const anonField = el('div', 'anon-field');
        anonField.append(label, hint);
        const submitBtn = el('button', 'btn btn-small btn-primary', 'Add Reply');
        submitBtn.type = 'submit';
        const cancelBtn = el('button', 'btn btn-small btn-cancel-reply', 'Cancel');
        cancelBtn.type = 'button';
        const buttons = el('div', 'form-buttons');
        buttons.append(submitBtn, cancelBtn);
        const row = el('div', 'form-row');
        row.append(anonField, buttons);
        const status = el('p', 'form-status');
        status.setAttribute('role', 'status');
        form.append(textareaLabel, textarea, row, status);
        container.append(form);

        const commentStatusEl = el('p', 'form-status comment-status');
        commentStatusEl.setAttribute('role', 'status');

        commentEl.append(...authorHeader('comment', comment),
                         el('div', 'comment-content', comment.content), actions,
                         container, commentStatusEl);
        return commentEl;
    }

    function openReplyForm(commentEl, focus) {
        const container = commentEl.querySelector('.reply-form-container');
        const replyBtn = commentEl.querySelector('.btn-reply');
        container.hidden = false;
        if (replyBtn) {
            replyBtn.setAttribute('aria-expanded', 'true');
            replyBtn.textContent = 'Replying…';
        }
        if (focus) container.querySelector('.reply-input').focus();
    }

    function closeReplyForm(commentEl) {
        const container = commentEl.querySelector('.reply-form-container');
        const replyBtn = commentEl.querySelector('.btn-reply');
        const form = container.querySelector('.reply-form');
        container.hidden = true;
        form.querySelector('.reply-input').value = '';
        form.querySelector('.reply-anonymous-checkbox').checked = false;
        clearStatus(form.querySelector('.form-status'));
        drafts.remove(replyDraftKey(commentEl.dataset.commentId));
        if (replyBtn) {
            replyBtn.setAttribute('aria-expanded', 'false');
            replyBtn.textContent = 'Reply';
            replyBtn.focus();
        }
    }

    // Briefly tint a just-posted comment or reply so the eye finds it.
    function markNew(itemEl) {
        itemEl.classList.add('is-new');
        window.setTimeout(() => itemEl.classList.remove('is-new'), 2400);
    }

    function setBusy(form, busy) {
        form.querySelectorAll('button[type="submit"]').forEach(btn => {
            btn.disabled = busy;
        });
        form.setAttribute('aria-busy', busy ? 'true' : 'false');
    }

    // "Write a comment" jumps to the form at the end of the thread and puts
    // the cursor in it.
    const jump = section.querySelector('.comments-jump');
    const commentBox = document.getElementById('comment-content');
    if (jump && commentBox) {
        jump.addEventListener('click', (e) => {
            e.preventDefault();
            commentBox.scrollIntoView({
                block : 'center',
                behavior : prefersReducedMotion ? 'auto' : 'smooth'
            });
            commentBox.focus({preventScroll : true});
        });
    }

    // Restore drafts left behind by an expired session or a reload.
    const commentForm = document.getElementById('comment-form');
    if (commentForm) {
        const saved = drafts.get(commentDraftKey);
        if (saved) commentForm.querySelector('#comment-content').value = saved;
    }
    section.querySelectorAll('.reply-form').forEach(form => {
        const saved = drafts.get(replyDraftKey(form.dataset.commentId));
        if (saved) {
            form.querySelector('.reply-input').value = saved;
            openReplyForm(form.closest('.comment'), false);
        }
    });

    section.addEventListener('input', (e) => {
        if (e.target.id === 'comment-content') {
            drafts.set(commentDraftKey, e.target.value);
        } else if (e.target.classList.contains('reply-input')) {
            const form = e.target.closest('.reply-form');
            drafts.set(replyDraftKey(form.dataset.commentId), e.target.value);
        }
    });

    async function submitComment(form) {
        const textarea = form.querySelector('#comment-content');
        const checkbox = form.querySelector('#anonymous-checkbox');
        const status = form.querySelector('.form-status');
        clearStatus(status);
        setBusy(form, true);
        const result = await send('/api/comment', {
            method : 'POST',
            body : JSON.stringify({
                post_id : form.dataset.postId,
                content : textarea.value,
                is_anonymous : checkbox.checked
            })
        }, "Couldn't add your comment. Refresh the page and try again.");
        setBusy(form, false);
        if (!result.ok) {
            report(status, result.error, 'error', result.sessionEnded);
            return;
        }
        const noComments = commentsList.querySelector('.no-comments');
        if (noComments) noComments.remove();
        const commentEl = buildComment(result.data.comment);
        commentsList.append(commentEl);
        changeCount(1);
        textarea.value = '';
        checkbox.checked = false;
        drafts.remove(commentDraftKey);
        markNew(commentEl);
        // The new comment's status line was just inserted; wait a tick so
        // screen readers register the live region before it changes. Scroll
        // only once the acknowledgement has text, so it lands on screen too.
        window.setTimeout(() => {
            const statusEl = commentStatus(commentEl);
            report(statusEl, 'Comment posted. Thanks for joining in!',
                   'success', false, {paw : true});
            statusEl.scrollIntoView({
                block : 'nearest',
                behavior : prefersReducedMotion ? 'auto' : 'smooth'
            });
        }, 50);
    }

    async function submitReply(form) {
        const commentEl = form.closest('.comment');
        const commentId = form.dataset.commentId;
        const textarea = form.querySelector('.reply-input');
        const checkbox = form.querySelector('.reply-anonymous-checkbox');
        const status = form.querySelector('.form-status');
        clearStatus(status);
        setBusy(form, true);
        const result = await send('/api/reply', {
            method : 'POST',
            body : JSON.stringify({
                comment_id : commentId,
                content : textarea.value,
                is_anonymous : checkbox.checked
            })
        }, "Couldn't add your reply. Refresh the page and try again.");
        setBusy(form, false);
        if (!result.ok) {
            report(status, result.error, 'error', result.sessionEnded);
            return;
        }
        const statusEl = commentStatus(commentEl);
        let repliesList = commentEl.querySelector('.replies-list');
        if (!repliesList) {
            repliesList = el('div', 'replies-list');
            commentEl.insertBefore(repliesList, statusEl);
        }
        const replyEl = buildReply(result.data.reply);
        repliesList.append(replyEl);
        closeReplyForm(commentEl);
        markNew(replyEl);
        report(statusEl, 'Reply posted. Thanks for joining in!', 'success',
               false, {paw : true});
    }

    async function deleteItem(btn, kind) {
        const isComment = kind === 'comment';
        const confirmed = await confirmAction(
            isComment
                ? "Delete this comment and all of its replies? This can't be undone."
                : "Delete this reply? This can't be undone.");
        if (!confirmed) return;
        const id = isComment ? btn.dataset.commentId : btn.dataset.replyId;
        const commentEl = btn.closest('.comment');
        const statusEl = commentStatus(commentEl);
        btn.disabled = true;
        const result = await send(
            `/api/${kind}/${id}`, {method : 'DELETE'},
            `Couldn't delete the ${kind}. Refresh the page and try again.`);
        btn.disabled = false;
        if (!result.ok) {
            report(statusEl, result.error, 'error', result.sessionEnded);
            btn.focus();
            return;
        }
        if (isComment) {
            removeComment(commentEl, statusEl);
        } else {
            removeReply(btn.closest('.reply'), commentEl, statusEl);
        }
    }

    // A deleted comment leaves only its status line ("Comment deleted.") in
    // place for a few seconds, so the result shows where the action happened.
    function removeComment(commentEl, statusEl) {
        drafts.remove(replyDraftKey(commentEl.dataset.commentId));
        const isLive = (node) => node && node.classList.contains('comment') &&
                                 !node.classList.contains('is-removed');
        const neighbour = [ commentEl.nextElementSibling,
                            commentEl.previousElementSibling ].find(isLive);
        [...commentEl.children].forEach(child => {
            if (child !== statusEl) child.remove();
        });
        commentEl.classList.add('is-removed');
        changeCount(-1);
        report(statusEl, 'Comment deleted.', 'success');
        if (neighbour) {
            focusItem(neighbour);
        } else if (heading) {
            heading.focus();
        }
        commentEl.removalTimer =
            window.setTimeout(() => finishRemoval(commentEl), 4000);
    }

    function finishRemoval(commentEl) {
        window.clearTimeout(commentEl.removalTimer);
        commentEl.remove();
        if (!commentsList.querySelector('.comment, .no-comments')) {
            const template = document.getElementById('no-comments-template');
            if (template) commentsList.append(template.content.cloneNode(true));
        }
    }

    function removeReply(replyEl, commentEl, statusEl) {
        const repliesList = replyEl.parentElement;
        const neighbour =
            replyEl.nextElementSibling || replyEl.previousElementSibling;
        replyEl.remove();
        if (!repliesList.querySelector('.reply')) repliesList.remove();
        report(statusEl, 'Reply deleted.', 'success');
        focusItem(neighbour || commentEl);
    }

    // One delegated listener covers server-rendered and newly added items.
    section.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn || !section.contains(btn)) return;
        if (btn.classList.contains('btn-reply')) {
            openReplyForm(btn.closest('.comment'), true);
        } else if (btn.classList.contains('btn-cancel-reply')) {
            closeReplyForm(btn.closest('.comment'));
        } else if (btn.classList.contains('btn-delete-comment')) {
            deleteItem(btn, 'comment');
        } else if (btn.classList.contains('btn-delete-reply')) {
            deleteItem(btn, 'reply');
        }
    });

    section.addEventListener('submit', (e) => {
        const form = e.target;
        if (form.id === 'comment-form') {
            e.preventDefault();
            submitComment(form);
        } else if (form.classList.contains('reply-form')) {
            e.preventDefault();
            submitReply(form);
        }
    });
});
