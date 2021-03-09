const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  dob: {
    type: String,
  },
  doi: {
    type: String,
  },
  fathersName: {
    type: String,
  },
  mothersName: {
    type: String,
  },
  address: {
    type: String,
  },
  transactionHash: {
    type: String,
  },
  mecId: {
    type: String,
  },
  phone: {
    type: String,
    required: true
  },
  photo: {
    type: String,
  },
  signature: {
    type: String,
  },
  adhaar: {
    type: String,
  },
  pan: {
    type: String,
  },
  birthCertificate: {
    type: String,
  },
  avStatus: {
    type: String,
    enum: ['pending', 'verified', 'fail'],
    default: 'pending'
  },
  pvStatus: {
    type: String,
    enum: ['pending', 'verified', 'fail'],
    default: 'pending'
  },
  bdStatus: {
    type: String,
    enum: ['pending', 'verified', 'fail'],
    default: 'pending'
  },
  services: [{
    type: Schema.Types.ObjectId,
    ref: 'Service'
  }],
  loginLogs: [
    {
      type: Schema.Types.ObjectId,
      ref: 'LoginLogs'
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);