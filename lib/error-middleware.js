'use strict';

const createError = require('http-errors');
const debug = require('debug')('cfgram:error-middleware');

module.exports = function(err, req, res, next){
  debug('error-middleware');

  if(err.status) {
    debug('user error');

    console.error('message:', err.message);
    console.error('name:', err.name);

    res.status(err.status).send(err.message);
    next();
    return;
  }

  if (err.message === 'ValidationError'){
    debug('Mongoose Error');
    err = createError(400, err.message);
    res.status(err.status).send(err.message);
    next();
    return;
  }

  err = createError(500, 'Internal Server Error');
  res.status(err.status).send(err.message);
  next();
  return;
};
