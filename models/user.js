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
    required:true
  },
  walletAddress: {
    type: String,
    required: true
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
    type:String,
    required: true
  },
  pan:{
    type:String,
    required:true
  },
  services: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Service'
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
