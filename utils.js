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
            return { token: result.ops[0].token, id: result.ops[0].id };
        }
    });
};

const verifyUser = (db, id) => {
    console.log('fsa');
    const collection = db.collection('users');
    const userFile = collection.findOne({ google_token: id });
    if (userFile) {
        return { token: userFile.token, id: userFile.id };
    } else {
        return;
    }
};

const getUserData = (db, id, token) => {
    const collection = db.collection('users');
    const userFile = collection.findOne({ google_token: id });
    if (userFile) {
        return { token: userFile.token, id: userFile.id };
    } else {
        return;
    }
};

const generateToken = () => uuidv4();

module.exports = {
    addUser,
    verifyUser,
};
