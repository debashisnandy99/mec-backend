const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const youngUserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    dob: {
      type: String,
    },
    father: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    mother: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    transactionHash: [
      {
        type: String,
      },
    ],
    mecId: {
      type: String,
    },
    docId: {
      type: String,
    },
    file: {
      type: String,
      required: true,
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

module.exports = mongoose.model("YoungUser", youngUserSchema);
