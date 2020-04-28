const execSync = require('child_process').execSync;

module.exports = () => {
    let name;
    let email;

    try {
        name = execSync('git config --get user.name');
        email = execSync('git config --get user.emial');
    } catch (e) {}

    name = name && JSON.stringify(name.toString().trim()).slice(1, -1);
    email = email && (' <' + email.toString().trim() + '>');
    return {
        name: name || '',
        email: email || ''
    };
};
