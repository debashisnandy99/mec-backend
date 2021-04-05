const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Web3 = require("web3");
const http = require("http");
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

  User.updateOne(
    {
      _id: req.userId,
    },
    {
      dob: dob,
      email: email,
      phone: phone,
      name: name,
      gender: gender,
    },
    function (err, raw) {
      if (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      } else if (raw.n == 0) {
        const error = new Error("No user found");
        error.statusCode = 422;
        throw error;
      } else {
        res.status(200).json({
          status: 1,
          message: "Uploaded successfully.",
        });
      }
    }
  );
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
    user = {
      address: address,
      state: state,
      district: district,
      isAddressSame: false,
      paddress: req.body.paddress,
      pstate: req.body.pstate,
      paddress: req.body.paddress,
    };
  } else if (isAddressSame === "true") {
    user = {
      address: address,
      state: state,
      district: district,
      isAddressSame: true,
    };
  } else {
    const error = new Error("Invalid 'isAddressSame'");
    error.statusCode = 422;
    throw error;
  }

  User.updateOne(
    {
      _id: req.userId,
    },
    user,
    function (err, raw) {
      if (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      } else if (raw.n == 0) {
        const error = new Error("No user found");
        error.statusCode = 422;
        throw error;
      } else {
        res.status(200).json({
          status: 1,
          message: "Uploaded successfully.",
        });
      }
    }
  );
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
  let fstatus;
  let mstatus;
  const fmecID = req.body.fmecID;
  const mmecID = req.body.mmecID;
  if (req.body.fstatus == "true") {
    fstatus = true;
  } else if (req.body.fstatus == "false") {
    fstatus = false;
  } else {
    const error = new Error("Invalid 'fstatus'");
    error.statusCode = 422;
    throw error;
  }

  if (req.body.mstatus == "true") {
    mstatus = true;
  } else if (req.body.mstatus == "false") {
    mstatus = false;
  } else {
    const error = new Error("Invalid 'fstatus'");
    error.statusCode = 422;
    throw error;
  }
  User.updateOne(
    {
      _id: req.userId,
    },
    {
      mothersName: mname,
      fathersName: fname,
      fathersMecId: fmecID,
      mothersMecId: mmecID,
      fathersStatus: fstatus,
      mothersStatus: mstatus,
    },
    function (err, raw) {
      if (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      } else if (raw.n == 0) {
        const error = new Error("No user found");
        error.statusCode = 422;
        throw error;
      } else {
        res.status(200).json({
          status: 1,
          message: "Uploaded successfully.",
        });
      }
    }
  );
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
