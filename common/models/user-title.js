'use strict';

module.exports = function(Usertitle) {

    Usertitle.remoteMethod(
        'deleteAll',
        {
            description: "Private method, don't call this method.",
            http: {path: '/all', verb: 'delete'},
            returns: {
                arg: 'response', type: 'object',
                default: {"success": true}
            }
        });

    Usertitle.deleteAll = function (cb) {
        Usertitle.destroyAll(function (err, result) {
            cb(null, {success: true});
        })
    };

};
