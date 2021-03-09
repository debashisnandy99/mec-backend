const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const kioskSchema = new Schema(
  {
    address: {
      type: String,
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Kiosk', kioskSchema)