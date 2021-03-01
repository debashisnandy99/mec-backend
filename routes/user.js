const express = require("express");
const { body } = require("express-validator");

const User = require("../models/user");
const authController = require("../controllers/user");

const router = express.Router();

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-Mail address already exists!");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
    body("dob").trim().not().isEmpty(),
    body("fathersName").trim().not().isEmpty(),
    body("mothersName").trim().not().isEmpty(),
    body("address").trim().not().isEmpty(),
    body("walletAddress").trim().not().isEmpty(),
    body("mecId").trim().not().isEmpty(),
    body("phone")
      .trim()
      .not()
      .isEmpty()
      .custom((value, { req }) => {
        return User.findOne({ phone: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Phone number already exists!");
          }
        });
      }),
  ],
  authController.signup
);

//router.post('/login', authController.login);

module.exports = router;
