const uuidv4 = require('uuid/v4');

const generateToken = () => uuidv4();

const checkForEventOnDate = (events, type, date) => {
    for (let i = 0; i < events.length; i++) {
        const event = events[i];
        if (event.type == type && event.date == date) {
            return false;
        }
    }
    return true;
};
module.exports = {
    generateToken,
    checkForEventOnDate,
};
