'use strict';

module.exports = function (app, nconf, isAdmin) {
  var Meatspace = require('meatspace');
  var whitelist = require('../whitelist');

  var meat = new Meatspace({
    fullName: nconf.get('full_name'),
    postUrl: nconf.get('url'),
    db: 1
  });

  app.get('/', function (req, res) {
    res.render('index');
  });

  app.get('/recent.json', function (req, res) {
    meat.shareRecent(function (err, posts) {
      res.json({ posts: posts });
    });
  });

  app.get('/post/:id', function (req, res, next) {
    meat.get(req.params.id, function (err, post) {
      if (err || (!req.session.email && post.meta.isPrivate)) {
        res.status(404);
        res.json({ message: 'not found' });
      } else {
        res.json({ post: post });
      }
    });
  });

  app.get('/admin', function (req, res) {
    res.render('admin');
  });

  app.get('/all', function (req, res, next) {
    if (req.session && req.session.email &&
        whitelist.indexOf(req.session.email) > -1) {
      req.session.isAdmin = true;
      meat.getAll(function (err, posts) {
        if (err) {
          res.status(404);
          res.json({ message: 'not found' });
        } else {
          res.json({ posts: posts });
        }
      });
    } else {
      req.session.reset();
      meat.shareRecent(function (err, posts) {
        if (err) {
          res.status(404);
          res.json({ message: 'not found' });
        } else {
          res.json({ posts: posts });
        }
      });
    }
  });

  app.get('/add', isAdmin, function (req, res) {
    res.render('add');
  });

  app.get('/edit/:id', isAdmin, function (req, res) {
    meat.get(req.params.id, function (err, post) {
      res.json({ post: post });
    });
  });

  app.post('/add', isAdmin, function (req, res) {
    var message = {
      content: {
        message: req.body.message,
        urls: []
      },
      meta: {
        originUrl: meat.postUrl,
        location: req.body.geolocation,
        isPrivate: req.body.is_private || false,
        isShared: false
      },
      shares: []
    };

    if (req.body.url) {
      message.content.urls.push({
        title: req.body.url,
        url: req.body.url
      });
    }

    meat.create(message, function (err, post) {
      if (err) {
        res.status(400);
        res.json({ message: err.toString() });
      } else {
        res.redirect('/');
      }
    });
  });

  app.post('/edit/:id', isAdmin, function (req, res) {
    res.redirect('/edit/' + id);
  });

  app.post('/delete/:id', isAdmin, function (req, res) {
    res.redirect('/all');
  });

  app.get('/logout', function (req, res) {
    req.session.reset();
    res.redirect('/');
  });
};
