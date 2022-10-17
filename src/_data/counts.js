const entries = require('./entries.json');

module.exports = {
    maxId: entries
        .map(entry => Number(entry.ID))
        .filter(id => !isNaN(id))
        .reduce((max, id) => id > max ? id : max, 0),
}