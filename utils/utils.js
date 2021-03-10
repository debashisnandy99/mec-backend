const rimraf = require("rimraf");
const ipfsClient = require('ipfs-http-client');
const ganache = require("ganache-cli");
const Web3 = require('web3');

const User = require("../models/user");
const Document = require("../models/document");



exports.getDocuments = async (department) => {

  return await Document
  .find({department: department})
  .populate('user', {
    dob: 1,
    fathersName: 1,
    mothersName: 1,
    address: 1,
    phone: 1,
    photo: 1
  })

 
};

exports.startVerification = (department, userId, status, res, next) => {

  if (department == "adhaar") {
    User.updateOne({
      _id: userId
    }, {
      avStatus: status,
      avTime: Date.now()
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
      pvStatus: status,
      pvTime: Date.now()
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
  } else if (department == "birth") {
    User.updateOne({
      _id: userId
    }, {
      bdStatus: status,
      bdTime: Date.now()
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

