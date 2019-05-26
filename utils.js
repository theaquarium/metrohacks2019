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

const addPowerStripPoints = (events, user, now) => {
    let recentPowerStrip;
    let powerEvents;
    events.forEach(event => {
        if (event.type == "powerstrip" && event.id == user.id) {
            powerEvents.push(event);
        }
    });
    powerEvents.forEach(function(event) {
        if ((Date.now() - event.timestamp) < 1500000) {
            recentPowerStrip.push(event.current);
        }
    });
    let sum = 0;
    recentPowerStrip.forEach(function(current) {
        sum += current;
    });
    const avg = sum / recentPowerStrip.length;
    const diff = avg - now;
    if (diff > 0) {
        const points = diff*1000;
        user.points += points;
        user.levelpoints += points;
        if (user.levelpoints >= 50*2^(user.level)) {
            user.levelpoints -= 50*2^(user.level);
            user.level++;
        }
    }
    return user;
};

const addCompostPoints = (user) => {
    const points = 100;

    user.points += points;
    user.levelpoints += points;
    if (user.levelpoints >= 50*2^(user.level)) {
        user.levelpoints -= 50*2^(user.level);
        user.level++;
    }
    return user;
};

const addZeroWastePoints = (user) => {
    const points = 250;

    user.points += points;
    user.levelpoints += points;
    if (user.levelpoints >= 50*2^(user.level)) {
        user.levelpoints -= 50*2^(user.level);
        user.level++;
    }
    return user;
};

module.exports = {
    generateToken,
    checkForEventOnDate,
    addCompostPoints,
    addPowerStripPoints,
    addZeroWastePoints,
};
