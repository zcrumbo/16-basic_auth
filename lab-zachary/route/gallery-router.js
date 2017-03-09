'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('cfgram:gallery-router');

const bearerAuth = require('../lib/bearer-auth-middleware.js');
const Gallery = require('../model/gallery.js');

const galleryRouter = module.exports = Router();


galleryRouter.post('/api/gallery', bearerAuth, jsonParser, (req, res, next) => {
  debug('POST: /api/gallery');
  //check auth token(in middleware), get user on req body, create new gallery associated with user's id
  //req has body and user properties we need to get
  if(!req.body.name) return next(createError(400, 'name required'));
  if(!req.body.desc) return next(createError(400, 'description required'));
  req.body.userID = req.user._id;
  new Gallery(req.body).save()
  .then( gallery => {
    if (!gallery) return next(createError(400, 'gallery not created'));
    res.json(gallery);
  })
  .catch(next);
});

galleryRouter.get('/api/gallery/:id', bearerAuth, (req, res, next) => {
  debug('GET: /api/gallery/:id');

  Gallery.findById(req.params.id, function(err) {
    if(err) {
      if(err.name === 'CastError')  next(createError(404, 'gallery not found'));
    }

  })
  .then(gallery => {
    if (!gallery) return next(createError(404, 'gallery not found'));
    res.json(gallery);
  })
  .catch(next);
});

galleryRouter.put('/api/gallery/:id', bearerAuth, jsonParser, (req, res, next) => {
  debug('POST: /api/gallery/:id');

  if(!req.body.name) return next(createError(400, 'name required'));
  if(!req.body.desc) return next(createError(400, 'description required'));

  Gallery.findByIdAndUpdate(req.params.id, req.body, {new:true})
  .then( gallery => {
    if(!gallery) return next(createError(404, 'gallery not found'));
    res.json(gallery);
  })
  .catch(next);
});

galleryRouter.delete('/api/gallery/:id', bearerAuth, (req, res, next) => {
  debug('DELETE: /api/gallery:id');

  Gallery.findByIdAndRemove(req.params.id)
  .then(gallery => {
    if(!gallery) return next(createError(404, 'gallery not found'));
    res.sendStatus(204);
  })
  .catch(next);
});