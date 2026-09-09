'use strict';
var loopback = require('loopback');
const { ObjectID } = require('mongodb');
module.exports = function (Usertosite) {
    var app = require('../../server/server');
    var ops = require('../middleware/operations.js');
    Usertosite.disableRemoteMethodByName('__get__site', false);
    Usertosite.disableRemoteMethodByName('__get__user', false);

    function getCurrentUserId() {
        var ctx = loopback.getCurrentContext();
        var accessToken = ctx && ctx.get('accessToken');
        var userId = accessToken && accessToken.userId;
        return userId;
    }


    Usertosite.remoteMethod(
        'unlinkAll',
        {
            description: "Use this method to fetch the records by filter.",
            http: { path: '/:siteId/unlinkAll', verb: 'get' },
            accepts: [
                { arg: 'siteId', type: 'string' },
                { arg: 'req', type: 'object', http: { source: 'req' } },
                { arg: 'res', type: 'object', http: { source: 'res' } }
            ],
            returns: {
                arg: 'response',
                default: [
                    {
                        "message": "Deleted all users from the site"
                    }
                ]
            }
        });

    Usertosite.unlinkAll = function (siteId, req, res, cb) {

        var userId = req.accessToken.userId;

        console.log('this gets called');

        Usertosite.find({ where: { siteId: siteId, userId: userId } }).then(function (record) {
            if (record[0].role == ops.siteroles.manager) {
                app.models.UserToSite.getDataSource().connector.connect((err, db) => {
                    db.collection('UserToSite').deleteMany({ "siteId": siteId });
                });
                res.status(200).send({ 'message': "Replace Success!" });

            }
            else {
                res.status(401).send({ 'message': "Unauthorized access" });
            }
        });
    };

    Usertosite.remoteMethod(
        'replaceUser',
        {
            description: "Use this method to fetch the records by filter.",
            http: { path: '/:id/replaceUser', verb: 'post' },
            accepts: [
                { arg: 'id', type: 'string' },
                { arg: 'req', type: 'object', http: { source: 'req' } },
                { arg: 'res', type: 'object', http: { source: 'res' } }
            ],
            returns: {
                arg: 'response',
                type: 'array',
                root: true,
                default: [
                    {
                        "disableNotification": "boolean",
                        "role": "number",
                        "id": "string",
                        "userId": "string",
                        "siteId": "string"
                    }
                ]
            }
        });

    Usertosite.replaceUser = function (id, req, res) {
        app.models.UserToSite.getDataSource().connector.connect((err, db) => {
            var UserToSite = app.models.UserToSite;
            var userId = req.accessToken.userId;
            UserToSite.find({ where: { 'userId': userId } }).then(function (userToSite) {
                var role = userToSite[0].role;
                // if(role == ops.siteroles.manager ){
                db.collection('UserToSite').updateOne(
                    { _id: ObjectID(req.body.id) },
                    {
                        $set: {
                            "role": req.body.role
                        }
                    }
                );
                res.status(200).send({ 'message': "Replace Success!" });
                // }
                // else {
                //     res.status(401).send({'message':"Unauthorized access"});
                // }
            })
        })
    };

    Usertosite.remoteMethod('checkUserExist', {
        description: 'Check if user email is already linked to given site',
        accepts: [
            { arg: 'siteId', type: 'string', required: true },
            { arg: 'email', type: 'string', required: true },
            { arg: 'res', type: 'object', http: { source: 'res' } }
        ],
        http: { path: '/checkUserExist', verb: 'get' },
        returns: { arg: 'available', type: 'boolean' }
    });

    Usertosite.checkUserExist = async function (siteId, email) {
        const User = app.models.User;

        // Split and sanitize comma-separated emails
        const emailList = email.split(',').map(e => e.trim()).filter(e => !!e);

        // Find users with any of these emails
        const users = await User.find({ where: { email: { inq: emailList } } });

        if (!users.length) return true; // none of the emails exist in User model

        const userIds = users.map(user => user.id);

        // Check if any of the users are already linked to the site
        const existing = await Usertosite.findOne({
            where: {
                siteId: siteId,
                userId: { inq: userIds }
            }
        });

        // If any match found, return false
        return !existing;
    };


};
