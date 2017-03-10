'use strict';

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const debug = require('debug')('cf-gram:server');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const authRouter = require('./route/auth-router.js');
const galleryRouter = require('./route/gallery-router.js');
const picRouter = require('./route/pic-router.js');
const errors = require('./lib/error-middleware.js');

const PORT = process.env.PORT || 3000;
const app = express();

dotenv.load();

mongoose.connect(process.env.MONGODB_URI);

app.use(cors());
app.use(morgan('dev'));
app.use(authRouter);
app.use(galleryRouter);
app.use(picRouter);
app.use(errors);



const server = module.exports = app.listen(PORT, () => debug('server up:', PORT));

server.isRunning = true;