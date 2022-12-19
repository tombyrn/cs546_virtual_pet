const loginForm = document.getElementById('login-form');

if (loginForm){
    const usernameInput = document.getElementById('usernameInput');
    const usernameError = document.getElementById('usernameError');
    const passwordInput = document.getElementById('passwordInput');
    const passwordError = document.getElementById('passwordError');
    const otherError = document.getElementById('otherError');

    function validateUsername(username) {
        if(!username){throw `Error: Username must be provided.`}
        if (typeof username !== 'string'){
            throw 'Error: Username must be a string.'
        }
        username = username.trim().toLowerCase();
        if (username.length < 4){
            throw 'Error: Username must be at least four characters (not counting whitespace).'
        }
        if (/[^a-z0-9]/.test(username)){
            throw 'Error: Username may only contain alphanumeric characters.'
        }
    
        return username
    }
    
    function validatePassword(password) {
        if(!password){throw 'Error: Password must be provided.'}
        if (typeof password !== 'string'){
            throw 'Error: Password must be a string.';
        }
        if (password.length < 6){
            throw 'Error: Password must be at least six characters (not counting whitespace).';
        }
        if (/\s/.test(password)){
            throw 'Error: Password may not contain whitespace.'
        }
        if (!/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)){
            throw 'Error: Password must contain at least one uppercase, \
            one numeric, and one special character.'
        }
    
        return password;
    }

    loginForm.addEventListener('submit', (event) => {
        // Adapted from https://stackoverflow.com/questions/10842471/how-to-remove-all-elements-of-a-certain-class-from-the-dom
        if (otherError) otherError.parentElement.removeChild(otherError);

        usernameError.textContent = '';
        passwordError.textContent = '';

        let valid = true;

        try {
            validateUsername(usernameInput.value);
        } catch (e) {
            valid = false;
            usernameError.textContent = e;
        }
        try {
            validatePassword(passwordInput.value);
        } catch (e) {
            valid = false;
            passwordError.textContent = e;
        }

        if(!valid) {
            event.preventDefault();
        }
    })
}