const registerForm = document.getElementById('login-form');

if (registerForm){
    const firstNameInput = document.getElementById('firstNameInput');
    const firstNameError = document.getElementById('firstNameError');
    const lastNameInput = document.getElementById('lastNameInput');
    const lastNameError = document.getElementById('lastNameError');
    const usernameInput = document.getElementById('usernameInput');
    const usernameError = document.getElementById('usernameError');
    const passwordInput = document.getElementById('passwordInput');
    const passwordError = document.getElementById('passwordError');
    const emailInput = document.getElementById('emailInput');
    const emailError = document.getElementById('emailError');
    const otherError = document.getElementById('otherError');

    function validateName(name, prefix){
        if(!name){throw `Error: ${prefix} name must be provided.`}
        if (typeof name !== 'string'){
            throw `Error: ${prefix} name must be a string`
        }
        name = name.trim().toLowerCase()
        if (name.length === 0){
            throw `Error: ${prefix} name cannot be only whitespace.`
        }
        if (/[^a-z]/.test(name)){
            throw `Error: ${prefix} name may only contain alphabetical characters.`
        }
    
        return name
    }
    
    function validateEmail(email){
        if(!email){throw `Error: Email must be provided.`}
        if (typeof email !== 'string'){
            throw 'Error: Email must be a string.'
        }
        email = email.trim().toLowerCase()
        if (email.length === 0){
            throw 'Error: Email cannot be only whitespace'
        }
        // Source for email regex: https://www.w3resource.com/javascript/form/email-validation.php
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)){
            throw 'Error: Cannot parse email input.'
        }
        return email;
    }

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

    registerForm.addEventListener('submit', (event) => {
        // Adapted from https://stackoverflow.com/questions/10842471/how-to-remove-all-elements-of-a-certain-class-from-the-dom
        if (otherError) otherError.parentElement.removeChild(otherError);

        firstNameError.textContent = '';
        lastNameError.textContent = '';
        usernameError.textContent = '';
        passwordError.textContent = '';
        emailError.textContent = '';

        let valid = true;

        try {
            validateName(firstNameInput.value, 'First');
        } catch (e) {
            valid = false;
            firstNameError.textContent = e;
        }
        try {
            validateName(lastNameInput.value, 'Last');
        } catch (e) {
            valid = false;
            lastNameError.textContent = e;
        }
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
        try {
            validateEmail(emailInput.value);
        } catch (e) {
            valid = false;
            emailError.textContent = e;
        }

        if(!valid) {
            event.preventDefault();
        }
    })
}