'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const User = require('../model/user.js');
const createError = require('http-errors');
const debug = require('debug')('cf-gram:auth-router');

const basicAuth = require('../lib/basic-auth-middleware');

const authRouter = module.exports = Router();

authRouter.get('/', (req, res) => {
  res.write('you made a request');
  res.end();
});

authRouter.post('/api/signup', jsonParser, (req, res, next) => {
  debug('POST: /api/signup');

  if(!req.body.username) return next(createError(400, 'username required'));
  if(!req.body.email) return next(createError(400, 'email address required'));
  if(!req.body.password) return next(createError(400, 'password required'));

  let password = req.body.password;
  delete req.body.password;

  let user = new User(req.body);

  user.createPasswordHash(password)
  .then(user => user.save())
  .then(user => user.generateToken())
  .then(token => res.send(token))
  .catch(() =>  next(createError(500, 'user not saved')));

});

authRouter.get('/api/signin', basicAuth, (req, res, next) => {
  debug('GET: /api/signin');

  User.findOne({username: req.auth.username})
  .then( user => user ? user.comparePasswordHash(req.auth.password) : next(createError(401, 'user not found!')))
  .then( user => user.generateToken())
  .then( token => res.send(token))
  .catch(next);
});