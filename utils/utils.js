const rimraf = require("rimraf");
var fs = require('fs');
const ipfsClient = require("ipfs-http-client");
const ganache = require("ganache-cli");
const mongoose = require("mongoose");
const Web3 = require("web3");

const User = require("../models/user");
const Document = require("../models/document");

exports.getPendingDocuments = async (department, currentPage, perPage) => {
  return Document.find({ depId: department, status: "pending" })
    .populate("user", {
      dob: 1,
      fathersName: 1,
      mothersName: 1,
      address: 1,
      phone: 1,
    })
    .skip((currentPage - 1) * perPage)
    .limit(perPage);
};

exports.getVerifiedDocuments = async (department, currentPage, perPage) => {
  return Document.find({ depId: department, status: "verified" })
    .populate("user", {
      dob: 1,
      fathersName: 1,
      mothersName: 1,
      address: 1,
      phone: 1,
    })
    .skip((currentPage - 1) * perPage)
    .limit(perPage);
};

exports.getFailedDocuments = async (department, currentPage, perPage) => {
  return Document.find({ depId: department, status: "verified" })
    .populate("user", {
      dob: 1,
      fathersName: 1,
      mothersName: 1,
      address: 1,
      phone: 1,
    })
    .skip((currentPage - 1) * perPage)
    .limit(perPage);
};

exports.startVerification = async (department, status, file, res, next) => {
  if (!file) {
    if (status == "verified") {
      const error = new Error("No image provided.");
      error.statusCode = 422;
      throw error;
    }
  }

  const doc = await Document.findOne({ depId: department });

  Document.updateOne(
    { depId: department },
    {
      status: status,
      file: status=="fail" ? doc.file : file.path,
    },
    function (err, raw) {
      if (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      } else {
        if (status == "verified") {
          fs.rmSync(doc.file, {
            force: true,
            recursive: true,
          });
        }

        res.status(200).json({
          message: "Verified successfully.",
        });
      }
    }
  );
};
