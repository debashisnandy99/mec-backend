const express = require("express");
const { body } = require("express-validator");

const User = require("../models/admin");
const adminAuthController = require("../controllers/admin");

const adminVerificationDocumentsController = require("../controllers/admindocumentverification");
const isAuth = require('../middleware/is-auth');

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
    
  ],
  adminAuthController.signup
);

router.post('/login', adminAuthController.login);


router.get("/pendingVerification",isAuth,adminVerificationDocumentsController.getPedingVerification);
router.get("/upcomingVerification",isAuth,adminVerificationDocumentsController.getUpComingVerification);
router.get("/verified-user",isAuth,adminVerificationDocumentsController.getVerifiedUser);
router.post("/verifyandstore",isAuth,adminVerificationDocumentsController.verifyAndStore);

module.exports = router;