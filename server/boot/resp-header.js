'use strict';

module.exports = function (server) {

  var urls = [
    '/api/users',
  ];
  var remotes = server.remotes();
  // modify all returned values
  remotes.after('**', function (ctx, next) {

    urls.forEach(function (item, index) {
      if (ctx.req.originalUrl.indexOf(item) != -1) {
        ctx.res.set('Cache-Control', 'no-cache, no-store');
        ctx.res.set('Pragma', 'no-cache');
      }
    });

    next();

  });

};

