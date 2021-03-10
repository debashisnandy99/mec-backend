const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
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
    fatherMecId: {
      type: String,
    },
    motherMecId: {
      type: String,
    },
    address: {
      type: String,
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
