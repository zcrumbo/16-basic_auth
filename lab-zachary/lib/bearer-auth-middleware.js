'use strict';

const createError = require('http-errors');
const jwt = require('jsonwebtoken');
const debug = require('debug')('cfgram:bearer-auth-middleware');
const User = require('../model/user.js');

//get req, res, next from other middleware and decipher the auth token in the auth header, then attach it to the request body

module.exports = function( req, res, next) {
  debug('bearer auth');

  var authHeader = req.headers.authorization;
  if (!authHeader) return next(createError(401, 'Authorization headers required'));

  var token = authHeader.split('Bearer ')[1];
  if (!token) return next(createError(401, 'token required'));

  //validate token and use jwt verify user

  jwt.verify(token, process.env.APP_SECRET, function(err, decoded) {
    if (err) return next(createError(401, 'token validation error'));
    if (!decoded) return next(createError(401, 'invalid token'));
    User.findOne({findHash: decoded.token})
    .then( user => {
      req.user = user;
      next();
    })
      .catch( err => next(createError(401, err.message)));
  });
};

