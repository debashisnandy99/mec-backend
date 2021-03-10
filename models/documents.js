const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const documentsSchema = new Schema({
  name: {
    type: Schema.Types.ObjectId,
    ref: "Department",
  },
  docId:{
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "verified", "fail"],
    default: "pending",
  },
  file: [
      {
          type:String
      }
  ]
}, {timestamps:true});

module.exports = mongoose.model("Documents", userSchema);
