const express = require("express");
const { body } = require("express-validator");

const User = require("../models/admin");
const adminAuthController = require("../controllers/admin");

const adminVerificationDocumentsController = require("../controllers/admindocumentverification");
const isAuth = require('../middleware/is-auth');
const birthCertController = require("../controllers/birthcertificateissue");

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
router.get("/user", isAuth,adminAuthController.getUser);
router.post("/depOfUser", isAuth,adminVerificationDocumentsController.getDocsOfUser);
router.post("/depFailMec", isAuth,adminVerificationDocumentsController.setFailedMec); 

router.get("/pendingVerification",isAuth,adminVerificationDocumentsController.getPendingUsers);
router.post("/getValidateDetails",isAuth,adminVerificationDocumentsController.getValidateDetails);
router.post("/verifyandstore",isAuth,adminVerificationDocumentsController.verifyAndStore);
router.post("/verifyoung",birthCertController.verifyInAdminLevelAndStore);
module.exports = router;