'use strict';

module.exports = function (app) {

    var remotes = app.remotes();
    remotes.options.rest = remotes.options.rest || {};
    remotes.options.rest.handleErrors = false;
    app.middleware('final', FinalErrorHandler);
    function FinalErrorHandler(err, req, res, next) {
        if (err) {
            if (err.statusCode == 404) {
                res.status(err.statusCode).send({
                    error: {
                        statusCode: err.statusCode,
                        name: 'Error',
                        message: "Model not found",
                        code: "MODEL_NOT_FOUND"
                    },
                }).end();
            }
        }
        next();
    }
};