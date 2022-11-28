function validateName(name, prefix){
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
    if (typeof username !== 'string'){
        throw 'Error: username must be a string.'
    }
    username = username.trim().toLowerCase();
    if (username.length < 4){
        throw 'Error: username must be at least four characters (not counting whitespace).'
    }
    if (/[^a-z0-9]/.test(username)){
        throw 'Error: username may only contain alphanumeric characters.'
    }

    return username
}

function validatePassword(password) {
    if (typeof password !== 'string'){
        throw 'Error: password must be a string.';
    }
    if (password.length < 6){
        throw 'Error: password must be at least six characters (not counting whitespace).';
    }
    if (/\s/.test(password)){
        throw 'Error: password may not contain whitespace.'
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)){
        throw 'Error: password must contain at least one uppercase, \
        one numeric, and one special character.'
    }

    return password;
}

module.exports = {
    validateName,
    validateEmail,
    validateUsername,
    validatePassword
}