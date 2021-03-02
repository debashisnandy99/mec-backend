const Verifier = require("../models/verifier");
const User = require("../models/user");

exports.getDocuments = async (department) => {
  if (department == "adhaar") {
    return await User.find({
      avStatus: false,
    }).select({
      adhaar: 1,
      name: 1,
      dob: 1,
      fathersName: 1,
      mothersName: 1,
      address: 1,
      phone: 1,
      photo: 1
    });
  } else if (department == "pan") {
    return await User.find({
      pvStatus: false,
    }).select({
      adhaar: 1,
      name: 1,
      dob: 1,
      fathersName: 1,
      mothersName: 1,
      address: 1,
      phone: 1,
      photo: 1
    });
  }

  return await User.find({
    department: department,
  });
};

exports.startVerification = (department, userId, status) => {

  if (department == "adhaar") {
    User.updateOne({
      _id: userId
    }, {
      avStatus: status ? 'verified' : 'fail'
    }, function (err, raw) {
      if (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      } else {
        res.status(200).json({
          message: "Verified successfully.",
        });
      }
    });
  } else if (department == "pan") {
    User.updateOne({
      _id: userId
    }, {
      pvStatus: status ? 'verified' : 'fail'
    }, function (err, raw) {
      if (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      } else {
        res.status(200).json({
          message: "Verified successfully.",
        });
      }
    });


  }



}