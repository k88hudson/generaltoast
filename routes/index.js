'use strict';

module.exports = function (app, meat, nconf, isAdmin) {
  var utils = require('../lib/utils');

  app.get('/', function (req, res) {
    var isAdmin = false;

    if (utils.isEditor(req)) {
      isAdmin = true;
      req.session.isAdmin = true;
    }

    var pagination = utils.setPagination(req, meat);

    res.render('index', {
      url: '/',
      isAdmin: isAdmin,
      page: 'index',
      prev: pagination.prev,
      next: pagination.next
    });
  });

  app.get('/logout', function (req, res) {
    req.session.reset();
    res.redirect('/');
  });
};
