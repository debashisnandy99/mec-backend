const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const authorizerSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    authorizerCode: {
      type: String,
      required: true
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Authorizer', authorizerSchema);
