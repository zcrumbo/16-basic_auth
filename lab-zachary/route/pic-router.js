'use strict';

const Router = require('express').Router;
const multer = require('multer');
const fs = require('fs');
const del = require('del');
const path = require('path');
const createError = require('http-errors');
const debug = require('debug')('cfgram:pic-router');

const bearerAuth = require('../lib/bearer-auth-middleware.js');
const Pic = require('../model/pic.js');
const Gallery = require('../model/gallery.js');
const s3Methods = require('../lib/s3-methods.js');

const dataDir = `${__dirname}/../data`;
const upload = multer({dest: dataDir });

const picRouter = module.exports = Router();

picRouter.post('/api/gallery/:galleryID/pic', bearerAuth, upload.single('image'),  (req, res, next) => { //req.file is object passed by multer
  debug('POST: /api/gallery/:galleryID/pic');
  if(!req.file) return next(createError(400, 'no file provided'));
  if(!req.file.path) return next(createError(500, 'file not saved'));

  let ext = path.extname(req.file.originalname);
  let params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path),
  };
//upload
  Gallery.findById(req.params.galleryID)
  .then( gallery => {
    if(!gallery) return next(createError(404, 'gallery not found'));
    this.tempGallery = gallery;
    s3Methods.uploadObjectProm(params)
    .then( s3Data => {
      del([`${dataDir}/*`]);
      new Pic({
        name: req.body.name,
        desc: req.body.desc,
        userID: this.tempGallery.userID,
        galleryID: req.params.galleryID,
        imageURI: s3Data.Location,
        objectKey: s3Data.Key
      })
      .save()
      .then( pic => {
        res.json(pic);
      })
      .catch(next);
    });
  });
});

picRouter.delete('/api/gallery/:galleryID/pic/:picID', bearerAuth, (req, res, next) => {
  debug('DELETE: /api/gallery/:galleryID/pic/:picID');

  Pic.findById(req.params.picID)
  .then( pic => {
    if (!pic) return next(createError(404, 'pic not found'));
    let params = {
      Bucket: process.env.AWS_BUCKET,
      Key: pic.objectKey
    };
    s3Methods.deleteObjectProm(params)
    .then( s3Data => {
      debug('delete data:',s3Data);
      Pic.findByIdAndRemove(req.params.picID)
      .then( () => {
        res.sendStatus(204);
      });
    });
  });
});


