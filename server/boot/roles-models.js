module.exports = function (app) {

    //create the default roles
    let Role = app.models.Role;

    Role.disableRemoteMethodByName('__findById__principals', false);
    Role.disableRemoteMethodByName('__destroyById__principals', false);
    Role.disableRemoteMethodByName('__updateById__principals', false);
    Role.disableRemoteMethodByName('__get__principals', false);
    Role.disableRemoteMethodByName('__create__principals', false);
    Role.disableRemoteMethodByName('__delete__principals', false);
    Role.disableRemoteMethodByName('__count__principals', false);

    function createUniqueRole(roleName) {

        Role.find({where: {name: roleName}}, function (err, result) {

            if (err) throw (err);

            if (result.length === 1) {

                let RoleMapping = app.models.RoleMapping;

                var ObjectID = RoleMapping.getDataSource().connector.getDefaultIdType();

                // Because of this: https://github.com/strongloop/loopback-connector-mongodb/issues/128
                RoleMapping.defineProperty('principalId', {
                    type: ObjectID,
                });

                let role = result[0];
                let User = app.models.User;

                User.find({where: {"email": 'harsco@vensi.com'}})
                    .then(function (rows) {
                        if (rows.length === 0) {
                            return;
                        }

                        RoleMapping.find({where: {principalId: rows[0].id}}, function (err, result) {

                            if (result.length === 1) {
                                return;
                            }

                            role.principals.create({
                                principalType: RoleMapping.USER,
                                principalId: rows[0].id
                            }, function (err, principal) {
                                if (err) throw (err);

                                console.log('Created principal:', principal);
                            });
                        });
                    });

                return;
            }

            Role.create({name: roleName}, function (err, result) {

                if (err) {
                    console.error('createUniqueRole', JSON.stringify(err));
                    return;
                }

                // createUniqueRole(roleName);
            });
        });
    }

    //3 static roles based on their account type.
    //createUniqueRole('pkAdmin');
    //createUniqueRole('pkTech');
    //createUniqueRole('pkRep');

    //allow access to built-in RoleMapping model access to admin only.
    let ACL = app.models.ACL;

    function createUniqueACL(record) {
        ACL.find({where: {model: record.model, principalId: record.principalId, property: record.property}},
            function (err, result) {

                if (err) throw (err);

                if (result.length === 1) {
                    return;
                }

                ACL.create(record, function (err, result) {
                    if (err) {
                        console.error('createUniqueACL', JSON.stringify(err));
                        return;
                    }
                    // createUniqueACL(record);
                });
            }
        );
    }


    createUniqueACL(
        {
            principalType: ACL.ROLE,
            principalId: Role.EVERYONE,
            model: 'Role',
            accessType: ACL.ALL,
            property: ACL.ALL,
            permission: ACL.DENY
        }
    );


    createUniqueACL(
        {
            principalType: ACL.ROLE,
            principalId: 'pkAdmin',
            model: 'Role',
            accessType: ACL.ALL,
            property: ACL.ALL,
            permission: ACL.ALLOW
        }
    );

    createUniqueACL(
        {
            principalType: ACL.ROLE,
            principalId: 'pkTech',
            model: 'Role',
            accessType: ACL.ALL,
            property: ACL.ALL,
            permission: ACL.ALLOW
        }
    );

 
    createUniqueACL(
        {
            principalType: ACL.ROLE,
            principalId: Role.EVERYONE,
            model: 'RoleMapping',
            accessType: ACL.ALL,
            property: ACL.ALL,
            permission: ACL.DENY
        }
    );

    createUniqueACL(
        {
            principalType: ACL.ROLE,
            principalId: 'pkAdmin',
            model: 'RoleMapping',
            accessType: ACL.ALL,
            property: ACL.ALL,
            permission: ACL.ALLOW
        }
    );
    createUniqueACL(
        {
            principalType: ACL.ROLE,
            principalId: 'pkTech',
            model: 'RoleMapping',
            accessType: ACL.ALL,
            property: ACL.ALL,
            permission: ACL.ALLOW
        }
    );

    //3 dynamic roles based on site,
    //siteMember is catch all to check if user belongs to site
    Role.registerResolver('siteMember', function (role, context, cb) {

        //Q: is the user one of the admins, for now allow
        if (['pkAdmin', 'pkTech', 'pkRep'].indexOf(role.name) > -1) {
            return cb(null, true);
        }

        //for now allow everything
        return cb(null, true);
    });

    Role.registerResolver('siteManager', function (role, context, cb) {

        //Q: is the user one of the admins, for now allow
        if (['pkAdmin', 'pkTech', 'pkRep'].indexOf(role.name) > -1) {
            return cb(null, true);
        }

        //for now allow everything
        return cb(null, true);
    });

    Role.registerResolver('siteSupervisor', function (role, context, cb) {

        //Q: is the user one of the admins, for now allow
        if (['pkAdmin', 'pkTech', 'pkRep'].indexOf(role.name) > -1) {
            return cb(null, true);
        }

        //for now allow everything
        return cb(null, true);
    });

    Role.registerResolver('siteUser', function (role, context, cb) {

        //Q: is the user one of the admins, for now allow
        if (['pkAdmin', 'pkTech', 'pkRep'].indexOf(role.name) > -1) {
            return cb(null, true);
        }

        //for now allow everything
        return cb(null, true);
    });
};
