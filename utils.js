const uuidv4 = require('uuid/v4');

const addUser = (db, id) => {
    const collection = db.collection('users');
    collection.insertOne({
        id: generateToken(),
        google_token: id,
        token: generateToken(),
        friends: {},
    }, function(err, result) {
        if (err) {
            return;
        } else {
            return result.ops[0].token;
        }
    });
};

const verifyUser = (db, id) => {
    const collection = db.collection('users');
    const userFile = collection.findOne({ google_token: id });
    if (userFile) {
        return userFile.token;
    } else {
        return;
    }
};

const generateToken = () => uuidv4();

module.exports = {
    addUser,
    verifyUser,
};
