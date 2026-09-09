'use strict';

let email = require('../middleware/mails.js');
let operations = require('../middleware/operations.js');
let thirdParty = require('../middleware/thirdparty-apis');
let database = require('../middleware/mongo.js');
var debug = require('debug')('loopback:user');
var moment = require('moment-timezone');
const { RoleMapping } = require('loopback');
const { ObjectID } = require('mongodb');
var MAX_PASSWORD_LENGTH = 72;

const captchaSecret = '6LcV_cIUAAAAAAQ3_6kwaTBFCSkLdwC7CM3ayHJ2'; //TODO: move this to config.json

module.exports = function (User) {

    let app = require('../../server/server');

    User.disableRemoteMethodByName('__create__roles', false);
    User.disableRemoteMethodByName('__update__roles', false);
    User.disableRemoteMethodByName('__destroy__roles', false);

    User.beforeRemote('create', function (context, user, next) {

        user = context.req.body;

        let obj = {
            secret: captchaSecret,
            response: user.captcha
        };

        let url = operations.replace(thirdParty.APIs.captcha.host, obj);

        function failure() {
            let error = { success: false, message: "0045: Unable to create user at this time. Please try again later." };
            context.res.status(400).send(error);
        }

        function success() {

            let id = operations.unique();
            context.verificationToken = id;
            user.verificationToken = id;

            next();
        }

        delete context.req.body.captcha;
        delete user.captcha;

        thirdParty.get(url, success, failure);
    });

    User.beforeRemote('login', function (context, user, next) {

        //add role to the user.
        user = context.req.body

        if (!user.email && !user.username) {
            failure('USERNAME_EMAIL_REQUIRED', 400)
            return
        }

        if (!user.password) {
            failure('PASSWORD_REQUIRED', 400)
            return
        }

        function failure(messageCode, statusCode = 401) {
            var err1 = { "name": "Error" }
            err1.statusCode = statusCode;
            err1.code = messageCode;
            err1.message = messageCode;
            context.res.status(statusCode).send({ "error": err1 });
        }

        function success() {

            next();
        }


        User.findOne({ where: { email: user.email } }, function (err, result) {
            if (err) {
                failure("LOGIN_FAILED")
                return
            }

            if (!result) {
                failure("USER_NOT_FOUND")
                return
            } else {
                result.hasPassword(user.password, function (err, isMatch) {
                    if (err) {
                        debug('An error is reported from User.hasPassword: %j', err);
                        failure("LOGIN_FAILED")
                    } else if (!isMatch) {
                        debug('The password is invalid for user %s', user.email || user.username);
                        failure("PASSWORD_NOT_MATCH")
                    } else {
                        // let RoleMapping = app.models.RoleMapping;
                        // var ObjectID = RoleMapping.getDataSource().connector.getDefaultIdType();
                        // RoleMapping.defineProperty('principalId', {
                        //     type: ObjectID,
                        // });
                        // RoleMapping.defineProperty('roleId', {
                        //     type: ObjectID,
                        // });
                        // RoleMapping.find({ where: { principalId: result.id } }, function (err, result1) {
                        //     console.log(result1.length)
                        //     if (err) {
                        //         failure("Error in getting role", err)
                        //         return
                        //     }
                        //     if (result1.length == 0) {
                        //         RoleMapping.create({
                        //             principalType: 'USER',
                        //             principalId: result.id,
                        //             roleId: "59007b2e3237eda47ff323fd"
                        //         }, function (err, principal) {
                        //             if (err) {
                        //                 failure("Error in assigning role", err)
                        //                 return
                        //             }
                        //             success()
                        //             return
                        //         });
                        //     }
                        //     else {
                        //         success()
                        //         return
                        //     }
                        // })
                        success()
                        return
                    }
                })
            }
        })
    });


    User.beforeRemote('prototype.patchAttributes', function (context, user, next) {


        let paramID = context.req.params.id;
        let userID = context.req.accessToken.userId;
        if (!paramID) {
            next();
            return;
        }

        if (Object.keys(context.req.body).length === 0) {
            invalid();
            return;
        }

        delete context.req.body.lastUpdate;
        delete context.req.body.lastUpdated;
        delete context.req.body.created;
        delete context.req.body.passwordKey;
        delete context.req.body.password;
        delete context.req.body.email;
        delete context.req.body.emailVerified;
        delete context.req.body.status;
        delete context.req.body.realm;
        delete context.req.body.challenges;
        delete context.req.body.devices;
        delete context.req.body.roles;

        let reqID = context.req.body.id;
        context.req.body.lastUpdate = new Date();
        if (paramID != userID || reqID != userID) {
            failure();
        } else {
            next();
        }

        function failure() {
            let error = { success: false, message: "Unauthorized Access. Please check the account." };
            context.res.status(401).send(error);
        }


        function invalid() {
            let error = { success: false, message: "Invalid Data." };
            context.res.status(400).send(error);
        }


    });

    User.beforeRemote('upsertWithWhere', function (context, user, next) {

        user = context.req.body;

        let obj = {
            secret: captchaSecret,
            response: user.captcha
        };

        let url = operations.replace(thirdParty.APIs.captcha.host, obj);

        function failure() {
            let error = { success: false, message: "0046: Unable to update user at this time. Please try again later." };
            context.res.status(400).send(error);
        }

        function success() {

            next();
        }

        delete context.req.body.captcha;
        delete user.captcha;

        thirdParty.get(url, success, failure);
    });

    User.afterRemote('upsertWithWhere', function (context, user, next) {

        var where = {
            where: {
                id: user.id
            }
        };

        user.updateAttributes({ "emailVerified": "true" }).then(function (data) {
            next();
        })
    });

    User.afterRemote('create', function (context, user, next) {

        let subject = email.templates.confirm.subject;
        let obj = {
            username: user.firstName + " " + user.lastName,
            link: 'https://' + context.req.hostname + '/#!/verify-success/' + user.id + '/' + context.verificationToken
        };

        delete context.verificationToken;

        let body = operations.replace(email.templates.confirm.body, obj);

        email.send({
            to: user.email,
            subject: subject,
            html: body
        }, function (err) {
            next(err);
        });
    });

    User.remoteMethod(
        'forgotPassword',
        {
            http: { path: '/forgotPassword', verb: 'post' },
            isStatic: true,
            accepts: [
                {
                    arg: 'email',
                    type: 'object',
                    http: { source: 'body' }
                },
                {
                    arg: 'req',
                    type: 'object',
                    'http': {
                        source: 'req'
                    }
                },
                {
                    arg: 'res',
                    type: 'object',
                    'http': {
                        source: 'res'
                    }
                }
            ],
            returns: {
                arg: 'response',
                type: 'object',
                default: {
                    "success": true,
                    "message": "an email with link sent to your mailing address."
                }
            }
        });

    User.remoteMethod(
        'checkEmail',
        {
            http: { path: '/checkEmail', verb: 'post' },
            accepts: [
                {
                    arg: 'email',
                    type: 'object',
                    http: { source: 'body' }
                },
                {
                    arg: 'req',
                    type: 'object',
                    'http': {
                        source: 'req'
                    }
                },
                {
                    arg: 'res',
                    type: 'object',
                    'http': {
                        source: 'res'
                    }
                }
            ],
            returns: {
                arg: 'response',
                type: 'object',
                default: {
                    "success": true,
                    "message": "Invitation pending"
                }
            }
        });

    User.remoteMethod(
        'resendInvite',
        {
            http: { path: '/resendInvite', verb: 'post' },
            accepts: [
                {
                    arg: 'email',
                    type: 'object',
                    http: { source: 'body' }
                },
                {
                    arg: 'req',
                    type: 'object',
                    'http': {
                        source: 'req'
                    }
                },
                {
                    arg: 'res',
                    type: 'object',
                    'http': {
                        source: 'res'
                    }
                }
            ],
            returns: {
                arg: 'response',
                type: 'object',
                default: {
                    "success": true,
                    "message": "Invitation has been sent to your email address"
                }
            }
        });

    User.remoteMethod(
        'changePassword',
        {
            http: { path: '/changePassword', verb: 'post' },
            isStatic: true,
            accepts: [
                {
                    arg: 'email',
                    type: 'object',
                    http: { source: 'body' }
                },
                {
                    arg: 'req',
                    type: 'object',
                    'http': {
                        source: 'req'
                    }
                },
                {
                    arg: 'res',
                    type: 'object',
                    'http': {
                        source: 'res'
                    }
                }
            ],
            returns: {
                arg: 'response',
                type: 'object',
                default: {
                    "success": true,
                    "message": "an email with link sent to your mailing address."
                }
            }
        });

    User.remoteMethod(
        'reset',
        {
            http: { path: '/resetPassword', verb: 'post' },
            isStatic: true,
            accepts: [
                {
                    arg: 'record',
                    type: 'object',
                    http: { source: 'body' }
                },
                {
                    arg: 'req',
                    type: 'object',
                    'http': {
                        source: 'req'
                    }
                },
                {
                    arg: 'res',
                    type: 'object',
                    'http': {
                        source: 'res'
                    }
                }
            ],
            returns: {
                arg: 'response',
                type: 'object',
                default: {
                    "success": true,
                    "message": "an email with link sent to your mailing address."
                }
            }
        });

    User.remoteMethod(
        'invite',
        {
            http: { path: '/invite', verb: 'post' },
            isStatic: true,
            accepts: [
                {
                    arg: 'user',
                    type: 'object',
                    http: { source: 'body' }
                },
                {
                    arg: 'req',
                    type: 'object',
                    'http': {
                        source: 'req'
                    }
                },
                {
                    arg: 'res',
                    type: 'object',
                    'http': {
                        source: 'res'
                    }
                }
            ],
            returns: {
                arg: 'response',
                type: 'object',
                default: {
                    "success": true,
                    "message": "an email with link sent to your mailing address."
                }
            }
        });

    User.invite = function (user, req, res, cb) {
        let _user = [];
        let randomPassword = "!@#$)(*&^%";
        let id = operations.unique();
        let success = function (_user) {
            let keys = {};
            if (_user[0].firstName && _user[0].lastName) {
                keys = {
                    username: _user[0].firstName + " " + _user[0].lastName,
                    link: 'https://' + req.hostname + '/#!/login'
                };
            } else {
                keys = {
                    username: "User",
                    link: 'https://' + req.hostname + '/#!/login'
                };
            }

            if (_user[0].new || (!_user[0].created && _user[0].emailVerified == true)) {
                keys = {
                    username: "User",
                    link: 'https://' + req.hostname + '/#!/invite/' + _user[0].id + '/' + _user[0].verificationToken
                };
            }

            let subject;
            let body;

            if (user.siteId == '') {
                subject = email.templates.userroleinvitation.subject;
                body = operations.replace(email.templates.userroleinvitation.body, keys);
            } else {

                subject = email.templates.invitation.subject;
                body = operations.replace(email.templates.invitation.body, keys);
            }

            let success = {
                success: true,
                message: "An email with instructions are sent. Please follow up.",
                id: _user[0].id
            };

            email.send({
                to: user.email,
                subject: subject,
                html: body
            }, function (err) {
                cb(err, success);
            });
        };

        function failure(msg, err) {
            let error = { success: false, message: msg };
            cb(err, error);
        }

        let assignRole = function (_user, roleId) {

             // 🧠 Skip role assignment if roleId is static (e.g., 0, 1, 2)
            if (!isUUID(roleId)) {
                console.log('Static role detected, skipping RoleMapping creation.');
                success(_user); // Still call success
                return;
            }

            let Role = app.models.Role;
            Role.find({ where: { id: roleId } }, function (err, result) {
                if (err) {
                    failure("Error in getting role", err)
                    return
                }

                if (result.length === 0) {
                    failure("Invalid role assigned", null)
                    return
                }

                let RoleMapping = app.models.RoleMapping;
                var ObjectID = RoleMapping.getDataSource().connector.getDefaultIdType();

                // Because of this: https://github.com/strongloop/loopback-connector-mongodb/issues/128
                RoleMapping.defineProperty('principalId', {
                    type: ObjectID,
                });

                let role = result[0];
                //let User = app.models.User;

                role.principals.find({ where: { principalId: _user[0].id } }, function (err, rsp) {
                    if (err) {
                        failure("Error in assigning role", err)
                        return
                    }
                    if (rsp.length > 0) {
                        success(_user)
                        return;
                    }

                    role.principals.create({
                        principalType: RoleMapping.USER,
                        principalId: _user[0].id
                    }, function (err, principal) {
                        if (err) {
                            failure("Error in assigning role", err)
                            return
                        }
                        success(_user)
                        return
                    });
                });
            })
        };

        // ✅ UUID detection helper function
        function isUUID(id) {
             return typeof id === 'string' && id.length > 3;
        }

        User.find({ where: { "email": user.email } })
            .then(function (rows) {
                let UserToSite = app.models.UserToSite;
                if (rows.length > 0) {
                    _user = rows;

                    let obj = {
                        "role": user.role,
                        "userId": rows[0].id,
                        "siteId": user.siteId,
                        disableNotification: false
                    };

                    UserToSite.findOrCreate(obj)
                        .then(function () {
                            // success(_user)
                            assignRole(_user, user.role)
                        })
                }
                else {
                    User.create({ email: user.email, password: randomPassword, verificationToken: id, emailVerified: true })
                        .then(function (newUser) {

                            newUser.new = true;
                            _user = [newUser];

                            let obj = {
                                "role": user.role,
                                "userId": newUser.id,
                                "siteId": user.siteId,
                                disableNotification: false
                            };
                            UserToSite.findOrCreate(obj)
                                .then(function () {
                                    assignRole(_user, user.role)
                                })
                        })
                }
            })
    };

    User.checkEmail = function (params, req, res, cb) {

        let conditions = {
            where: {
                email: params.email
            }
        };

        let success = {
            success: true,
            message: "Invitation pending"
        };

        User.find(conditions).
            then(function (result) {
                if (result.length > 0) {
                    ``
                    if (!result[0].created && result[0].emailVerified == true) {
                        cb(null, success);
                    } else {
                        failure("Account already exist");
                    }
                } else {
                    failure("Email not found")
                }
            });

        function failure(msg) {
            let error = { success: false, message: msg };
            cb(null, error);
        }


    };

    User.resendInvite = function (params, req, res, cb) {

        let conditions = {
            where: {
                email: params.email
            }
        };


        let _user = [];
        let randomPassword = "!@#$)(*&^%";
        let id = operations.unique();

        let success = function (_user) {
            let keys = {};
            if (_user[0].firstName && _user[0].lastName) {
                keys = {
                    username: _user[0].firstName + " " + _user[0].lastName,
                    link: 'https://' + req.hostname + '/#!/login'
                };
            } else {
                keys = {
                    username: "User",
                    link: 'https://' + req.hostname + '/#!/login'
                };
            }


            if (_user[0].new) {
                keys = {
                    username: "User",
                    link: 'https://' + req.hostname + '/#!/invite/' + _user[0].id + '/' + _user[0].verificationToken
                };
            }

            let subject;
            let body;


            if (_user[0].siteId == '') {
                subject = email.templates.userroleinvitation.subject;
                body = operations.replace(email.templates.userroleinvitation.body, keys);
            } else {
                subject = email.templates.invitation.subject;
                body = operations.replace(email.templates.invitation.body, keys);
            }

            let success = {
                success: true,
                message: "An email with instructions are sent. Please follow up.",
            };

            email.send({
                to: params.email,
                subject: subject,
                html: body
            }, function (err) {
                cb(err, success);
            });
        };


        User.find(conditions).
            then(function (result) {
                if (result.length > 0) {
                    if (!result[0].created && result[0].emailVerified == true) {
                        result[0].new = true;
                        let UserToSite = app.models.UserToSite;

                        UserToSite.find({ where: { userId: result[0].id } }).
                            then(function (res) {
                                if (res.length > 0) {
                                    result[0].siteId = res[0].siteId
                                    success(result)
                                }
                            });
                    } else {
                        failure("User account already created");
                    }
                } else {
                    failure("User account not found")
                }
            });

        function failure(msg) {
            let error = { success: false, message: msg };
            cb(null, error);
        }


    };


    User.forgotPassword = function (params, req, res, cb) {
        function next() {
            if (!params.email) {
                // failure();
                let success = {
                    success: true,
                    message: "An email with instructions are sent to your mail. Please check."
                };
                res.status(200).send(success);
                return;
            }
            let conditions = {
                where: {
                    email: params.email
                }
            };

            let success = {
                success: true,
                message: "An email with instructions are sent to your mail. Please check."


            };

            User.find(conditions).
                then(function (result) {
                    if ((!result || result.length == 0) || (result && !result[0].created)) {
                        // failure();
                        let success = {
                            success: true,
                            message: "An email with instructions are sent to your mail. Please check."
                        };
                        res.status(200).send(success);
                        return;
                    }
                    // if(result && !result[0].created) {
                    //     let success = {
                    //         success: true,
                    //         message: "An email with instructions are sent to your mail. Please check."
                    //     };
                    //     res.status(200).send(success);
                    //     return;
                    // }
                    let passwordKey = operations.unique();
                    let time = moment.tz().add('15', 'minutes').valueOf();
                    let keys = {
                        username: result[0].firstName + " " + result[0].lastName,
                        link: 'https://' + req.hostname + '/#!/reset-password/' + passwordKey + '/' + time
                    };

                    let subject = email.templates.forgotPassword.subject;
                    let body = operations.replace(email.templates.forgotPassword.body, keys);

                    let where = { 'email': params.email },
                        update = { passwordKey: passwordKey };

                    result[0].updateAttributes(update).then(function (result) {
                        email.send({
                            to: params.email,
                            subject: subject,
                            html: body
                        }, function (err) {
                            cb(err, success);
                        });
                    });
                });
        }

        let obj = {
            secret: captchaSecret,
            response: params.captcha
        };

        let url = operations.replace(thirdParty.APIs.captcha.host, obj);

        function failure() {
            let error = { success: false, message: "Unable to verify user. Please try again later" };
            res.status(400).send(error);
        }

        thirdParty.get(url, next, failure);
    };

    User.changePassword = function (params, req, res, cb) {

        let conditions = {
            where: {
                email: params.email
            }
        };

        let success = {
            success: true,
            message: "An email with instructions are sent to your mail. Please check."
        };

        User.find(conditions).then(
            function (user) {

                let passwordKey = operations.unique();
                let time = moment.tz().add('15', 'minutes').valueOf();
                let keys = {
                    username: user[0].firstName + " " + user[0].lastName,
                    link: 'https://' + req.hostname + '/#!/reset-password/' + passwordKey + '/' + time
                };

                let subject = email.templates.forgotPassword.subject;
                let body = operations.replace(email.templates.forgotPassword.body, keys);

                let where = { 'email': params.email };
                user[0].passwordKey = passwordKey;

                let update = { passwordKey: passwordKey };
                user[0].updateAttributes(update).then(function (result) {

                    email.send({
                        to: params.email,
                        subject: subject,
                        html: body
                    }, function (err) {
                        cb(err, success);
                    });
                });
            }
        );
    };

    User.reset = function (record, req, res, cb) {
        let success = {
            success: true,
            message: "Your password has been updated successfully."
        };

        let fail = {
            success: false,
            message: "Unable to update password at this time."
        };


        let validatePassword = function (plain) {
            var err = { "name": "Error", "success": false };
            if (plain && typeof plain === 'string' && plain.length <= MAX_PASSWORD_LENGTH) {
                return true;
            }
            if (plain.length > MAX_PASSWORD_LENGTH) {
                err.code = "PASSWORD_TOO_LONG";
                err.message = "Password too long. It should be less than 72 characters";

            } else {
                err.code = 'INVALID_PASSWORD';
                err.message = "Invalid password";

            }
            err.statusCode = 422;
            throw err;
        };


        if (!record.passwordKey || !record.password) {
            var error = {
                status: 422,
                message: "All fields are required"
            };
            return res.status(422).send(error);
        }
        try {
            validatePassword(record.password);
            let passwordKey = operations.unique();
            let where = { "where": { 'passwordKey': record.passwordKey } };
            User.find(where).then(function (user) {
                if (user.length == 0) {
                    var error = {
                        status: 400,
                        message: "Password reset link is invalid"
                    };
                    return res.status(400).send(error);
                }
                user[0].password = User.hashPassword(record.password);
                user[0].emailVerified = true;
                user[0].passwordKey = passwordKey;
                var where = {
                    where: {
                        id: user[0].id
                    }
                };
                User.upsert(user[0], where).then(function (data) {
                    return res.status(200).send(success);
                })
            })
        } catch (err) {

            if (err.code && err.statusCode) {
                return res.status(err.statusCode).send(err);
            } else {
                return res.status(400).send(fail);
            }
        }


    };

    // User.remoteMethod(
    //     'deleteUserRole',
    //     {
    //         isStatic: true,
    //         description: 'Delete all matching records',
    //         accessType: 'WRITE',
    //         http: {path: '/:id/rolesnew', verb: 'del'},
    //         accepts: [
    //             {
    //                 arg: 'id',
    //                 type: 'string'
    //             },
    //             {
    //                 arg: 'req',
    //                 type: 'object',
    //                 'http': {
    //                     source: 'req'
    //                 }
    //             },
    //             {
    //                 arg: 'res',
    //                 type: 'object',
    //                 'http': {
    //                     source: 'res'
    //                 }
    //             }
    //         ],
    //         returns: {
    //             arg: 'response',
    //             type: 'object',
    //             default: {
    //                 "success": true,
    //                 "message": "User successfully delete."
    //             }
    //         }
    //     });

    //     User.deleteUserRole = function (userId, req, res, cb) {
    //         console.log("deleteUserRole::::::>>>>>>>");
    //         console.log("userId", userId);
    //         let where = { "where": { 'id':  ObjectID(userId)} };
    //         User.find(where).then(function (user) {
    //             console.log("user", user);
    //             if (user.length == 0) {
    //                 return res.status(200).send({success: false});
    //             }
    //             User.destroyAll({ 'id':  ObjectID(userId)}, function(err, result){
    //                 if(err){
    //                    console.log(err);
    //                 }else{
    //                    console.log('Sucess', result); // {count:X} <- how much records deleted
    //                 }
    //                });
    //             return res.status(200).send({success: true});
    //         })

    //     }


    User.remoteMethod('isUserExist', {
        http: { path: '/isUserExist', verb: 'post' },
        accepts: [
            {
                arg: 'email',
                type: 'object',
                http: { source: 'body' }
            },
            {
                arg: 'req',
                type: 'object',
                http: { source: 'req' }
            },
            {
                arg: 'res',
                type: 'object',
                http: { source: 'res' }
            }
        ],
        returns: {
            arg: 'response',
            type: 'object',
            default: {
                success: true,
                message: "Invitation pending"
            }
        }
    });

    User.isUserExist = function (params, req, res, cb) {
    let emails = typeof params.email === 'string'
        ? params.email.split(',').map(e => e.trim()).filter(Boolean)
        : [];

    if (!emails.length) {
        return cb(null, { success: false, message: "No valid email provided" });
    }

    User.find({ where: { email: { inq: emails } } })
        .then(function (users) {
            if (!users.length) return failure("Email(s) not found");

            let hasInvitedOnly = true;

            for (const user of users) {
                // If any user is already created or not email verified, mark it
                if (user.created || !user.emailVerified) {
                    hasInvitedOnly = false;
                    break;
                }
            }

            if (hasInvitedOnly) {
                cb(null, { success: true, message: "Invitation pending" });
            } else {
                cb(null, { success: false, message: "Account already exists" });
            }
        })
        .catch(err => {
            console.error("Error in isUserExist:", err);
            failure("Server error");
        });

    function failure(msg) {
        cb(null, { success: false, message: msg });
    }
};


};