const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const serviceSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        authorizers: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Authorizer'
            }
        ]
    },
    { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
