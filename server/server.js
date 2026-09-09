'use strict';

var loopback = require('loopback');
var boot = require('loopback-boot');
var moment = require('moment-timezone');
require('events').EventEmitter.defaultMaxListeners = 0;
var notifications = require('../common/middleware/notifications.js');
const path = require('path');

const env = process.env.ENVIRONMENT || '';
const datasourceFile = path.join(__dirname, `datasources${env ? '.' + env : ''}.json`);

var app = module.exports = loopback();

console.log("Loading datasource:", datasourceFile);
const datasourceConfig = require(datasourceFile);

Object.keys(datasourceConfig).forEach((name) => {

    app.dataSource(
        name,
        datasourceConfig[name]
    );

});

app.start = function () {
    // start the web server
    return app.listen(function () {
        app.emit('started');
        var baseUrl = app.get('url').replace(/\/$/, '');
       // notifications.invoke();
       // notifications.test();
    //     notifications.testIos('3b30da0452f416375e30dfb1d7f40ee49846831f0823f95c3d27ff9477bf74de',"Boiler1",
    // "Temperature High",
    // [{ name: "Site A" }]);

        console.log('Web server listening at: %s', baseUrl);
        if (app.get('loopback-component-explorer')) {
            var explorerPath = app.get('loopback-component-explorer').mountPath;
            console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
        }
    });
};
// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function (err) {
    if (err) throw err;

    // start the server if `$ node server.js`
    if (require.main === module)
        app.start();
});

app.use((req, res, next) => {
    const allowedOrigins = ['https://dev.nuroconnect.com', 'http://localhost:3000', 'https://app.nuroconnect.com', 'https://www.google.com', 'https://www.googleapis.com', 'http://localhost:3001'];
    const origin = req.headers.origin;
    if(req.method == "POST" && origin){
        if (allowedOrigins.includes(origin)) {
            res.setHeader('Access-Control-Allow-Origin', origin);
            res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            res.header('Access-Control-Allow-Credentials', true);
            return next();
       }
       else{
           res.status(400).send({'message':"User Can not be access"});
       }
    }
    else{
       return next();
    }
  });


