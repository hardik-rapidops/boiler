'use strict';
global.Promise = require('bluebird'); // Note strongloop 3.0 uses bluebird as the promise library

Promise.config({
    // Enable warnings
    warnings: false,
    // Enable long stack traces
    longStackTraces: true,
    // Enable cancellation
    cancellation: true,
    // Enable monitoring
    monitoring: true
});

module.exports = function(server) {

    Promise.each(server.models(), function(model) {

        if (model.dataSource) {
            var autoUpdate = Promise.promisify(model.dataSource.autoupdate);
            if (autoUpdate) {
                return autoUpdate.call(model.dataSource, model.modelName);
            }
        }
    });
};