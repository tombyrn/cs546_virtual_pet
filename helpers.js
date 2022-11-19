async function validateUsernamePassword(username, password){
    if(!username || typeof username !== 'string' || username.trim().length < 4 || /[^A-Za-z 0-9]/.test(username.trim()) || /\s/.test(username.trim()))
        throw 'Error: Invalid username'
    if(!password || typeof password !== 'string' || password.trim().length < 6 || /\s/.test(password.trim()) || !/[A-Z]/.test(password.trim()) || !/[^A-Za-z0-9]/.test(password.trim()))
        throw 'Error: Invalid password'
}

module.exports = {validateUsernamePassword}