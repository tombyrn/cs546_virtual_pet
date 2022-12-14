const {min_design, max_design, min_bg, max_bg, min_hat, max_hat} = require('./gameConstants').designLimits;
const {ObjectId} = require('mongodb');

// Checks that id (as a string) exists and is a valid mongoDB Object ID. 
// Does *not* check that object with id exists! 
function validateIdString(id){
    if(!id){throw 'Error: Object ID must be provided.'}
    if (typeof id !== 'string'){
        throw 'Error: Object ID input must be a string.'
    }
    id = id.trim()
    if (id.length === 0){
        throw 'Error: Object ID input cannot be only whitespace.'
    }
    if (!ObjectId.isValid(id)){
        throw 'Error: Object ID input is not a valid Object ID.'
    }
    return id;
}

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

function setUserSession(user) {
    return {
        id: user._id, 
        username: user.username, 
        points: user.points, 
        background: user.background, 
        hatsUnlocked: user.hatsUnlocked, 
        backgroundsUnlocked: user.backgroundsUnlocked
    }
}

function validatePoints(points) {
    if(!points){throw 'Error: Points must be provided.'}
    if (typeof points !== 'number' || !Number.isInteger(points)){
        throw 'Error: Points must be an integer.';
    }
    return points;
}

function validateDesignNumber(designNumber) {
    if(!designNumber){throw 'Error: Design number must be provided.'}
    if (typeof designNumber !== 'number' || !Number.isInteger(designNumber)){
        throw 'Error: Design number must be an integer.';
    }
    if (designNumber < min_design || designNumber > max_design){
        throw `Error: Design number must be between ${min_design} and ${max_design} inclusive.`
    }
    return designNumber;
}

function validateHatNumber(hatNumber) {
    if(!hatNumber){throw 'Error: Hat number must be provided.'}
    if (typeof hatNumber !== 'number' || !Number.isInteger(hatNumber)){
        throw 'Error: Hat number must be an integer.';
    }
    if (hatNumber < min_hat || hatNumber > max_hat){
        throw `Error: Hat number must be between ${min_hat} and ${max_hat} inclusive.`
    }
    return hatNumber;
}

function validateBgNumber(bgNumber) {
    if(!bgNumber){throw 'Error: Background number must be provided.'}
    if (typeof bgNumber !== 'number' || !Number.isInteger(bgNumber)){
        throw 'Error: Background number must be an integer.';
    }
    if (bgNumber < min_bg || bgNumber > max_bg){
        throw `Error: Background number must be between ${min_bg} and ${max_bg} inclusive.`
    }
    return bgNumber;
}

module.exports = {
    validateIdString,
    validateName,
    validateEmail,
    validateUsername,
    validatePassword,
    setUserSession,
    validatePoints,
    validateDesignNumber,
    validateHatNumber,
    validateBgNumber
}