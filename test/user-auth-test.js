'use strict';

const request = require('superagent');
const expect = require('chai').expect;
const User = require('../model/user.js');

const url = `localhost:${process.env.PORT}`;

const serverToggle = require('./lib/server-toggle.js');
const server = require('../server.js');

const sampleUser = {
  username: 'testUser',
  password: '1234',
  email: 'fake@email.com',
};

describe('User Auth tests', function() {
  before( done => serverToggle.serverOn(server, done));
  after(done => serverToggle.serverOff(server, done));
  describe('POST: /api/signup', function() {
    describe('with a valid body', function() {
      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a token', done => {
        request.post(`${url}/api/signup`)
        .send(sampleUser)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.text).to.be.a('string');
          done();
        });
      });
    });
    describe('with an invalid body', function() {
      it('should return a 400 error', done => {
        request.post(`${url}/api/signup`)
        .send('bad data')
        .end((err, res) => {
          expect(err.message).to.equal('Bad Request');
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
  });

  describe('GET: /api/signup', function() {
    describe('with valid credentials', function() {
      before( done => {
        this.tempUser = new User(sampleUser);
        this.tempUser.createPasswordHash(this.tempUser.password)
        .then( user => user.save())
        .then( () => done())
        .catch(done);
      });
      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });
      it('should return a token', done => {
        request.get(`${url}/api/signin`)
        .auth('testUser', '1234')
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          done();
        });
      });
    });
    describe('with invalid credentials', function () {
      before( done => {
        this.tempUser = new User(sampleUser);
        this.tempUser.createPasswordHash(this.tempUser.password)
        .then( user => user.save())
        .then( () => done())
        .catch(done);
      });
      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });
      describe('with an invalid password', () => {
        it('should respond with a 401'  , done => {
          request.get(`${url}/api/signin`)
          .auth('testUser', 'wrongPass')
          .end((err, res) => {
            expect(err.status).to.equal(401);
            expect(res.text).to.equal('invalid password!');
            done();
          });
        });
      });
      describe('with an invalid username', () => {
        it('should respond with a 401'  , done => {
          request.get(`${url}/api/signin`)
          .auth('wrongUser', '1234')
          .end((err, res) => {
            expect(err.status).to.equal(401);
            expect(res.text).to.equal('user not found!');
            done();
          });
        });
      });
    });
  });
  describe('for a nonexistent endpoint', function () {
    it('should return a 404', done => {
      request(`${url}/wrong/`)
      .end((err, res) => {
        expect(err.message).to.equal('Not Found');
        expect(res.status).to.equal(404);
        done();
      });
    });
  });
});