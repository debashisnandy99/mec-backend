const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');


const app = express();


mongoose
  .connect(
    `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster1.hbyfu.mongodb.net/mec-gov?retryWrites=true&w=majority`
  )
  .then(result => {
    app.listen(8080);
  })
  .catch(err => console.log(err));