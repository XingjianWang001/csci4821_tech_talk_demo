document.addEventListener('DOMContentLoaded', () => {
    const commentForm = document.getElementById('comment-form');
    const deleteButtons = document.querySelectorAll('.btn-delete-comment');

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
                    alert('Error: ' +
                          (error.error || 'Failed to post comment'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to post comment. Please try again.');
            }
        });
    }

    deleteButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            if (!confirm('Are you sure you want to delete this comment?')) {
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
                    alert('Error: ' +
                          (error.error || 'Failed to delete comment'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to delete comment. Please try again.');
            }
        });
    });

    function addCommentToDOM(comment) {
        const commentsList = document.querySelector('.comments-list');
        const noComments = commentsList.querySelector('.no-comments');
        if (noComments) {
            noComments.remove();
        }

        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment';
        commentDiv.setAttribute('data-comment-id', comment.id);

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

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-small btn-delete-comment';
        deleteBtn.setAttribute('data-comment-id', comment.id);
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', async () => {
            if (!confirm('Are you sure you want to delete this comment?')) {
                return;
            }

            try {
                const response = await fetch(`/api/comment/${comment.id}`,
                                             {method : 'DELETE'});

                if (response.ok) {
                    commentDiv.remove();
                } else {
                    const error = await response.json();
                    alert('Error: ' +
                          (error.error || 'Failed to delete comment'));
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to delete comment. Please try again.');
            }
        });

        commentDiv.appendChild(commentHeader);
        commentDiv.appendChild(commentContent);
        commentDiv.appendChild(deleteBtn);

        commentsList.appendChild(commentDiv);
    }
});
