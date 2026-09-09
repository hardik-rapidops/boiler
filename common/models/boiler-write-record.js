'use strict';

module.exports = function(Boilerwriterecord) {

    Boilerwriterecord.disableRemoteMethodByName('__get__boiler', false);
    Boilerwriterecord.disableRemoteMethodByName('__get__user', false);
    Boilerwriterecord.disableRemoteMethodByName('__create__user', false);
    Boilerwriterecord.disableRemoteMethodByName('__update__user', false);
    Boilerwriterecord.disableRemoteMethodByName('__destroy__user', false);
};
