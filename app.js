var express = require('express');
var configurations = module.exports;
var app = express();
var server = require('http').createServer(app);
var nconf = require('nconf');
var Meatspace = require('meatspace');
var settings = require('./settings')(app, configurations, express);
var whitelist = require('./whitelist');

nconf.argv().env().file({ file: 'local.json' });

/* Filters for routes */

var isAdmin = function (req, res, next) {
  if (req.session.email && whitelist.indexOf(req.session.email) > -1) {
    next();
  } else {
    res.redirect('/logout');
  }
};

var notLoggedIn = function (req, res, next) {
  if (req.session.email) {
    res.redirect('/');
  } else {
    next();
  }
}

/* Initialize meat */

var meat = new Meatspace({
  fullName: nconf.get('full_name'),
  postUrl: nconf.get('url'),
  db: nconf.get('db'),
  limit: 20
});

require('express-persona')(app, {
  audience: nconf.get('domain') + ':' + nconf.get('authPort')
});

// routes
require('./routes')(app, meat, nconf, notLoggedIn, isAdmin);
require('./routes/posts')(app, meat, nconf, isAdmin);
require('./routes/subscriptions')(app, meat, nconf, isAdmin);

app.listen(process.env.PORT || nconf.get('port'));
