const {
  validationResult
} = require("express-validator");

const Verifier = require("../models/issuer");
const User = require("../models/user");
const Utils = require("../utils/utils");

exports.getPedingVerification = (req, res, next) => {
  const errors = validationResult(req);


  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }

  Utils.getDocuments(req.department)
    .then((value) => {

      res.status(200).json({
        message: "Fetched Docs successfully.",
        posts: value,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};


exports.verifyDocs = (req, res, next) => {
  const errors = validationResult(req);


  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }

  const userId = req.body.uid;
  const status = req.body.status;


  Utils.startVerification(req.department, userId, status, res, next)

}