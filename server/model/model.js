const mongoose = require('mongoose');
let schema = new mongoose.Schema(
    {
        active: {
            type: String
        },
        status: {
            type: String
        }
    },
    {timestamps: true}
)

const userDB = mongoose.model('nobr users', schema);
module.exports = userDB;