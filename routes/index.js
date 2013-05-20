'use strict';

module.exports = function (app, nconf, notLoggedIn, isAdmin) {
  var utils = require('../lib/utils');

  app.get('/', function (req, res) {
    var isAdmin = false;

    if (utils.isEditor(req)) {
      isAdmin = true;
      req.session.isAdmin = true;
    }

    res.render('index', { url: '/recent', isAdmin: isAdmin });
  });

  app.get('/admin', notLoggedIn, function (req, res) {
    res.render('admin', { url: null });
  });

  app.get('/logout', function (req, res) {
    req.session.reset();
    res.format({
      html: function () {
        res.redirect('/');
      },
      json: function () {
        res.send({ message: 'logged out' });
      }
    });
  });
};
