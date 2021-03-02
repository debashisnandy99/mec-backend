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
    required: true
  },
  doi: {
    type: String,
  },
  fathersName: {
    type: String,
    required: true
  },
  mothersName: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  walletAddress: {
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
    required: true
  },
  signature: {
    type: String,
    required: true
  },
  adhaar: {
    type: String,
    required: true
  },
  pan: {
    type: String,
    required: true
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
  services: [{
    type: Schema.Types.ObjectId,
    ref: 'Service'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);