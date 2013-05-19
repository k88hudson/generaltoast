'use strict';

module.exports = function (app, nconf, isAdmin) {
  var Meatspace = require('meatspace');
  var request = require('request');
  var utils = require('../lib/utils');

  var meat = new Meatspace({
    fullName: nconf.get('full_name'),
    postUrl: nconf.get('url'),
    db: nconf.get('db')
  });

  app.get('/recent', function (req, res) {
    meat.shareRecent(function (err, posts) {
      res.send({ posts: posts, isAdmin: utils.isEditor(req) });
    });
  });

  app.get('/post/:id', function (req, res, next) {
    meat.get(req.params.id, function (err, post) {
      if (err || (!req.session.email && post.meta.isPrivate)) {
        res.status(404);
        res.format({
          html: function () {
            next();
          },
          json: function () {
            res.send({ message: 'not found' });
          }
        });
      } else {
        res.format({
          html: function () {
            res.render('index', { url: '/post/' + req.params.id });
          },
          json: function () {
            res.send({ post: post, isAdmin: utils.isEditor(req) });
          }
        });
      }
    });
  });

  app.get('/all', function (req, res, next) {
    if (utils.isEditor(req)) {
      req.session.isAdmin = true;
      meat.getAll(function (err, posts) {
        if (err) {
          res.status(404);
          res.json({ message: 'not found' });
        } else {
          res.json({ posts: posts, isAdmin: true });
        }
      });
    } else {
      req.session.reset();
      meat.shareRecent(function (err, posts) {
        if (err) {
          res.status(404);
          res.json({ message: 'not found' });
        } else {
          res.json({ posts: posts, isAdmin: false });
        }
      });
    }
  });

  app.get('/add', isAdmin, function (req, res) {
    res.render('add', { url: null, isAdmin: true });
  });

  app.get('/edit/:id', isAdmin, function (req, res) {
    meat.get(req.params.id, function (err, post) {
      var postUrl = '';
      if (post.content.urls.length > 0) {
        postUrl = post.content.urls[0].url;
      }

      res.render('edit', {
        post: post,
        postUrl: postUrl,
        geolocation: post.meta.geolocation || '',
        url: '/edit/' + post.id,
        isAdmin: true
      });
    });
  });

  app.post('/share', isAdmin, function (req, res, next) {
    request.get({ url: req.body.url, json: true }, function (err, resp, body) {
      if (err) {
        res.status(404);
        next();
      } else {
        body.post.meta.originUrl = req.body.url;
        meat.share(body.post, meat.postUrl, function (err, post) {
          if (err) {
            res.status(400);
            next(err);
          } else {
            res.json({ post: post });
          }
        });
      }
    });
  });

  app.post('/add', isAdmin, function (req, res, next) {
    var message = {
      content: {
        message: req.body.message,
        urls: []
      },
      meta: {
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
        next(err);
      } else {
        message.meta.originUrl = nconf.get('domain') + ':' + nconf.get('authPort') +
          '/post/' + post.id;
        meat.update(message, function (err, post) {
          if (err) {
            res.status(400);
            next(err);
          } else {
            res.redirect('/');
          }
        })
      }
    });
  });

  app.post('/edit/:id', isAdmin, function (req, res) {
    meat.get(req.params.id, function (err, post) {
      if (err) {
        res.status(400);
        res.json({ message: err.toString() });
      } else {
        post.content.message = req.body.message;
        if (req.body.url) {
          post.content.urls[0] = {
            title: req.body.url,
            url: req.body.url
          };
        } else {
          post.content.urls = [];
        }

        post.meta.isPrivate = req.body.is_private || false;
      }

      meat.update(post, function (err, post) {
        if (err) {
          res.status(400);
          res.json({ message: err.toString() });
        } else {
          res.redirect('/edit/' + post.id);
        }
      });
    });
  });

  app.post('/delete/:id', isAdmin, function (req, res) {
    meat.del(req.params.id, function (err, status) {
      if (err) {
        res.status(400);
        res.json({ message: err.toString() });
      } else {
        res.json({ message: 'deleted' });
      }
    });
  });
};
