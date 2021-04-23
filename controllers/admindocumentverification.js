const { validationResult } = require("express-validator");
const User = require("../models/user");
var fs = require("fs");
const ipfsClient = require("ipfs-http-client");
const path = require("path");
const Web3 = require("web3");
const rimraf = require("rimraf");
const Document = require("../models/document");
const Department = require("../models/department");

exports.getPedingVerification = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }

  const docsHeader = req.get("Docs");
  if (!docsHeader) {
    const error = new Error("Type of docs not specified");
    error.statusCode = 401;
    throw error;
  }
  const currentPage = req.query.page || 1;
  const perPage = 8;
  let arr = await Document.aggregate([
    {
      $match: {
        status: docsHeader,
      },
    },
    {
      $group: {
        _id: "$user",
        docs: {
          $push: "$$ROOT",
        },
      },
    },
  ]);

  let totalItem = arr.length;

  Document.aggregate([
    {
      $match: {
        status: docsHeader,
      },
    },
    {
      $group: {
        _id: "$user",
        docs: {
          $push: "$$ROOT",
        },
      },
    },
  ])
    .skip((currentPage - 1) * perPage)
    .limit(perPage)
    .then((result) => {
      return User.populate(result, {
        path: "docs.user",
      });
    })
    .then((result) => {
      return Department.populate(result, {
        path: "docs.depId",
      });
    })
    .then((value) => {
      res.status(200).json({
        message: "Fetched Docs successfully.",
        users: value,
        totalItem: totalItem,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getPendingUsers = async (req, res, next) => {
  const docsHeader = req.get("Docs");
  if (!docsHeader) {
    const error = new Error("Type of docs not specified");
    error.statusCode = 401;
    throw error;
  }

  const currentPage = req.query.page || 1;
  const perPage = 8;
  if (docsHeader == "pending") {
    let totalItem = await User.find({
      mecId: { $exists: false },
      isMecVerify: { $ne: "fail" },
    }).countDocuments();
    User.find({ mecId: { $exists: false }, isMecVerify: { $ne: "fail" } })
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .then((value) => {
        res.status(200).json({
          message: "Fetched Docs successfully.",
          users: value,
          totalItem: totalItem,
        });
      })
      .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  } else if (docsHeader == "verified") {
    let totalItem = await User.find({
      mecId: { $exists: true },
      isMecVerify: { $ne: "fail" },
    }).countDocuments();
    User.find({ mecId: { $exists: true }, isMecVerify: { $ne: "fail" } })
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .then((value) => {
        res.status(200).json({
          message: "Fetched Docs successfully.",
          users: value,
          totalItem: totalItem,
        });
      })
      .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  } else if (docsHeader == "failed") {
    let totalItem = await User.find({
      isMecVerify: "fail",
    }).countDocuments();
    User.find({ isMecVerify: "fail" })
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .then((value) => {
        res.status(200).json({
          message: "Fetched Docs successfully.",
          users: value,
          totalItem: totalItem,
        });
      })
      .catch((err) => {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      });
  }
};

exports.getValidateDetails = (req, res, next) => {
  let web3 = new Web3(new Web3.providers.HttpProvider("http://ganache:8545"));

  User.findOne({
    _id: req.body.uid,
  })
    .then((result) => {
      console.log(result.transactionHash);
      return web3.eth.getTransaction(
        result.transactionHash[result.transactionHash.length - 1].toString()
      );
    })
    .then((result) => {
      console.log(result);
      let valu = web3.eth.abi.decodeParameter(
        "string",
        "0x" + result.input.slice(10)
      );
      res.status(200).json({
        ipfsHash: valu,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.setFailedMec = (req, res, next) => {
  User.updateOne(
    { _id: req.body.uid },
    {
      isMecVerify: "fail",
    },
    function (err, raw) {
      if (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      } else if (raw.nModified > 0) {
        res.status(200).json({
          message: "success",
        });
      } else {
        res.status(401).json({
          message: "failed",
        });
      }
    }
  );
};

exports.getDocsOfUser = (req, res, next) => {
  console.log(req.body.uid);
  Document.find({ user: req.body.uid })
    .populate("depId")
    .then((value) => {
      res.status(200).json({
        message: "Fetched Docs successfully.",
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

exports.getPendingMecCard = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 8;
  let totalItem = await User.find({
    isMecVerify: "verified",
    mecCard: { $exists: false },
  }).countDocuments();
  User.find({
    isMecVerify: "verified",
    mecCard: { $exists: false },
  })
    .skip((currentPage - 1) * perPage)
    .limit(perPage)
    .then((user) => {
      res.status(200).json({
        message: "Fetched Docs successfully.",
        users: user,
        totalItem: totalItem,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getIssuedMecCard = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 8;
  let totalItem = await User.find({
    isMecVerify: "verified",
    mecCard: { $exists: false },
  }).countDocuments();
  User.find({
    isMecVerify: "verified",
    mecCard: { $exists: true },
  })
    .skip((currentPage - 1) * perPage)
    .limit(perPage)
    .then((user) => {
      res.status(200).json({
        message: "Fetched Docs successfully.",
        users: user,
        totalItem: totalItem,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.issueMecCard = (req, res, next) => {
  console.log(req.body.uid + "dss" + req.body.mec);
  User.updateOne(
    { _id: req.body.uid },
    {
      mecCard: req.body.mec,
    },
    function (err, raw) {
      if (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      } else if (raw.nModified > 0) {
        res.status(200).json({
          message: "success",
        });
      } else {
        res.status(401).json({
          message: "failed",
        });
      }
    }
  );
};

exports.verifyAndStore = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }

  const userId = req.body.uid;
  addToIpfs(userId, res, next);
};

const addToIpfs = async (uid, res, next) => {
  // const user = await User.findOne({
  //   _id: uid,
  // }).select({
  //   email: 1,
  // });
  String.prototype.splice = function (idx, rem, str) {
    return this.slice(0, idx) + str + this.slice(idx + Math.abs(rem));
  };

  let web3 = new Web3(new Web3.providers.HttpProvider("http://ganache:8545"));
  const ipfs = ipfsClient("http://ipfs:5001");
  let mecId;
  const { globSource } = ipfsClient;
  let docs;
  const accountsEth = await web3.eth.getAccounts();
  let dir;

  User.findOne({
    _id: uid,
  })
    .then((userValue) => {
      mecId = Date.now()
        .toString()
        .splice(
          Math.floor(Math.random() * 10) + 1,
          0,
          userValue.name.slice(0, 3)
        );
      dir = makeDir(mecId);
      renameFile(
        userValue.photo,
        dir + "/profile" + path.parse(userValue.photo).ext,
        next
      );
      renameFile(
        userValue.signature,
        dir + "/signature" + path.parse(userValue.signature).ext,
        next
      );
      return Document.find({
        user: uid,
      }).populate("depId", {
        name: 1,
      });
    })
    .then((value) => {
      value.forEach((doc) => {
        renameFile(
          doc.file,
          dir + "/" + doc.depId.name + path.parse(doc.file).ext,
          next
        );
      });
      return ipfs.add(
        globSource("./" + dir, {
          recursive: true,
        })
      );
    })
    .then((file) => {
      console.log(file.cid.toString());
      rimraf("./" + dir, function () {
        web3.eth.defaultAccount = accountsEth[0];
        var fileHash = new web3.eth.Contract(
          [
            {
              constant: false,
              inputs: [
                {
                  internalType: "string",
                  name: "_x",
                  type: "string",
                },
              ],
              name: "setFileHash",
              outputs: [],
              payable: false,
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              constant: true,
              inputs: [],
              name: "getFileHash",
              outputs: [
                {
                  internalType: "string",
                  name: "",
                  type: "string",
                },
              ],
              payable: false,
              stateMutability: "view",
              type: "function",
            },
          ],
          "0xA3Afe5f0A1280D1B621616855914e3689bbAf85f"
        );

        fileHash.methods
          .setFileHash(file.cid.toString())
          .send({
            from: accountsEth[0],
          })
          .on("receipt", function (receipt) {
            User.updateOne(
              {
                _id: uid,
              },
              {
                $push: {
                  transactionHash: receipt.transactionHash,
                },
                $set: {
                  mecId: mecId,
                  isMecVerify: "verified",
                },
              },
              function (err, raw) {
                if (err) {
                  if (!err.statusCode) {
                    err.statusCode = 500;
                  }
                  next(err);
                } else {
                  console.log(receipt);
                  res.status(200).json({
                    message: "received",
                  });
                }
              }
            );
          })
          .on("error", function (err, receipt) {
            // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
            if (!err.statusCode) {
              err.statusCode = 500;
            }
            next(err);
          });
      });
    });
};

const makeDir = (mecId) => {
  let dir = "images/" + mecId;
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir);
    } catch (err) {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    }
  }
  return dir;
};

const renameFile = (oldPath, newPath, next) => {
  try {
    fs.renameSync(oldPath, newPath);
  } catch (err) {
    if (!err) {
      err.statusCode = 500;
    }
    next(err);
  }
};
