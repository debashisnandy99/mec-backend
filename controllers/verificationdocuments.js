const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Verifier = require("../models/issuer");
const User = require("../models/user");
const Department = require("../models/department");
const Utils = require("../utils/utils");

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

  if (docsHeader == "pending") {
    Utils.getPendingDocuments(req.department, currentPage, perPage)
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
  } else if (docsHeader == "verified") {
    Utils.getVerifiedDocuments(req.department, currentPage, perPage)
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
  } else if (docsHeader == "fail") {
    Utils.getVerifiedDocuments(req.department, currentPage, perPage)
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
  }
};

exports.verifyDocs = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }

  const status = req.body.status;
  

  Utils.startVerification(req.department, status, req.file, res, next);
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
