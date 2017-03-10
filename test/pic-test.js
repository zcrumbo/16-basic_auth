'use strict';

const fs = require('fs');
const request = require('superagent');
const expect = require('chai').expect;
const Promise = require('bluebird');
const del = require('del');

const Pic = require('../model/pic.js');
const User = require('../model/user.js');
const Gallery = require('../model/gallery.js');

// const serverToggle = require('./lib/server-toggle.js');
// const server = require('../server.js');
require('../server.js');

const s3Methods = require('../lib/s3-methods.js');

const url = `http://localhost:${process.env.PORT}`;
const sampleUser = {
  username: 'sampleUser',
  email: 'sample@user.com',
  password: '1234'
};
const sampleGallery = {
  name: 'sample Gallery',
  desc: 'sample description'
};
const samplePic = {
  name: 'samplePic',
  desc: 'sample description',
  image: `${__dirname}/data/sample.jpg` //not in data model. added only for test
};

describe('Pic Routes', function() {
  // before( done => serverToggle.serverOn(server, done));
  // after(done => serverToggle.serverOff(server, done));
  afterEach( done => {
    Promise.all([
      User.remove({}),
      Gallery.remove({}),
      Pic.remove({}),
      del([`${__dirname}/../data/*`])
    ])
    .then( () => done())
    .catch(done);
  });
  describe('POST /api/gallery/:galleryID/pic', function () {
    before( done => { //new user
      new User(sampleUser)
      .createPasswordHash(sampleUser.password)
      .then( user => user.save())
      .then( user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then( token => {
        this.tempToken = token;
        done();
      })
      .catch(done);
    });
    before( done => { //new gallery
      sampleGallery.userID = this.tempUser._id;
      new Gallery(sampleGallery).save()
      .then( gallery => {
        this.tempGallery = gallery;
        done();
      })
      .catch(done);
    });
    after( done => {
      s3Methods.deleteObjectProm({Bucket: process.env.AWS_BUCKET, Key:this.tempPic.objectKey})
      .then(() => done())
      .catch(done);
    });
    describe('with an authorized user, valid galleryID, and valid data', () => {
      it('should return a pic object from s3', done => {
        request.post(`${url}/api/gallery/${this.tempGallery._id}/pic`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .field('name', samplePic.name)
        .field('desc', samplePic.desc)
        .attach('image', samplePic.image)
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(samplePic.name);
          expect(res.body.galleryID).to.equal(this.tempGallery._id.toString());
          this.tempPic = res.body;
          done();
        });
      });
    });
    describe('with authorized user, valid galleryID, and missing data', () => {
      it('should return with a 400 error', done => {
        request.post(`${url}/api/gallery/${this.tempGallery._id}/pic`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .field('name', samplePic.name)
        .field('desc', samplePic.desc)
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(err.message).to.equal('Bad Request');
          done();
        });
      });
    });
    describe('with an authorized user and invalid gallery id', () => {
      it('should return a 404', done => {
        request.post(`${url}/api/gallery/badGalleryID/pic`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .field('name', samplePic.name)
        .field('desc', samplePic.desc)
        .attach('image', samplePic.image)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(err.message).to.equal('Not Found');
          done();
        });
      });
    });

  });
  describe('DELETE /api/gallery/:galleryID/pic/:picID', function () {
    before( done => { //new user
      new User(sampleUser)
      .createPasswordHash(sampleUser.password)
      .then( user => user.save())
      .then( user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then( token => {
        this.tempToken = token;
        done();
      })
      .catch(done);
    });
    before( done => { //new gallery
      sampleGallery.userID = this.tempUser._id;
      new Gallery(sampleGallery).save()
      .then( gallery => {
        this.tempGallery = gallery;
        done();
      })
      .catch(done);
    });
    before( done => { //new pic

      let params = {
        ACL: 'public-read',
        Bucket: process.env.AWS_BUCKET,
        Key: `samplefilehash${Math.floor(Math.random()*100000)}.jpg`,
        Body: fs.createReadStream(`${__dirname}/data/sample.jpg`),
      };
      s3Methods.uploadObjectProm(params)
      .then( s3Data => {
        new Pic({
          name: samplePic.name,
          desc: samplePic.desc,
          userID: this.tempUser._id,
          galleryID: this.tempGallery._id,
          imageURI: s3Data.Location,
          objectKey: s3Data.Key
        })
        .save()
        .then( pic => {
          this.tempPic = pic;
          done();
        })
        .catch(done);
      });
    });
    describe('with a valid gallery and picture id', () => {
      it('should return a 204', done => {
        request.delete(`${url}/api/gallery/${this.tempGallery._id}/pic/${this.tempPic._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(204);
          done();
        });
      });
    });
    describe('with an invalid picture id', () => {
      it('should return a 404', done => {
        request.delete(`${url}/api/gallery/${this.tempGallery._id}/pic/${this.tempPic._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(err.message).to.equal('Not Found');
          expect(res.status).to.equal(404);
          done();
        });
      });
    });

  });
});

