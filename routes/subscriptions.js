'use strict';

module.exports = function (app, meat, nconf, isAdmin) {
  var request = require('request');

  app.get('/subscription/all', function (req, res) {
    var subscriptionMax = 20;
    meat.getSubscriptions(function (err, subscriptions) {
      if (err) {
        res.status(400);
        next(err);
      } else {
        var posts;
        var count = 0;

        for (var i = 0; i < subscriptions.length; i ++) {
          count ++;
          meat.getSubscriptionRecent(subscriptions[i], function (err, pArr) {
            if (!err) {
              if (!posts) {
                posts = pArr;
              } else {
                posts.concat(pArr);
              }
            }

            if (count === subscriptions.length || count === subscriptionMax) {
              res.json({ posts: posts });
            }
          });
        }
      }
    });
  });

  app.get('/subscription/add', isAdmin, function (req, res) {
    res.render('subscription_add', { url: null, isAdmin: true });
  });

  app.post('/subscription/add', isAdmin, function (req, res) {
    meat.subscribe(req.body.url, function (err, subscription) {
      if (err) {
        res.status(400);
        next(err);
      } else {
        res.redirect('/subscription/manage');
      }
    });
  });

  app.get('/subscription/manage', isAdmin, function (req, res, next) {
    meat.getSubscriptions(function (err, subscriptions) {
      if (err) {
        res.status(400);
        next(err);
      } else {
        res.render('subscription_manage', {
          url: null,
          isAdmin: true,
          subscriptions: subscriptions
        });
      }
    });
  });

  app.post('/subscription/unsubscribe', isAdmin, function (req, res) {
    meat.unsubscribe(req.body.url, function (err, status) {
      if (err) {
        res.status(400);
        res.json({ message: err.toString() });
      } else {
        res.json({ message: 'unsubscribed' });
      }
    });
  });
};
