'use strict';

const request = require('superagent');
const expect = require('chai').expect;
const Promise = require('bluebird');

const User = require('../model/user.js');
const Gallery = require('../model/gallery.js');

const url = `http://localhost:${process.env.PORT}`;

const serverToggle = require('./lib/server-toggle.js');
const server = require('../server.js');


const sampleUser = {
  username: 'sampleUser',
  email: 'email@test.com',
  password: '1234'
};
const sampleGallery = {
  name: 'sampleName',
  desc: 'sample description'
};


describe('Gallery Routes', function() {
  before( done => serverToggle.serverOn(server, done));
  after(done => serverToggle.serverOff(server, done));
  afterEach( done => {
    Promise.all([
      User.remove({}),
      Gallery.remove({})
    ])
    .then( () => done())
    .catch(done);
  });
  describe('POST: /api/gallery', function () {
    before( done => {
      //create a user
      new User(sampleUser)
      .createPasswordHash(sampleUser.password)
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

    describe('With a valid token and body', () => {
      it('should return a new gallery', done => {
        request.post(`${url}/api/gallery`)
        .send(sampleGallery)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.desc).to.equal(sampleGallery.desc);
          expect(res.body.name).to.equal(sampleGallery.name);
          expect(res.body.userID).to.equal(this.tempUser._id.toString());
          done();
        });
      });
    });
    describe('Without a valid token', () => {
      it('should return a 401', done => {
        request.post(`${url}/api/gallery`)
        .send(sampleGallery)
        .set({
          Authorization: 'Bearer ofbadnews'
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(err.message).to.equal('Unauthorized');
          done();
        });
      });
    });
    describe('Without a valid body', () => {
      it('should return a 400', done  => {
        request.post(`${url}/api/gallery`)
        .send({bad: 'data'})
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          expect(err.message).to.equal('Bad Request');
          done();
        });
      });
    });
  });
  describe('GET: /api/gallery/:id', function() {
    before( done => {
      //create a user
      new User(sampleUser)
      .createPasswordHash(sampleUser.password)
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
    before( done => {
      //create a gallery
      this.tempGallery = new Gallery(sampleGallery);
      this.tempGallery.userID = this.tempUser._id;
      this.tempGallery.save()
      .then( gallery => {
        this.tempGallery = gallery;
        done();
      })
      .catch(done);
    });
    describe('with a valid gallery ID', () => {
      it('should return a gallery', done => {
        request.get(`${url}/api/gallery/${this.tempGallery._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(sampleGallery.name);
          expect(res.body.desc).to.equal(sampleGallery.desc);
          expect(res.body.userID).to.equal(this.tempUser._id.toString());
          done();
        });
      });
    });
    describe('with an invalid gallery ID', () => {
      it('should return a 404', done => {
        request.get(`${url}/api/gallery/badID`)
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
    describe('with an invalid token', () => {
      it('should return a 400', done => {
        request.get(`${url}/api/gallery/${this.tempGallery._id}`)
        .set({
          Authorization: 'Bearer ofBadTokens'
        })
        .end((err, res) => {
          expect(err.message).to.equal('Unauthorized');
          expect(res.status).to.equal(401);
          done();
        });
      });
    });
  });
  describe('PUT /api/gallery/:id', function() {
    before( done => {
      //create a user
      new User(sampleUser)
      .createPasswordHash(sampleUser.password)
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
    before( done => {
      //create a gallery
      this.tempGallery = new Gallery(sampleGallery);
      this.tempGallery.userID = this.tempUser._id;
      this.tempGallery.save()
      .then( gallery => {
        this.tempGallery = gallery;
        done();
      })
      .catch(done);
    });
    describe('with a valid token', () => {
      describe('with a valid body', () => {
        it('should return an updated gallery', done => {
          request.put(`${url}/api/gallery/${this.tempGallery._id}`)
          .set({
            Authorization: `Bearer ${this.tempToken}`
          })
          .send({name: 'updatedName', desc: 'updatedDesc'})
          .end((err, res) => {
            if(err) return done(err);
            expect(res.status).to.equal(200);
            expect(res.body.name).to.equal('updatedName');
            expect(res.body.desc).to.equal('updatedDesc');
            expect(res.body.userID).to.equal(this.tempUser._id.toString());
            done();
          });
        });
      });
      describe('with an invalid body', () => {
        it('should return a 400 error', done => {
          request.put(`${url}/api/gallery/${this.tempGallery._id}`)
          .set({
            Authorization: `Bearer ${this.tempToken}`
          })
          .send({badName:'thiswontupdate', badDesc:'neitherwillthis'})
          .end((err, res) => {
            expect(err.message).to.equal('Bad Request');
            expect(res.status).to.equal(400);
            done();
          });
        });
      });
      describe('with an invalid gallery ID', () => {
        it('should return a 404', done => {
          request.put(`${url}/api/gallery/badGalleryID`)
          .set({
            Authorization: `Bearer ${this.tempToken}`
          })
          .send({name: 'thiswontupdate', desc: 'neitherwillthis'})
          .end((err, res) => {
            expect(err.message).to.equal('Not Found');
            expect(res.status).to.equal(404);
            done();
          });
        });
      });
      describe('with an invalid token', () => {
        it('should return a 401 error', done => {
          request.put(`${url}/api/gallery/${this.tempGallery._id}`)
          .set({
            Authorization: 'Bearer ofBadPuns'
          })
          .send({name: 'didnthaveachance', desc:'neverwillgetupdated'})
          .end((err, res) => {
            expect(err.message).to.equal('Unauthorized');
            expect(res.status).to.equal(401);
            done();
          });
        });
      });
    });
  });
  describe('DELETE: /api/gallery/:id', function () {
    before( done => {
      //create a user
      new User(sampleUser)
      .createPasswordHash(sampleUser.password)
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
    before( done => {
      //create a gallery
      this.tempGallery = new Gallery(sampleGallery);
      this.tempGallery.userID = this.tempUser._id;
      this.tempGallery.save()
      .then( gallery => {
        this.tempGallery = gallery;
        done();
      })
      .catch(done);
    });
    describe('with a valid id', () => {
      it('should return a 204', done => {
        request.delete(`${url}/api/gallery/${this.tempGallery._id}`)
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
    describe('with an invalid id', () => {
      it('should return a 404', done => {
        request.delete(`${url}/api/gallery/${this.tempGallery._id}`) //gallery was already removed above
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          expect(err.message).to.equal('Not Found');
          done();
        });
      });
    });
  });
});

