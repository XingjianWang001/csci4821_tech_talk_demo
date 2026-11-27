// Client behavior for the Q&A Box Blog.
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

    // Inline, announced feedback instead of alert().
    function showStatus(statusEl, message, type, sessionEnded) {
        if (!statusEl) return;
        statusEl.replaceChildren(message);
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
    const sectionStatus = document.getElementById('comments-status');
    const heading = document.getElementById('comments-heading');
    const countEl = document.getElementById('comment-count');
    const viewerIsAdmin = section.dataset.viewerAdmin === 'true';
    const draftPrefix = `draft:${window.location.pathname}`;
    const commentDraftKey = `${draftPrefix}:comment`;
    const replyDraftKey = (commentId) => `${draftPrefix}:reply:${commentId}`;

    function changeCount(delta) {
        if (!countEl) return;
        const next = Math.max(0, (parseInt(countEl.textContent, 10) || 0) + delta);
        countEl.textContent = String(next);
    }

    function el(tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function authorHeader(className, dateClass, item) {
        const header = el('div', className);
        const author = el('span', 'author-name');
        author.append(el('strong', '', item.is_anonymous ? 'Anonymous'
                                                         : item.username));
        if (item.is_anonymous && viewerIsAdmin) {
            author.append(el('span', 'real-user',
                             `Written by ${item.username} · only admins see this`));
        }
        header.append(author, el('span', dateClass,
                         new Date(item.created_at).toLocaleString()));
        return header;
    }

    function buildReply(reply) {
        const replyEl = el('div', 'reply');
        replyEl.dataset.replyId = reply.id;
        const deleteBtn = el('button', 'btn btn-small btn-delete-reply', 'Delete');
        deleteBtn.type = 'button';
        deleteBtn.dataset.replyId = reply.id;
        deleteBtn.setAttribute('aria-label', 'Delete reply');
        replyEl.append(authorHeader('reply-header', 'reply-date', reply),
                       el('div', 'reply-content', reply.content), deleteBtn);
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
        deleteBtn.setAttribute('aria-label', 'Delete comment');
        // The author of a comment can always reply to it.
        const replyBtn = el('button', 'btn btn-small btn-reply', 'Reply');
        replyBtn.type = 'button';
        replyBtn.dataset.commentId = comment.id;
        replyBtn.setAttribute('aria-label', 'Reply to comment');
        actions.append(deleteBtn, replyBtn);

        const container = el('div', 'reply-form-container');
        container.style.display = 'none';
        const form = el('form', 'reply-form');
        form.dataset.commentId = comment.id;
        const textarea = el('textarea', 'reply-content');
        textarea.name = 'content';
        textarea.placeholder = 'Write your reply...';
        textarea.setAttribute('aria-label', 'Your reply');
        textarea.required = true;
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
        const row = el('div', 'form-row');
        row.append(anonField, submitBtn, cancelBtn);
        const status = el('p', 'form-status');
        status.setAttribute('role', 'status');
        form.append(textarea, row, status);
        container.append(form);

        commentEl.append(authorHeader('comment-header', 'comment-date', comment),
                         el('div', 'comment-content', comment.content), actions,
                         container);
        return commentEl;
    }

    function openReplyForm(commentEl, focus) {
        const container = commentEl.querySelector('.reply-form-container');
        const replyBtn = commentEl.querySelector('.btn-reply');
        container.style.display = 'block';
        if (replyBtn) replyBtn.style.display = 'none';
        if (focus) container.querySelector('.reply-content').focus();
    }

    function closeReplyForm(commentEl) {
        const container = commentEl.querySelector('.reply-form-container');
        const replyBtn = commentEl.querySelector('.btn-reply');
        const form = container.querySelector('.reply-form');
        container.style.display = 'none';
        form.querySelector('.reply-content').value = '';
        form.querySelector('.reply-anonymous-checkbox').checked = false;
        clearStatus(form.querySelector('.form-status'));
        drafts.remove(replyDraftKey(commentEl.dataset.commentId));
        if (replyBtn) {
            replyBtn.style.display = '';
            replyBtn.focus();
        }
    }

    function setBusy(form, busy) {
        form.querySelectorAll('button[type="submit"]').forEach(btn => {
            btn.disabled = busy;
        });
        form.setAttribute('aria-busy', busy ? 'true' : 'false');
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
            form.querySelector('.reply-content').value = saved;
            openReplyForm(form.closest('.comment'), false);
        }
    });

    section.addEventListener('input', (e) => {
        if (e.target.id === 'comment-content') {
            drafts.set(commentDraftKey, e.target.value);
        } else if (e.target.classList.contains('reply-content')) {
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
            showStatus(status, result.error, 'error', result.sessionEnded);
            return;
        }
        const noComments = commentsList.querySelector('.no-comments');
        if (noComments) noComments.remove();
        const commentEl = buildComment(result.data.comment);
        commentsList.append(commentEl);
        commentEl.scrollIntoView(
            {block : 'nearest', behavior : prefersReducedMotion ? 'auto' : 'smooth'});
        changeCount(1);
        textarea.value = '';
        checkbox.checked = false;
        drafts.remove(commentDraftKey);
        showStatus(status, 'Comment posted.', 'success');
    }

    async function submitReply(form) {
        const commentEl = form.closest('.comment');
        const commentId = form.dataset.commentId;
        const textarea = form.querySelector('.reply-content');
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
            showStatus(status, result.error, 'error', result.sessionEnded);
            return;
        }
        let repliesList = commentEl.querySelector('.replies-list');
        if (!repliesList) {
            repliesList = el('div', 'replies-list');
            commentEl.append(repliesList);
        }
        repliesList.append(buildReply(result.data.reply));
        closeReplyForm(commentEl);
        showStatus(sectionStatus, 'Reply posted.', 'success');
    }

    async function deleteItem(btn, kind) {
        const isComment = kind === 'comment';
        const confirmed = await confirmAction(
            isComment
                ? "Delete this comment and all of its replies? This can't be undone."
                : "Delete this reply? This can't be undone.");
        if (!confirmed) return;
        const id = isComment ? btn.dataset.commentId : btn.dataset.replyId;
        btn.disabled = true;
        const result = await send(
            `/api/${kind}/${id}`, {method : 'DELETE'},
            `Couldn't delete the ${kind}. Refresh the page and try again.`);
        btn.disabled = false;
        if (!result.ok) {
            showStatus(sectionStatus, result.error, 'error', result.sessionEnded);
            btn.focus();
            return;
        }
        if (isComment) {
            const commentEl = btn.closest('.comment');
            drafts.remove(replyDraftKey(commentEl.dataset.commentId));
            commentEl.remove();
            changeCount(-1);
            if (!commentsList.querySelector('.comment')) {
                commentsList.append(el('p', 'no-comments', 'No comments yet.'));
            }
        } else {
            const repliesList = btn.closest('.replies-list');
            btn.closest('.reply').remove();
            if (repliesList && !repliesList.querySelector('.reply')) {
                repliesList.remove();
            }
        }
        showStatus(sectionStatus, isComment ? 'Comment deleted.' : 'Reply deleted.',
                   'success');
        // The button that had focus is gone; keep keyboard users in place.
        if (heading) heading.focus();
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
