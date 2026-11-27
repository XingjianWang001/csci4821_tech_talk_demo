document.addEventListener('DOMContentLoaded', () => {
    const commentForm = document.getElementById('comment-form');
    const deleteCommentButtons =
        document.querySelectorAll('.btn-delete-comment');
    const replyButtons = document.querySelectorAll('.btn-reply');
    const deleteReplyButtons = document.querySelectorAll('.btn-delete-reply');
    if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const content = document.getElementById('comment-content').value;
            const isAnonymous =
                document.getElementById('anonymous-checkbox').checked;
            const postId = window.location.pathname.split('/')[2];
            try {
                const response = await fetch('/api/comment', {
                    method : 'POST',
                    headers : {'Content-Type' : 'application/json'},
                    body : JSON.stringify({
                        post_id : postId,
                        content : content,
                        is_anonymous : isAnonymous
                    })
                });
                if (response.ok) {
                    const data = await response.json();
                    addCommentToDOM(data.comment);
                    document.getElementById('comment-content').value = '';
                    document.getElementById('anonymous-checkbox').checked =
                        false;
                } else {
                    const error = await response.json();
                    alert(error.error ||
                          "Couldn't add your comment. Refresh the page and try again.");
                }
            } catch (error) {
                console.error('Error: ', error);
                alert(
                    "Couldn't add your comment. Refresh the page and try again.");
            }
        });
    }

    deleteCommentButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm(
                    "Delete this comment and all of its replies? This can't be undone.")) {
                return;
            }
            const commentId = btn.getAttribute('data-comment-id');
            try {
                const response = await fetch(`/api/comment/${commentId}`,
                                             {method : 'DELETE'});
                if (response.ok) {
                    const commentElement = btn.closest('.comment');
                    commentElement.remove();
                } else {
                    const error = await response.json();
                    alert(error.error ||
                          "Couldn't delete the comment. Refresh the page and try again.");
                }
            } catch (error) {
                console.error('Error:', error);
                alert(
                    "Couldn't delete the comment. Refresh the page and try again.");
            }
        });
    });

    replyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const commentId = btn.getAttribute('data-comment-id');
            const comment = btn.closest('.comment');
            const replyFormContainer =
                comment.querySelector('.reply-form-container');
            replyFormContainer.style.display = 'block';
            btn.style.display = 'none';
        });
    });
    document.querySelectorAll('.btn-cancel-reply').forEach(btn => {
        btn.addEventListener('click', () => {
            const form = btn.closest('.reply-form-container');
            const comment = btn.closest('.comment');
            const replyBtn = comment.querySelector('.btn-reply');
            form.style.display = 'none';
            if (replyBtn) replyBtn.style.display = 'inline-block';
            form.querySelector('.reply-content').value = '';
            form.querySelector('.reply-anonymous-checkbox').checked = false;
        });
    });
    document.querySelectorAll('.reply-form').forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const commentId = form.getAttribute('data-comment-id');
            const content = form.querySelector('.reply-content').value;
            const isAnonymous =
                form.querySelector('.reply-anonymous-checkbox').checked;
            try {
                const response = await fetch('/api/reply', {
                    method : 'POST',
                    headers : {'Content-Type' : 'application/json'},
                    body : JSON.stringify({
                        comment_id : commentId,
                        content : content,
                        is_anonymous : isAnonymous
                    })
                });
                if (response.ok) {
                    const data = await response.json();
                    addReplyToDOM(commentId, data.reply);
                    form.querySelector('.reply-content').value = '';
                    form.querySelector('.reply-anonymous-checkbox').checked =
                        false;
                    form.closest('.reply-form-container').style.display =
                        'none';
                    const replyBtn =
                        form.closest('.comment').querySelector('.btn-reply');
                    if (replyBtn) replyBtn.style.display = 'inline-block';
                } else {
                    const error = await response.json();
                    alert(error.error ||
                          "Couldn't add your reply. Refresh the page and try again.");
                }
            } catch (error) {
                console.error('Error:', error);
                alert(
                    "Couldn't add your reply. Refresh the page and try again.");
            }
        });
    });

    deleteReplyButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm("Delete this reply? This can't be undone.")) {
                return;
            }
            const replyId = btn.getAttribute('data-reply-id');
            try {
                const response =
                    await fetch(`/api/reply/${replyId}`, {method : 'DELETE'});
                if (response.ok) {
                    const replyElement = btn.closest('.reply');
                    replyElement.remove();
                } else {
                    const error = await response.json();
                    alert(error.error ||
                          "Couldn't delete the reply. Refresh the page and try again.");
                }
            } catch (error) {
                console.error('Error:', error);
                alert(
                    "Couldn't delete the reply. Refresh the page and try again.");
            }
        });
    });

    function addReplyToDOM(commentId, reply) {
        const comment =
            document.querySelector(`.comment[data-comment-id="${commentId}"]`);
        let repliesList = comment.querySelector('.replies-list');
        if (!repliesList) {
            repliesList = document.createElement('div');
            repliesList.className = 'replies-list';
            comment.appendChild(repliesList);
            repliesList.addEventListener('click', async (e) => {
                if (e.target.classList.contains('btn-delete-reply')) {
                    const replyId = e.target.getAttribute('data-reply-id');
                    if (!confirm("Delete this reply? This can't be undone.")) {
                        return;
                    }
                    try {
                        const res = await fetch(`/api/reply/${replyId}`,
                                                {method : 'DELETE'});
                        if (res.ok) {
                            e.target.closest('.reply').remove();
                        } else {
                            alert(
                                "Couldn't delete the reply. Refresh the page and try again.");
                        }
                    } catch (err) {
                        console.error(err);
                        alert(
                            "Couldn't delete the reply. Refresh the page and try again.");
                    }
                }
            });
        }
        let displayName;
        if (reply.is_anonymous) {
            displayName = 'Anonymous';
        } else {
            displayName = reply.username;
        }
        const dateStr = new Date(reply.created_at).toLocaleString();
        repliesList.insertAdjacentHTML(
            'beforeend',  // use insertAdjacentHTML to handle comment elegantly
            `
            <div class="reply" data-reply-id="${reply.id}">
                <div class="reply-header">
                    <strong>${displayName}</strong>
                    <span class="reply-date">${dateStr}</span>
                </div>
                <div class="reply-content">${reply.content}</div>
                <button class="btn btn-small btn-delete-reply" data-reply-id="${
                reply.id}">Delete</button>
            </div>
        `);
    }

    function addCommentToDOM(comment) {
        const commentsList = document.querySelector('.comments-list');
        const noComments = commentsList.querySelector('.no-comments');
        if (noComments) {
            noComments.remove();
        }
        // Get post and user info from existing page elements
        const existingComment = document.querySelector('.comment');
        let postId, postAuthorId;
        if (existingComment) {
            postId = existingComment.getAttribute('data-post-id');
            postAuthorId = existingComment.getAttribute('data-post-id');
        } else {
            postId = null;
            postAuthorId = null;
        }
        const userInfoElement = document.querySelector(
            '.welcome');  // try to get current user info from page context
        const isLoggedIn = userInfoElement !== null;
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment';
        commentDiv.setAttribute('data-comment-id', comment.id);
        if (postId) commentDiv.setAttribute('data-post-id', postId);
        commentDiv.setAttribute('data-comment-author-id', comment.user_id);
        const commentHeader = document.createElement('div');
        commentHeader.className = 'comment-header';
        const userName = document.createElement('strong');
        if (comment.is_anonymous) {
            userName.textContent = 'Anonymous';
        } else {
            userName.textContent = comment.username;
        }
        const commentDate = document.createElement('span');
        commentDate.className = 'comment-date';
        commentDate.textContent = new Date(comment.created_at).toLocaleString();
        commentHeader.appendChild(userName);
        commentHeader.appendChild(commentDate);
        const commentContent = document.createElement('div');
        commentContent.className = 'comment-content';
        commentContent.textContent = comment.content;
        // Create comment actions container
        const commentActions = document.createElement('div');
        commentActions.className = 'comment-actions';
        // Add Delete button (always show for comment owner)
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-small btn-delete-comment';
        deleteBtn.setAttribute('data-comment-id', comment.id);
        deleteBtn.textContent = 'Delete';
        deleteBtn.setAttribute('aria-label', 'Delete comment');
        deleteBtn.addEventListener('click', async () => {
            if (!confirm(
                    "Delete this comment and all of its replies? This can't be undone.")) {
                return;
            }
            try {
                const response = await fetch(`/api/comment/${comment.id}`,
                                             {method : 'DELETE'});
                if (response.ok) {
                    commentDiv.remove();
                } else {
                    const error = await response.json();
                    alert(error.error ||
                          "Couldn't delete the comment. Refresh the page and try again.");
                }
            } catch (error) {
                console.error('Error:', error);
                alert(
                    "Couldn't delete the comment. Refresh the page and try again.");
            }
        });
        commentActions.appendChild(deleteBtn);
        if (isLoggedIn) {  // Add Reply button if user is logged in
            const replyBtn = document.createElement('button');
            replyBtn.className = 'btn btn-small btn-reply';
            replyBtn.setAttribute('data-comment-id', comment.id);
            replyBtn.textContent = 'Reply';
            replyBtn.setAttribute('aria-label', 'Reply to comment');
            replyBtn.addEventListener('click', () => {
                const replyFormContainer =
                    commentDiv.querySelector('.reply-form-container');
                replyFormContainer.style.display = 'block';
                replyBtn.style.display = 'none';
            });
            commentActions.appendChild(replyBtn);
        }
        const replyFormContainer = document.createElement('div');
        replyFormContainer.className = 'reply-form-container';
        replyFormContainer.style.display = 'none';
        const replyForm = document.createElement('form');
        replyForm.className = 'reply-form';
        replyForm.setAttribute('data-comment-id', comment.id);
        const replyTextarea = document.createElement('textarea');
        replyTextarea.className = 'reply-content';
        replyTextarea.name = 'content';
        replyTextarea.placeholder = 'Write your reply...';
        replyTextarea.setAttribute('aria-label', 'Your reply');
        replyTextarea.required = true;
        const formRow = document.createElement('div');
        formRow.className = 'form-row';
        const label = document.createElement('label');
        const anonymousCheckbox = document.createElement('input');
        anonymousCheckbox.className = 'reply-anonymous-checkbox';
        anonymousCheckbox.type = 'checkbox';
        anonymousCheckbox.name = 'is_anonymous';
        label.appendChild(anonymousCheckbox);
        label.appendChild(document.createTextNode(' Reply anonymously'));
        const anonField = document.createElement('div');
        anonField.className = 'anon-field';
        const anonHint = document.createElement('p');
        anonHint.className = 'field-hint';
        anonHint.id = `reply-anonymous-hint-${comment.id}`;
        anonHint.textContent =
            'Hidden from other readers. Admins can still see who wrote it.';
        anonymousCheckbox.setAttribute('aria-describedby', anonHint.id);
        anonField.appendChild(label);
        anonField.appendChild(anonHint);
        const submitBtn = document.createElement('button');
        submitBtn.className = 'btn btn-small btn-primary';
        submitBtn.type = 'submit';
        submitBtn.textContent = 'Add Reply';
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'btn btn-small btn-cancel-reply';
        cancelBtn.type = 'button';
        cancelBtn.textContent = 'Cancel';
        cancelBtn.addEventListener('click', () => {
            replyFormContainer.style.display = 'none';
            const replyBtn = commentDiv.querySelector('.btn-reply');
            if (replyBtn) replyBtn.style.display = 'inline-block';
            replyTextarea.value = '';
            anonymousCheckbox.checked = false;
        });
        formRow.appendChild(anonField);
        formRow.appendChild(submitBtn);
        formRow.appendChild(cancelBtn);
        replyForm.appendChild(replyTextarea);
        replyForm.appendChild(formRow);
        replyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const content = replyTextarea.value;
            const isAnonymous = anonymousCheckbox.checked;
            try {
                const response = await fetch('/api/reply', {
                    method : 'POST',
                    headers : {'Content-Type' : 'application/json'},
                    body : JSON.stringify({
                        comment_id : comment.id,
                        content : content,
                        is_anonymous : isAnonymous
                    })
                });
                if (response.ok) {
                    const data = await response.json();
                    addReplyToDOM(comment.id, data.reply);
                    replyTextarea.value = '';
                    anonymousCheckbox.checked = false;
                    replyFormContainer.style.display = 'none';
                    const replyBtn = commentDiv.querySelector('.btn-reply');
                    if (replyBtn) replyBtn.style.display = 'inline-block';
                } else {
                    const error = await response.json();
                    alert(error.error ||
                          "Couldn't add your reply. Refresh the page and try again.");
                }
            } catch (error) {
                console.error('Error:', error);
                alert(
                    "Couldn't add your reply. Refresh the page and try again.");
            }
        });
        replyFormContainer.appendChild(replyForm);

        commentDiv.appendChild(commentHeader);  // Assemble the comment
        commentDiv.appendChild(commentContent);
        commentDiv.appendChild(commentActions);
        commentDiv.appendChild(replyFormContainer);
        commentsList.appendChild(commentDiv);
    }
});
