const rimraf = require("rimraf");
const ipfsClient = require('ipfs-http-client');
const ganache = require("ganache-cli");
const Web3 = require('web3');

const User = require("../models/user");



exports.getDocuments = async (department) => {
  if (department == "adhaar") {
    return await User.find({
      avStatus: 'pending',
    }).select({
      adhaar: 1,
      name: 1,
      dob: 1,
      fathersName: 1,
      mothersName: 1,
      address: 1,
      phone: 1,
      photo: 1
    });
  } else if (department == "pan") {
    return await User.find({
      pvStatus: 'pending',
    }).select({
      adhaar: 1,
      name: 1,
      dob: 1,
      fathersName: 1,
      mothersName: 1,
      address: 1,
      phone: 1,
      photo: 1
    });
  }

  return await User.find({
    pvStatus: 'verified',
    avStatus: 'verified',
  });
};

exports.startVerification = (department, userId, status, res, next) => {

  if (department == "adhaar") {
    User.updateOne({
      _id: userId
    }, {
      avStatus: status ? 'verified' : 'fail'
    }, function (err, raw) {
      if (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      } else {
        res.status(200).json({
          message: "Verified successfully.",
        });
      }
    });
  } else if (department == "pan") {
    User.updateOne({
      _id: userId
    }, {
      pvStatus: status ? 'verified' : 'fail'
    }, function (err, raw) {
      if (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      } else {
        res.status(200).json({
          message: "Verified successfully.",
        });
      }
    });


  } else {

    addToIpfs(userId, res, next);


  }


}

const addToIpfs = async (uid, res, next) => {

  const user = await User.findOne({
    _id: uid,
  }).select({
    email: 1
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



  const ipfs = ipfsClient('http://ipfs:5001');
  const {
    globSource
  } = ipfsClient;

  ipfs.add(globSource('./images/' + user.email, {
    recursive: true
  })).then(file => {
    console.log(file.cid.toString());
    rimraf('./images/' + user.email, function () {

      web3.eth.defaultAccount = accountsEth[0];
      var fileHash = new web3.eth.Contract(
        [{
            "constant": false,
            "inputs": [{
              "internalType": "string",
              "name": "_x",
              "type": "string"
            }],
            "name": "setFileHash",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "constant": true,
            "inputs": [],
            "name": "getFileHash",
            "outputs": [{
              "internalType": "string",
              "name": "",
              "type": "string"
            }],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
          }
        ], "0xF431A059a910E46699da3c95f0405B824030F06B"
      );


      fileHash.methods.setFileHash(file.cid.toString()).send({
          from: accountsEth[0]
        }).on('receipt', function (receipt) {
          
          User.updateOne({
            _id: req.userId
          }, {
            transactionHash: file.cid.toString(),
          }, function (err, raw) {
            if (err) {
              if (!err.statusCode) {
                err.statusCode = 500;
              }
              next(err);
            } else {
              res.status(200).json({
                message: "received"
              });
            }
          });
        })
        .on('error', function (err, receipt) { // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
          if (!err.statusCode) {
            err.statusCode = 500;
          }
          next(err);
        });

    });


  });
}