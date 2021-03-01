const Verifier = require("../models/verifier");
const User = require("../models/user");

exports.getDocuments = async (department) => {
  if (department == "adhaar") {
    return await User.find({
      avStatus: false,
    }).select({ adhaar: 1, _id: 0, name: 1, dob: 1 });
  } else if (department == "pan") {
    return await User.find({
      pvStatus: false,
    });
  }

  return await User.find({
    department: department,
  });
};
