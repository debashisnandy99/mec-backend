const { validationResult } = require("express-validator");

const Verifier = require("../models/verifier");
const User = require("../models/user");
const Utils = require("../utils/utils");

exports.getPedingVerification = (req, res, next) => {
  const errors = validationResult(req);
  let documents;

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }

  Utils.getDocuments(req.department)
    .then((value) => {
      console.log(value);
      res.status(200).json({
        message: "Fetched posts successfully.",
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
