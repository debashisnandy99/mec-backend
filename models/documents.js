const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const documentsSchema = new Schema({
  name: {
    type: Schema.Types.ObjectId,
    ref: "Department",
  },
  status: {
    type: String,
    enum: ["pending", "verified", "fail"],
    default: "pending",
  },
}, {timestamps:true});
