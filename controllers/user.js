const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    const dob = req.body.dob;
    const fathersName = req.body.fathersName;
    const mothersName = req.body.mothersName;
    const address = req.body.address;
    const walletAddress = req.body.walletAddress;
    const mecId = req.body.mecId;
    const phone = req.body.phone;
    //console.log(req.files);
    const photo = req.files.photo[0].path;
    const signature = req.files.signature[0].path;
    const adhaar = req.files.adhaar[0].path+","+req.files.adhaar[1].path;
    const pan = req.files.pan[0].path;

    bcrypt
        .hash(password, 12)
        .then(hashedPw => {
            const user = new User({
                email: email,
                password: hashedPw,
                name: name,
                dob: dob,
                fathersName: fathersName,
                mothersName: mothersName,
                address: address,
                walletAddress: walletAddress,
                mecId: mecId,
                phone: phone,
                photo: photo,
                signature: signature,
                adhaar: adhaar,
                pan: pan
            });
            return user.save();
        })
        .then(result => {
            res.status(201).json({ message: 'User created!', userId: result._id });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
}