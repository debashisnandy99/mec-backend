const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const loginLogsSchema = new Schema(
  {
    ip: {
      type: String,
      required: true,
    },
    os: {
      type: String,
      required: true,
    },
    kioskId: {
      type: Schema.Types.ObjectId,
      ref: "Kiosk",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LoginLogs", loginLogsSchema);
