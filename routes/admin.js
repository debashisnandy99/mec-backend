const express = require("express");
const { body } = require("express-validator");

const User = require("../models/verifier");
const verificationdocumentsController = require("../controllers/verificationdocuments");
const isAuthVerifier = require('../middleware/is-auth-verifier');

const router = express.Router();


router.get("/verify",isAuthVerifier,verificationdocumentsController.getPedingVerification);

module.exports = router;