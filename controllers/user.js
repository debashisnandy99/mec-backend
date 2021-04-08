const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Web3 = require("web3");
const http = require("http");
const uploadFile = require("../middleware/upload");
const uploadDocsFile = require("../middleware/uploaddocs");
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

  const gender = req.body.gender;
  const name = req.body.name;
  const password = req.body.password;
  const phone = req.body.phone;

  bcrypt
    .hash(password, 12)
    .then((hashedPw) => {
      const user = new User({
        phone: phone,
        password: hashedPw,
        name: name,
        gender: gender,
      });
      return user.save();
    })
    .then((result) => {
      const token = jwt.sign(
        {
          phone: result.phone,
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

exports.formNoOne = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const gender = req.body.gender;
  const name = req.body.name;
  const phone = req.body.phone;
  const dob = req.body.dob;
  const email = req.body.email;

  User.findOne({
    _id: req.userId,
  })
    .then((user) => {
      if (!user) {
        const error = new Error("No user found");
        error.statusCode = 422;
        throw error;
      }
      user.dob = dob;
      user.email = email;
      user.phone = phone;
      user.name = name;
      user.gender = gender;

      return user.save();
    })
    .then((result) => {
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

exports.formNoTwo = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const address = req.body.address;
  const state = req.body.state;
  const district = req.body.district;
  let isAddressSame = req.body.isAddressSame;
  let user;

  User.findOne({
    _id: req.userId,
  })
    .then((user) => {
      if (!user) {
        const error = new Error("No user found");
        error.statusCode = 422;
        throw error;
      }
      if (isAddressSame === "false") {
        if (!req.body.paddress) {
          const error = new Error("Present address not found");
          error.statusCode = 422;
          throw error;
        }
        if (!req.body.pstate) {
          const error = new Error("Present state not found");
          error.statusCode = 422;
          throw error;
        }
        if (!req.body.pdistrict) {
          const error = new Error("Present district not found");
          error.statusCode = 422;
          throw error;
        }

        user.isAddressSame = false;
        user.paddress = req.body.paddress;
        user.pstate = req.body.pstate;
        user.paddress = req.body.paddress;
      } else if (isAddressSame === "true") {
        user.isAddressSame = true;
      } else {
        const error = new Error("Invalid 'isAddressSame'");
        error.statusCode = 422;
        throw error;
      }
      user.address = address;
      user.state = state;
      user.district = district;

      return user.save();
    })
    .then((result) => {
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

exports.formNoThree = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const mname = req.body.mname;
  const fname = req.body.fname;
  const fstatus = req.body.fstatus;
  const mstatus = req.body.mstatus;
  const fmecID = req.body.fmecID;
  const mmecID = req.body.mmecID;

  User.findOne({
    _id: req.userId,
  })
    .then((user) => {
      if (!user) {
        const error = new Error("No user found");
        error.statusCode = 422;
        throw error;
      }
      user.mothersName = mname;
      user.fathersName = fname;
      user.fathersMecId = fmecID;
      user.mothersMecId = mmecID;
      user.fathersStatus = fstatus;
      user.mothersStatus = mstatus;

      return user.save();
    })
    .then((result) => {
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

exports.formNoFour = async (req, res, next) => {
  try {
    await uploadFile(req, res);
    if (req.files == undefined) {
      const error = new Error("Please Upload Files");
      error.statusCode = 422;
      throw error;
    }
    if (req.files.length == 1) {
      const error = new Error("Please Upload Files");
      error.statusCode = 422;
      throw error;
    }
    User.findOne({
      _id: req.userId,
    })
      .then((user) => {
        if (!user) {
          const error = new Error("No user found");
          error.statusCode = 422;
          throw error;
        }
        user.photo = req.files.photo[0].path;
        user.signature = req.files.signature[0].path;
        user.isVerified = true;
        return user.save();
      })
      .then((result) => {
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
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.uploadOtherDetails = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  try {
    await uploadDocsFile(req, res);
    if (!req.file) {
      const error = new Error("No image provided.");
      error.statusCode = 422;
      throw error;
    }
    const docid = req.body.docid;
    const file = req.file.path;
    const value = await Department.findOne({ name: req.body.dep });
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
    await document.save();
    res.status(200).json({
      status: 1,
      message: "Uploaded successfully.",
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getDocs = (req, res, next) => {
  
  Document.find({ user: req.userId })
  .populate("depId",{
    _id:0,
    name:1
  })
    .then((val) => {
      res.status(200).json({
        status: 1,
        docs: val,
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
        user: loadedUser,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getUser = (req, res, next) => {
  User.findOne({
    _id: req.userId,
  })
    .then((user) => {
      res.status(200).json({
        user,
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
