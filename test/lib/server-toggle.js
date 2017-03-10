'use strict';

const debug = require('debug')('cfgram:server-toggle');
const PORT = process.env.PORT || 3000;

module.exports = exports = {};

exports.serverOn = function(server, done){
  debug('serverOn');

  if(!server.isRunning) {
    server.listen(PORT, () => {
      debug('server up:',PORT);
      server.isRunning = true;
      done();
    });
    return;
  }
  done();
};

exports.serverOff = function(server, done) {
  debug('serverOff');

  if(server.isRunning) {
    server.close( err => {
      if (err) console.error(err);
      server.isRunning = false;
      debug('server down');
      done();
    });
    return;
  }
  done();
};