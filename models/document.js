const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const documentsSchema = new Schema(
  {
    depId: {
      type: Schema.Types.ObjectId,
      ref: "Department",
    },
    docId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "fail"],
      default: "pending",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    file: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentsSchema);
