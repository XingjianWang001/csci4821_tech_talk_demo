// The one place field-error wording lives. server.js requires this file and
// the browser loads it before main.js, so a problem reads the same whichever
// side caught it.
(function (root) {
    const FIELD_MESSAGES = {
        empty : 'Write something here first.',
        spaces : "Spaces alone don't count. Write something here.",
        passwordMismatch :
            "The passwords don't match. Enter the same password in both fields.",
        usernameTaken : 'That username is taken. Choose a different one.',
        // Deliberately the same for an unknown user and a wrong password.
        wrongCredentials :
            "That username and password don't match. Check them and try again."
    };

    // The message for a required field that is empty or only whitespace, or
    // '' when it's filled. Passwords only have to be non-empty: spaces are
    // real characters in a password.
    function blankMessage(value, kind) {
        if (typeof value !== 'string' || value === '') return FIELD_MESSAGES.empty;
        if (kind !== 'password' && value.trim() === '') return FIELD_MESSAGES.spaces;
        return '';
    }

    const api = {FIELD_MESSAGES, blankMessage};
    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    } else {
        root.FieldMessages = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
