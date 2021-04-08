const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
    },
    dob: {
      type: String,
    },
    fathersName: {
      type: String,
    },
    mothersName: {
      type: String,
    },
    fathersStatus: {
      type: String,
    },
    fathersMecId: {
      type: String,
    },
    mothersStatus: {
      type: String,
    },
    mothersMecId: {
      type: String,
    },
    address: {
      type: String,
    },
    state: {
      type: String,
    },
    district: {
      type: String,
    },
    paddress: {
      type: String,
    },
    pstate: {
      type: String,
    },
    pdistrict: {
      type: String,
    },
    isAddressSame: {
      type: Boolean,
    },
    transactionHash: [
      {
        type: String,
      },
    ],
    mecId: {
      type: String,
    },
    phone: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
    },
    signature: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    services: [
      {
        type: Schema.Types.ObjectId,
        ref: "Service",
      },
    ],
    loginLogs: [
      {
        type: Schema.Types.ObjectId,
        ref: "LoginLogs",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
