const {
  validationResult
} = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

exports.signup = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  const phone = req.body.phone;


  bcrypt
    .hash(password, 12)
    .then((hashedPw) => {
      const user = new User({
        email: email,
        password: hashedPw,
        name: name,
        phone: phone
      });
      return user.save();
    })
    .then((result) => {
      const token = jwt.sign({
          email: result.email,
          userId: result._id.toString(),
        },
        "mecidgov142gfgg", {
          expiresIn: "5h"
        }
      );
      res.status(201).json({
        message: "User created!",
        userId: result._id,
        token: token
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};


exports.uploadOtherDetails = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  if (!req.files) {
    const error = new Error('No image provided.');
    error.statusCode = 422;
    throw error;
  }

  const dob = req.body.dob;
  const fathersName = req.body.fathersName;
  const mothersName = req.body.mothersName;
  const address = req.body.address;
  //console.log(req.files);
  const photo = req.files.photo[0].path;
  const signature = req.files.signature[0].path;
  const adhaar = req.files.adhaar[0].path + "," + req.files.adhaar[1].path;
  const pan = req.files.pan[0].path;

  //console.log(req.userId);
  User.updateOne({
    _id: req.userId
  }, {
    dob: dob,
    fathersName: fathersName,
    mothersName: mothersName,
    address: address,
    photo: photo,
    signature: signature,
    adhaar: adhaar,
    pan: pan
  }, function (err, raw) {
    if (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    } else {
      res.status(200).json({
        message: "Uploaded successfully.",
      });
    }
  });

}

exports.login = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  //console.log(email);
  User.findOne({
      email: email
    })
    .then((user) => {
      if (!user) {
        const error = new Error("A user with this email could not be found.");
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
      const token = jwt.sign({
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
        },
        "mecidgov142gfgg", {
          expiresIn: "5h"
        }
      );
      res.status(200).json({
        token: token,
        userId: loadedUser._id.toString()
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};