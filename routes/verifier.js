const express = require("express");
const { body } = require("express-validator");

const User = require("../models/issuer");
const authController = require("../controllers/issuer");
const birthCertController = require("../controllers/birthcertificateissue");

const verificationdocumentsController = require("../controllers/verificationdocuments");
const isAuthVerifier = require("../middleware/is-auth-verifier");

const router = express.Router();

router.put(
  "/signup",
  [
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
    body("username")
      .trim()
      .not()
      .isEmpty()
      .custom((value, { req }) => {
        return User.findOne({ username: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Username already exists!");
          }
        });
      }),
    body("department").trim().not().isEmpty(),
  ],
  authController.signup
);

router.post("/login", authController.login);

router.get(
  "/getlist",
  isAuthVerifier,
  verificationdocumentsController.getVerification
);
router.post(
  "/verifydocs",
  [body("uid").trim().not().isEmpty()],
  isAuthVerifier,
  verificationdocumentsController.verifyDocs
);
router.put(
  "/birthcert",
  [
    body("father").trim().not().isEmpty(),
    body("mother").trim().not().isEmpty(),
    body("dob").trim().not().isEmpty(),
    body("name").trim().not().isEmpty(),
    body("docid").trim().not().isEmpty(),
  ],
  isAuthVerifier,
  birthCertController.generateBirthCertificate
);
router.post("/depreg", verificationdocumentsController.addDepartment);
module.exports = router;
