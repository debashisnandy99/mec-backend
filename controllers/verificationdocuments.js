const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Verifier = require("../models/issuer");
const User = require("../models/user");
const uploadDocsFile = require("../middleware/uploaddocs");
const Department = require("../models/department");
const Utils = require("../utils/utils");
const Document = require("../models/document");

exports.getVerification = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }
  const docsHeader = req.get("Docs");
  if (!docsHeader) {
    const error = new Error("Type of docs not specified");
    error.statusCode = 401;
    throw error;
  }
  const currentPage = req.query.page || 1;
  const perPage = 8;

  console.log(docsHeader);

  Utils.getDocuments(req.department, currentPage, perPage, docsHeader)
    .then((value) => {
      res.status(200).json({
        message: "Fetched Docs successfully.",
        doc: value,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.verifyDocs = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }
  try {
    await uploadDocsFile(req, res);
    if (!req.file) {
      const error = new Error("No image provided.");
      error.statusCode = 422;
      throw error;
    }
    const status = req.body.status;

    Utils.startVerification(
      req.department,
      req.body.uid,
      status,
      req.file,
      res,
      next
    );
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.failedDocs = async (req, res, next) => {
 console.log(req.body.uid);
  Document.updateOne(
    { user: req.body.uid, depId: req.department },
    {
      status: "fail",
    },
    function (err, raw) {
      if (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      }
      if (raw.nModified > 0) {
        res.status(200).json({
          message: "Verified successfully.",
        });
      } else {
        if (err) {
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        }
      }
    }
  );
};

// add department

exports.addDepartment = (req, res, next) => {
  const department = new Department({
    name: req.body.name,
  });
  department
    .save()
    .then((value) => {
      res.status(201).json(value);
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
