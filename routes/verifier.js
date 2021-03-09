const express = require("express");
const { body } = require("express-validator");

const User = require("../models/verifier");
const authController = require("../controllers/verifier");

const verificationdocumentsController = require("../controllers/verificationdocuments");
const isAuthVerifier = require('../middleware/is-auth-verifier');

const router = express.Router();

router.put(
  "/signup",
  [
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
    body("username").trim().not().isEmpty().custom((value, { req }) => {
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

router.post('/login', authController.login);


router.get("/verify",isAuthVerifier,verificationdocumentsController.getPedingVerification);
router.post("/verifydocs",isAuthVerifier,verificationdocumentsController.verifyDocs);

module.exports = router;