const uuidv4 = require('uuid/v4');

const generateToken = () => uuidv4();

module.exports = {
    generateToken,
};
