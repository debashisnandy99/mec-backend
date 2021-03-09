const { validationResult } = require("express-validator");
const User = require("../models/user");

exports.getPedingVerification = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }

  const currentPage = req.query.page || 1;
  const perPage = 8;
  let totalUsers;

  User.find({
    pvStatus: "verified",
    avStatus: "verified",
    bdStatus: "verified",
  })
    .countDocuments()
    .then((count) => {
      totalUsers = count;
      return User.find({
        pvStatus: "verified",
        avStatus: "verified",
        bdStatus: "verified",
      })
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((value) => {
      res.status(200).json({
        message: "Fetched Docs successfully.",
        users: value,
        totalUsers: totalUsers,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getUpComingVerification = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }

  const currentPage = req.query.page || 1;
  const perPage = 8;
  let totalUsers;

  User.find()
    .or([
      {
        pvStatus: { $ne: "verified" },
        avStatus: { $ne: "verified" },
        bdStatus: { $ne: "verified" },
      },
    ])
    .countDocuments()
    .then((count) => {
      totalUsers = count;
      return User.find()
        .or([
          {
            pvStatus: { $ne: "verified" },
            avStatus: { $ne: "verified" },
            bdStatus: { $ne: "verified" },
          },
        ])
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((value) => {
      res.status(200).json({
        message: "Fetched Docs successfully.",
        users: value,
        totalUsers: totalUsers,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getVerifiedUser = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }

  const currentPage = req.query.page || 1;
  const perPage = 8;
  let totalUsers;

  User.find({ transactionHash: { $ne: null } })
    .countDocuments()
    .then((count) => {
      totalUsers = count;
      return User.find({ transactionHash: { $ne: null } })
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((value) => {
      res.status(200).json({
        message: "Fetched Docs successfully.",
        users: value,
        totalUsers: totalUsers,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
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
  const user = await User.findOne({
    _id: uid,
  }).select({
    email: 1,
  });

  let web3 = new Web3(new Web3.providers.HttpProvider("http://ganache:8545"));

  const accountsEth = await web3.eth.getAccounts();

  // web3.eth.getTransaction('0x2740fc6670b4a3cc1ca29e1f03164233ca99e175615c5e20de064c1b669a3a7d')
  //   .then(result => {
  //     let valu = web3.eth.abi.decodeParameter('string', '0x' + result.input.slice(10));
  //     console.log(valu);
  //     res.status(200).json({
  //       message: valu,
  //     });
  //   });

  const ipfs = ipfsClient("http://ipfs:5001");
  const { globSource } = ipfsClient;

  ipfs
    .add(
      globSource("./images/" + user.email, {
        recursive: true,
      })
    )
    .then((file) => {
      console.log(file.cid.toString());
      rimraf("./images/" + user.email, function () {
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
                _id: req.userId,
              },
              {
                transactionHash: file.cid.toString(),
              },
              function (err, raw) {
                if (err) {
                  if (!err.statusCode) {
                    err.statusCode = 500;
                  }
                  next(err);
                } else {
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
