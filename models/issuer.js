const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const issuerSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        department: {
            type: Schema.Types.ObjectId,
            ref: "Department",
            required: true
        },
        password: {
            type: String,
            required: true
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Issuer', issuerSchema);
