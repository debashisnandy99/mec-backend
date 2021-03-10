const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/issuer");
const Department = require("../models/department");

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const username = req.body.username;
  const name = req.body.name;
  const password = req.body.password;
  // const department = req.body.department;
  let department;
  Department.findOne({ name: req.body.department })
    .then((value) => {
      if (!value) {
        const error = new Error(
          "A department with this name could not be found."
        );
        error.statusCode = 401;
        throw error;
      }
      department = value;
      return bcrypt.hash(password, 12);
    })
    .then((hashedPw) => {
      const user = new User({
        username: username,
        password: hashedPw,
        name: name,
        department: department,
      });
      return user.save();
    })
    .then((result) => {
      res.status(201).json({ message: "User created!", userId: result._id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  let loadedUser;
  //console.log(username);
  User.findOne({ username: username })
    .populate('department')
    .then((user) => {
      if (!user) {
        const error = new Error(
          "A user with this username could not be found."
        );
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
      const token = jwt.sign(
        {
          username: loadedUser.username,
          userId: loadedUser._id.toString(),
          department: loadedUser.department.name,
        },
        "mecidgov142gfgg",
        { expiresIn: "5h" }
      );
      res.status(200).json({ token: token, userId: loadedUser._id.toString() });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
