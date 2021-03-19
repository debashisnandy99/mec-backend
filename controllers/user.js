const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Web3 = require("web3");
const http = require('http');
const User = require("../models/user");
const Department = require("../models/department");
const Document = require("../models/document");
const LoginLogs = require("../models/loginlogs");

exports.signup = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  if (!req.file) {
    const error = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }

  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  const phone = req.body.phone;

  const photo = req.file.path;

  bcrypt
    .hash(password, 12)
    .then((hashedPw) => {
      const user = new User({
        email: email,
        password: hashedPw,
        name: name,
        phone: phone,
        photo: photo,
      });
      return user.save();
    })
    .then((result) => {
      const token = jwt.sign(
        {
          email: result.phone,
          userId: result._id.toString(),
        },
        "mecidgov142gfgg",
        {
          expiresIn: "24h",
        }
      );
      res.status(201).json({
        message: "User created!",
        userId: result._id,
        token: token,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.uploadDetails = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  if (!req.file) {
    const error = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }
  let user, userM;
  const dob = req.body.dob;
  const fathersName = req.body.fathersName;
  const mothersName = req.body.mothersName;
  const mothersMecId = req.body.mothersmecid;
  const fathersMecId = req.body.fathersmecid;
  const address = req.body.address;
  const signature = req.file.path;

  User.updateOne(
    {
      _id: req.userId,
    },
    {
      dob: dob,
      fathersName: fathersName,
      mothersName: mothersName,
      address: address,
      mothersMecId: mothersMecId,
      fathersMecId: fathersMecId,
      signature: signature,
    },
    function (err, raw) {
      if (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      } else {
        res.status(200).json({
          status: 1,
          message: "Uploaded successfully.",
        });
      }
    }
  );
};

exports.uploadOtherDetails = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  if (!req.file) {
    const error = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }

  const docid = req.body.docid;
  const file = req.file.path;

  Department.findOne({ name: req.body.dep })
    .then((value) => {
      if (!value) {
        const error = new Error(
          "A department with this name could not be found."
        );
        error.statusCode = 401;
        throw error;
      }
      const document = new Document({
        depId: value,
        docId: docid,
        user: mongoose.Types.ObjectId(req.userId),
        file: file,
      });
      return document.save();
    })
    .then((value) => {
      res.status(200).json({
        status: 1,
        message: "Uploaded successfully.",
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.checkMecIdExists = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const mecId = req.body.mec;

  User.findOne({
    mecId: mecId,
  })
    .then((value) => {
      if (!value) {
        const error = new Error("Mec id not found");
        error.statusCode = 401;
        throw error;
      }
      console.log(mecId);

      res.status(200).json({
        status: 1,
        message: "Founded",
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getDetails = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const phone = req.body.phone;
  var user;

  User.findOne({
    phone: phone,
  })
    .then((value) => {
      if (!value) {
        const error = new Error("User with this phone not found");
        error.statusCode = 401;
        throw error;
      }
      if (value.mecId) {
        const error = new Error("User Already Verified");
        error.statusCode = 401;
        throw error;
      }
      user = value;
      return Document.find({
        user: user,
      }).populate("depId");
    })
    .then((value) => {
      if (value.length == 0) {
        const error = new Error("Already Verified. Please login.");
        error.statusCode = 401;
        throw error;
      }
      res.status(200).json({
        user: user,
        docs: value,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const phone = req.body.phone;
  const password = req.body.password;
  let loadedUser;
  var ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  var os = req.body.os;
  var tok;

  const loginLog = new LoginLogs({
    ip: ip,
    os: os,
  });

  //console.log(email);
  User.findOne({
    phone: phone,
  })
    .then((user) => {
      if (!user) {
        const error = new Error("A user with this phone could not be found.");
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      if (!user.mecId) {
        const error = new Error("Account not verified");
        error.statusCode = 401;
        throw error;
      }
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Wrong password!");
        error.statusCode = 401;
        throw error;
      }

      return loginLog.save();
    })
    .then((result) => {
      loadedUser.loginLogs.push(loginLog);
      return loadedUser.save();
    })
    .then((result) => {
      const token = jwt.sign(
        {
          phone: loadedUser.phone,
          userId: loadedUser._id.toString(),
        },
        "mecidgov142gfgg",
        {
          expiresIn: "5h",
        }
      );
      res.status(200).json({
        token: token,
        userId: loadedUser._id.toString(),
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getValidateDetails = (req, res, next) => {
  let web3 = new Web3(new Web3.providers.HttpProvider("http://ganache:8545"));

  let user;
  User.findOne({
    _id: req.userId,
  })
    .then((res) => {
      user = res;
      return web3.eth.getTransaction(
        res.transactionHash[res.transactionHash.length - 1].toString()
      );
    })
    .then((result) => {
      let valu = web3.eth.abi.decodeParameter(
        "string",
        "0x" + result.input.slice(10)
      );
      res.status(200).json({
        ipfsHash: valu,
        user: user,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
