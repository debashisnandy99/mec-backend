const { validationResult } = require("express-validator");
var fs = require("fs");
const ipfsClient = require("ipfs-http-client");
const path = require("path");
const Web3 = require("web3");
const rimraf = require("rimraf");

const YoungUser = require("../models/young");
const Department = require("../models/department");
const User = require("../models/user");

exports.generateBirthCertificate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }

  if (!req.file) {
    const error = new Error("No image provided.");
    error.statusCode = 422;
    throw error;
  }

  if (req.department!="birth" || req.department!="admin") {
    const error = new Error("Not valid author");
    error.statusCode = 422;
    throw error;
  }

  const motherMec = req.body.mother;
  const fatherMec = req.body.father;
  const name = req.body.name;
  const dob = req.body.dob;
  const birthCert = req.file.path;
  const docid = req.body.docid;

  const father = await User.findOne({
    _id: fatherMec,
  });

  if (!father) {
    if (!req.file) {
      const error = new Error("Father MEC ID Not Found");
      error.statusCode = 422;
      throw error;
    }
  }

  const mother = await User.findOne({
    _id: motherMec,
  });
  if (!mother) {
    if (!req.file) {
      const error = new Error("Mother MEC ID Not Found");
      error.statusCode = 422;
      throw error;
    }
  }


  const user = new YoungUser({
    dob: dob,
    name: name,
    father: father,
    mother: mother,
    file: birthCert,
    docId: docid,
  });

  user.save().then((value) => {
    res.status(200).json({
      status: 1,
      message: "Submitted successfully.",
    });
  })
  .catch((err) => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  });
};

exports.getListOfYouth = (req, res, next) => {
  YoungUser.find({
    mecId: {$exixts: true}
  }).then(value=> {
    
  });
}

exports.verifyInAdminLevelAndStore = (req, res, next) => {
   const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }

  const userId = req.body.uid;
  addToIpfs(userId, res, next);
}

const addToIpfs = (uid, res, next) => {
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

  YoungUser.findOne({
    _id: uid
  }).then((userValue) => {
    mecId = Date.now()
        .toString()
        .splice(
          Math.floor(Math.random() * 10) + 1,
          0,
          userValue.name.slice(0, 3)
        );
      dir = makeDir(mecId);

      renameFile(
        userValue.birthCert,
        dir + "/birth" + path.parse(userValue.birthCert).ext,
        next
      );
      return ipfs.add(
        globSource("./" + dir, {
          recursive: true,
        })
      );
  }).then((file) => {
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
        "0xF431A059a910E46699da3c95f0405B824030F06B"
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
}

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
