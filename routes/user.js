const express = require("express");
const { body } = require("express-validator");

const User = require("../models/user");
const authController = require("../controllers/user");

const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.put(
  "/signup",

  body("password").trim().isLength({
    min: 5,
  }),
  body("name").trim().not().isEmpty(),
  body("gender").trim().not().isEmpty(),
  body("phone")
    .trim()
    .not()
    .isEmpty()
    .custom((value, { req }) => {
      return User.findOne({
        phone: value,
      }).then((userDoc) => {
        if (userDoc) {
          return Promise.reject("Phone number already exists!");
        }
      });
    }),

  authController.signup
);

router.put(
  "/firstForm",

  body("name").trim().not().isEmpty(),
  body("dob").trim().not().isEmpty(),
  body("gender").trim().not().isEmpty(),
  body("phone").trim().not().isEmpty(),
  isAuth,
  authController.formNoOne
);

router.put(
  "/secondForm",

  body("address").trim().not().isEmpty(),
  body("state").trim().not().isEmpty(),
  body("district").trim().not().isEmpty(),
  body("isAddressSame").trim().not().isEmpty(),
  isAuth,
  authController.formNoTwo
);

router.put(
  "/thirdForm",
  body("fname").trim().not().isEmpty(),
  body("mname").trim().not().isEmpty(),
  body("mstatus").trim().not().isEmpty(),
  body("fstatus").trim().not().isEmpty(),
  isAuth,
  authController.formNoThree
);

router.put(
  "/detailsUp",
  [
    body("dob").trim().not().isEmpty(),
    body("fathersName").trim().not().isEmpty(),
    body("mothersName").trim().not().isEmpty(),
    body("address").trim().not().isEmpty(),
  ],
  isAuth,
  authController.uploadDetails
);

router.put(
  "/fileUpload",
  [body("docid").trim().not().isEmpty()],
  isAuth,
  authController.uploadOtherDetails
);

router.get("/getValidateDetails", isAuth, authController.getValidateDetails);

router.post(
  "/login",
  body("phone").trim().not().isEmpty(),
  body("password").trim().isLength({
    min: 5,
  }),
  authController.login
);

router.post(
  "/checkmec",
  [body("mec").trim().not().isEmpty()],
  authController.checkMecIdExists
);

router.post(
  "/getdetails",
  [body("phone").trim().not().isEmpty()],
  authController.getDetails
);

module.exports = router;
