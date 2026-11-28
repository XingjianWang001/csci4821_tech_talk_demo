// The one place field-error wording lives. server.js requires this file and
// the browser loads it before main.js, so a problem reads the same whichever
// side caught it.
(function (root) {
    const FIELD_MESSAGES = {
        empty : 'Write something here first.',
        spaces : "Spaces alone don't count. Write something here.",
        // The title has its own wording, so it names what's missing.
        titleEmpty : 'Give your question box a title.',
        titleSpaces : "Spaces alone don't count. Give your question box a title.",
        passwordMismatch :
            "The passwords don't match. Enter the same password in both fields.",
        usernameTaken : 'That username is taken. Choose a different one.',
        // Deliberately the same for an unknown user and a wrong password.
        wrongCredentials :
            "That username and password don't match. Check them and try again."
    };

    // The message for a required field that is empty or only whitespace, or
    // '' when it's filled. `kind` is 'title' for the question box title (its
    // own wording) or 'password' (only has to be non-empty: spaces are real
    // characters in a password); anything else gets the general wording.
    function blankMessage(value, kind) {
        const isTitle = kind === 'title';
        if (typeof value !== 'string' || value === '') {
            return isTitle ? FIELD_MESSAGES.titleEmpty : FIELD_MESSAGES.empty;
        }
        if (kind !== 'password' && value.trim() === '') {
            return isTitle ? FIELD_MESSAGES.titleSpaces : FIELD_MESSAGES.spaces;
        }
        return '';
    }

    // The same check for a form field in the browser: passwords by type,
    // everything else by name, so the title gets its own wording.
    function fieldBlankMessage(field) {
        return blankMessage(field.value,
                            field.type === 'password' ? 'password' : field.name);
    }

    const api = {FIELD_MESSAGES, blankMessage, fieldBlankMessage};
    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    } else {
        root.FieldMessages = api;
    }
})(typeof window !== 'undefined' ? window : globalThis);
