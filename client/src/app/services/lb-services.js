// CommonJS package manager support
if (typeof module !== 'undefined' && typeof exports !== 'undefined' &&
  module.exports === exports) {
  // Export the *name* of this Angular module
  // Sample usage:
  //
  //   import lbServices from './lb-services';
  //   angular.module('app', [lbServices]);
  //
  module.exports = "lbServices";
}

(function(window, angular, undefined) {
  'use strict';

  var urlBase = "/api";
  var authHeader = 'authorization';

  function getHost(url) {
    var m = url.match(/^(?:https?:)?\/\/([^\/]+)/);
    return m ? m[1] : null;
  }
  // need to use the urlBase as the base to handle multiple
  // loopback servers behind a proxy/gateway where the host
  // would be the same.
  var urlBaseHost = getHost(urlBase) ? urlBase : location.host;

/**
 * @ngdoc overview
 * @name lbServices
 * @module
 * @description
 *
 * The `lbServices` module provides services for interacting with
 * the models exposed by the LoopBack server via the REST API.
 *
 */
  var module = angular.module("lbServices", ['ngResource']);

/**
 * @ngdoc object
 * @name lbServices.RoleMapping
 * @header lbServices.RoleMapping
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `RoleMapping` model.
 *
 * **Details**
 *
 * Map principals to roles
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
  module.factory(
    "RoleMapping",
    [
      'LoopBackResource', 'LoopBackAuth', '$injector', '$q',
      function(LoopBackResource, LoopBackAuth, $injector, $q) {
        var R = LoopBackResource(
        urlBase + "/RoleMappings/:id",
          { 'id': '@id' },
          {

            // INTERNAL. Use RoleMapping.role() instead.
            "prototype$__get__role": {
              url: urlBase + "/RoleMappings/:id/role",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.RoleMapping#create
             * @methodOf lbServices.RoleMapping
             *
             * @description
             *
             * Create a new instance of the model and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `RoleMapping` object.)
             * </em>
             */
            "create": {
              url: urlBase + "/RoleMappings",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.RoleMapping#createMany
             * @methodOf lbServices.RoleMapping
             *
             * @description
             *
             * Create a new instance of the model and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `RoleMapping` object.)
             * </em>
             */
            "createMany": {
              isArray: true,
              url: urlBase + "/RoleMappings",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.RoleMapping#find
             * @methodOf lbServices.RoleMapping
             *
             * @description
             *
             * Find all instances of the model matched by filter from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"something":"value"})
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `RoleMapping` object.)
             * </em>
             */
            "find": {
              isArray: true,
              url: urlBase + "/RoleMappings",
              method: "GET",
            },

            // INTERNAL. Use Role.principals.findById() instead.
            "::findById::Role::principals": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Roles/:id/principals/:fk",
              method: "GET",
            },

            // INTERNAL. Use Role.principals.destroyById() instead.
            "::destroyById::Role::principals": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Roles/:id/principals/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Role.principals.updateById() instead.
            "::updateById::Role::principals": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Roles/:id/principals/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Role.principals() instead.
            "::get::Role::principals": {
              isArray: true,
              url: urlBase + "/Roles/:id/principals",
              method: "GET",
            },

            // INTERNAL. Use Role.principals.create() instead.
            "::create::Role::principals": {
              url: urlBase + "/Roles/:id/principals",
              method: "POST",
            },

            // INTERNAL. Use Role.principals.createMany() instead.
            "::createMany::Role::principals": {
              isArray: true,
              url: urlBase + "/Roles/:id/principals",
              method: "POST",
            },

            // INTERNAL. Use Role.principals.destroyAll() instead.
            "::delete::Role::principals": {
              url: urlBase + "/Roles/:id/principals",
              method: "DELETE",
            },

            // INTERNAL. Use Role.principals.count() instead.
            "::count::Role::principals": {
              url: urlBase + "/Roles/:id/principals/count",
              method: "GET",
            },
          }
        );




        /**
        * @ngdoc property
        * @name lbServices.RoleMapping#modelName
        * @propertyOf lbServices.RoleMapping
        * @description
        * The name of the model represented by this $resource,
        * i.e. `RoleMapping`.
        */
        R.modelName = "RoleMapping";


            /**
             * @ngdoc method
             * @name lbServices.RoleMapping#role
             * @methodOf lbServices.RoleMapping
             *
             * @description
             *
             * Fetches belongsTo relation role.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - RoleMapping id
             *
             *  - `options` – `{object=}` -
             *
             *  - `refresh` – `{boolean=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Role` object.)
             * </em>
             */
        R.role = function() {
          var TargetResource = $injector.get("Role");
          var action = TargetResource["::get::RoleMapping::role"];
          return action.apply(R, arguments);
        };


        return R;
      }]);

/**
 * @ngdoc object
 * @name lbServices.Role
 * @header lbServices.Role
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `Role` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
  module.factory(
    "Role",
    [
      'LoopBackResource', 'LoopBackAuth', '$injector', '$q',
      function(LoopBackResource, LoopBackAuth, $injector, $q) {
        var R = LoopBackResource(
        urlBase + "/Roles/:id",
          { 'id': '@id' },
          {

            // INTERNAL. Use Role.principals.findById() instead.
            "prototype$__findById__principals": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Roles/:id/principals/:fk",
              method: "GET",
            },

            // INTERNAL. Use Role.principals.destroyById() instead.
            "prototype$__destroyById__principals": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Roles/:id/principals/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Role.principals.updateById() instead.
            "prototype$__updateById__principals": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Roles/:id/principals/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Role.principals() instead.
            "prototype$__get__principals": {
              isArray: true,
              url: urlBase + "/Roles/:id/principals",
              method: "GET",
            },

            // INTERNAL. Use Role.principals.create() instead.
            "prototype$__create__principals": {
              url: urlBase + "/Roles/:id/principals",
              method: "POST",
            },

            // INTERNAL. Use Role.principals.destroyAll() instead.
            "prototype$__delete__principals": {
              url: urlBase + "/Roles/:id/principals",
              method: "DELETE",
            },

            // INTERNAL. Use Role.principals.count() instead.
            "prototype$__count__principals": {
              url: urlBase + "/Roles/:id/principals/count",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Role#find
             * @methodOf lbServices.Role
             *
             * @description
             *
             * Find all instances of the model matched by filter from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"something":"value"})
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Role` object.)
             * </em>
             */
            "find": {
              isArray: true,
              url: urlBase + "/Roles",
              method: "GET",
            },

            // INTERNAL. Use RoleMapping.role() instead.
            "::get::RoleMapping::role": {
              url: urlBase + "/RoleMappings/:id/role",
              method: "GET",
            },

            // INTERNAL. Use User.roles.findById() instead.
            "::findById::User::roles": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/roles/:fk",
              method: "GET",
            },

            // INTERNAL. Use User.roles.destroyById() instead.
            "::destroyById::User::roles": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/roles/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use User.roles.updateById() instead.
            "::updateById::User::roles": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/roles/:fk",
              method: "PUT",
            },

            // INTERNAL. Use User.roles.link() instead.
            "::link::User::roles": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/roles/rel/:fk",
              method: "PUT",
            },

            // INTERNAL. Use User.roles.unlink() instead.
            "::unlink::User::roles": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/roles/rel/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use User.roles.exists() instead.
            "::exists::User::roles": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/roles/rel/:fk",
              method: "HEAD",
            },

            // INTERNAL. Use User.roles() instead.
            "::get::User::roles": {
              isArray: true,
              url: urlBase + "/users/:id/roles",
              method: "GET",
            },

            // INTERNAL. Use User.roles.create() instead.
            "::create::User::roles": {
              url: urlBase + "/users/:id/roles",
              method: "POST",
            },

            // INTERNAL. Use User.roles.createMany() instead.
            "::createMany::User::roles": {
              isArray: true,
              url: urlBase + "/users/:id/roles",
              method: "POST",
            },

            // INTERNAL. Use User.roles.destroyAll() instead.
            "::delete::User::roles": {
              url: urlBase + "/users/:id/roles",
              method: "DELETE",
            },

            // INTERNAL. Use User.roles.count() instead.
            "::count::User::roles": {
              url: urlBase + "/users/:id/roles/count",
              method: "GET",
            },

            "prototype$deleteUserRole": {
              url: urlBase + "/users/:id/rolesnew",
              method: "DELETE",
            },
          }
        );




        /**
        * @ngdoc property
        * @name lbServices.Role#modelName
        * @propertyOf lbServices.Role
        * @description
        * The name of the model represented by this $resource,
        * i.e. `Role`.
        */
        R.modelName = "Role";

    /**
     * @ngdoc object
     * @name lbServices.Role.principals
     * @header lbServices.Role.principals
     * @object
     * @description
     *
     * The object `Role.principals` groups methods
     * manipulating `RoleMapping` instances related to `Role`.
     *
     * Call {@link lbServices.Role#principals Role.principals()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.Role#principals
             * @methodOf lbServices.Role
             *
             * @description
             *
             * Queries principals of Role.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Role id
             *
             *  - `options` – `{object=}` -
             *
             *  - `filter` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `RoleMapping` object.)
             * </em>
             */
        R.principals = function() {
          var TargetResource = $injector.get("RoleMapping");
          var action = TargetResource["::get::Role::principals"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Role.principals#count
             * @methodOf lbServices.Role.principals
             *
             * @description
             *
             * Counts principals of Role.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Role id
             *
             *  - `options` – `{object=}` -
             *
             *  - `where` – `{object=}` - Criteria to match model instances
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `count` – `{number=}` -
             */
        R.principals.count = function() {
          var TargetResource = $injector.get("RoleMapping");
          var action = TargetResource["::count::Role::principals"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Role.principals#create
             * @methodOf lbServices.Role.principals
             *
             * @description
             *
             * Creates a new instance in principals of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Role id
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `data` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `RoleMapping` object.)
             * </em>
             */
        R.principals.create = function() {
          var TargetResource = $injector.get("RoleMapping");
          var action = TargetResource["::create::Role::principals"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Role.principals#createMany
             * @methodOf lbServices.Role.principals
             *
             * @description
             *
             * Creates a new instance in principals of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Role id
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `data` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `RoleMapping` object.)
             * </em>
             */
        R.principals.createMany = function() {
          var TargetResource = $injector.get("RoleMapping");
          var action = TargetResource["::createMany::Role::principals"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Role.principals#destroyAll
             * @methodOf lbServices.Role.principals
             *
             * @description
             *
             * Deletes all principals of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Role id
             *
             *  - `options` – `{object=}` -
             *
             *  - `where` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * This method returns no data.
             */
        R.principals.destroyAll = function() {
          var TargetResource = $injector.get("RoleMapping");
          var action = TargetResource["::delete::Role::principals"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Role.principals#destroyById
             * @methodOf lbServices.Role.principals
             *
             * @description
             *
             * Delete a related item by id for principals.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Role id
             *
             *  - `options` – `{object=}` -
             *
             *  - `fk` – `{*}` - Foreign key for principals
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * This method returns no data.
             */
        R.principals.destroyById = function() {
          var TargetResource = $injector.get("RoleMapping");
          var action = TargetResource["::destroyById::Role::principals"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Role.principals#findById
             * @methodOf lbServices.Role.principals
             *
             * @description
             *
             * Find a related item by id for principals.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Role id
             *
             *  - `options` – `{object=}` -
             *
             *  - `fk` – `{*}` - Foreign key for principals
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `RoleMapping` object.)
             * </em>
             */
        R.principals.findById = function() {
          var TargetResource = $injector.get("RoleMapping");
          var action = TargetResource["::findById::Role::principals"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Role.principals#updateById
             * @methodOf lbServices.Role.principals
             *
             * @description
             *
             * Update a related item by id for principals.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Role id
             *
             *  - `fk` – `{*}` - Foreign key for principals
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `data` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `RoleMapping` object.)
             * </em>
             */
        R.principals.updateById = function() {
          var TargetResource = $injector.get("RoleMapping");
          var action = TargetResource["::updateById::Role::principals"];
          return action.apply(R, arguments);
        };


        return R;
      }]);

/**
 * @ngdoc object
 * @name lbServices.Site
 * @header lbServices.Site
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `Site` model.
 *
 * **Details**
 *
 * Manages Site info and related data.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
  module.factory(
    "Site",
    [
      'LoopBackResource', 'LoopBackAuth', '$injector', '$q',
      function(LoopBackResource, LoopBackAuth, $injector, $q) {
        var R = LoopBackResource(
        urlBase + "/Sites/:id",
          { 'id': '@id' },
          {

            // INTERNAL. Use Site.boilers.findById() instead.
            "prototype$__findById__boilers": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Sites/:id/boilers/:fk",
              method: "GET",
            },

            // INTERNAL. Use Site.boilers.destroyById() instead.
            "prototype$__destroyById__boilers": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Sites/:id/boilers/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Site.boilers.updateById() instead.
            "prototype$__updateById__boilers": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Sites/:id/boilers/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Site.site() instead.
            "prototype$__get__site": {
              url: urlBase + "/Sites/:id/site",
              method: "GET",
            },

            // INTERNAL. Use Site.users.findById() instead.
            "prototype$__findById__users": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Sites/:id/users/:fk",
              method: "GET",
            },

            // INTERNAL. Use Site.users.destroyById() instead.
            "prototype$__destroyById__users": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Sites/:id/users/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Site.users.updateById() instead.
            "prototype$__updateById__users": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Sites/:id/users/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Site.users.link() instead.
            "prototype$__link__users": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Sites/:id/users/rel/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Site.users.unlink() instead.
            "prototype$__unlink__users": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Sites/:id/users/rel/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Site.users.exists() instead.
            "prototype$__exists__users": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Sites/:id/users/rel/:fk",
              method: "HEAD",
            },

            // INTERNAL. Use Site.boilers() instead.
            "prototype$__get__boilers": {
              isArray: true,
              url: urlBase + "/Sites/:id/boilers",
              method: "GET",
            },

            // INTERNAL. Use Site.boilers.create() instead.
            "prototype$__create__boilers": {
              url: urlBase + "/Sites/:id/boilers",
              method: "POST",
            },

            // INTERNAL. Use Site.boilers.destroyAll() instead.
            "prototype$__delete__boilers": {
              url: urlBase + "/Sites/:id/boilers",
              method: "DELETE",
            },

            // INTERNAL. Use Site.boilers.count() instead.
            "prototype$__count__boilers": {
              url: urlBase + "/Sites/:id/boilers/count",
              method: "GET",
            },

            // INTERNAL. Use Site.users() instead.
            "prototype$__get__users": {
              isArray: true,
              url: urlBase + "/Sites/:id/users",
              method: "GET",
            },

            // INTERNAL. Use Site.users.create() instead.
            "prototype$__create__users": {
              url: urlBase + "/Sites/:id/users",
              method: "POST",
            },

            // INTERNAL. Use Site.users.destroyAll() instead.
            "prototype$__delete__users": {
              url: urlBase + "/Sites/:id/users",
              method: "DELETE",
            },

            // INTERNAL. Use Site.users.count() instead.
            "prototype$__count__users": {
              url: urlBase + "/Sites/:id/users/count",
              method: "GET",
            },


            // GET SITES
            "getSitesData": {
              isArray: true,
              url: urlBase + "/Sites/:id/getSites",
              method: "GET",
            },


            /**
             * @ngdoc method
             * @name lbServices.Site#upsertWithWhere
             * @methodOf lbServices.Site
             *
             * @description
             *
             * Update an existing model instance or insert a new one into the data source based on the where criteria.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `where` – `{object=}` - Criteria to match model instances
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - An object of model property name/value pairs
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Site` object.)
             * </em>
             */
            "upsertWithWhere": {
              url: urlBase + "/Sites/upsertWithWhere",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.Site#find
             * @methodOf lbServices.Site
             *
             * @description
             *
             * Find all instances of the model matched by filter from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"something":"value"})
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Site` object.)
             * </em>
             */
            "find": {
              isArray: true,
              url: urlBase + "/Sites",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Site#deleteById
             * @methodOf lbServices.Site
             *
             * @description
             *
             * Delete a model instance by {{id}} from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Model id
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Site` object.)
             * </em>
             */
            "deleteById": {
              url: urlBase + "/Sites/:id",
              method: "DELETE",
            },

            // INTERNAL. Use Boiler.site() instead.
            "::get::Boiler::site": {
              url: urlBase + "/Boilers/:id/site",
              method: "GET",
            },

            // INTERNAL. Use User.sites.findById() instead.
            "::findById::User::sites": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/sites/:fk",
              method: "GET",
            },

            // INTERNAL. Use User.sites.destroyById() instead.
            "::destroyById::User::sites": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/sites/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use User.sites.updateById() instead.
            "::updateById::User::sites": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/sites/:fk",
              method: "PUT",
            },

            // INTERNAL. Use User.sites.link() instead.
            "::link::User::sites": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/sites/rel/:fk",
              method: "PUT",
            },

            // INTERNAL. Use User.sites.unlink() instead.
            "::unlink::User::sites": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/sites/rel/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use User.sites.exists() instead.
            "::exists::User::sites": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/sites/rel/:fk",
              method: "HEAD",
            },

            // INTERNAL. Use User.sites() instead.
            "::get::User::sites": {
              isArray: true,
              url: urlBase + "/users/:id/sites",
              method: "GET",
            },

            // INTERNAL. Use User.sites.create() instead.
            "::create::User::sites": {
              url: urlBase + "/users/:id/sites",
              method: "POST",
            },

            // INTERNAL. Use User.sites.createMany() instead.
            "::createMany::User::sites": {
              isArray: true,
              url: urlBase + "/users/:id/sites",
              method: "POST",
            },

            // INTERNAL. Use User.sites.destroyAll() instead.
            "::delete::User::sites": {
              url: urlBase + "/users/:id/sites",
              method: "DELETE",
            },

            // INTERNAL. Use User.sites.count() instead.
            "::count::User::sites": {
              url: urlBase + "/users/:id/sites/count",
              method: "GET",
            },

            // INTERNAL. Use UserToSite.site() instead.
            "::get::UserToSite::site": {
              url: urlBase + "/UserToSites/:id/site",
              method: "GET",
            },
          }
        );



            /**
             * @ngdoc method
             * @name lbServices.Site#patchOrCreateWithWhere
             * @methodOf lbServices.Site
             *
             * @description
             *
             * Update an existing model instance or insert a new one into the data source based on the where criteria.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `where` – `{object=}` - Criteria to match model instances
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - An object of model property name/value pairs
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Site` object.)
             * </em>
             */
        R["patchOrCreateWithWhere"] = R["upsertWithWhere"];

            /**
             * @ngdoc method
             * @name lbServices.Site#destroyById
             * @methodOf lbServices.Site
             *
             * @description
             *
             * Delete a model instance by {{id}} from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Model id
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Site` object.)
             * </em>
             */
        R["destroyById"] = R["deleteById"];

            /**
             * @ngdoc method
             * @name lbServices.Site#removeById
             * @methodOf lbServices.Site
             *
             * @description
             *
             * Delete a model instance by {{id}} from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Model id
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Site` object.)
             * </em>
             */
        R["removeById"] = R["deleteById"];


        /**
        * @ngdoc property
        * @name lbServices.Site#modelName
        * @propertyOf lbServices.Site
        * @description
        * The name of the model represented by this $resource,
        * i.e. `Site`.
        */
        R.modelName = "Site";

    /**
     * @ngdoc object
     * @name lbServices.Site.boilers
     * @header lbServices.Site.boilers
     * @object
     * @description
     *
     * The object `Site.boilers` groups methods
     * manipulating `Boiler` instances related to `Site`.
     *
     * Call {@link lbServices.Site#boilers Site.boilers()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.Site#boilers
             * @methodOf lbServices.Site
             *
             * @description
             *
             * Queries boilers of Site.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Site id
             *
             *  - `options` – `{object=}` -
             *
             *  - `filter` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Boiler` object.)
             * </em>
             */
        R.boilers = function() {
          var TargetResource = $injector.get("Boiler");
          var action = TargetResource["::get::Site::boilers"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Site.boilers#count
             * @methodOf lbServices.Site.boilers
             *
             * @description
             *
             * Counts boilers of Site.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Site id
             *
             *  - `options` – `{object=}` -
             *
             *  - `where` – `{object=}` - Criteria to match model instances
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `count` – `{number=}` -
             */
        R.boilers.count = function() {
          var TargetResource = $injector.get("Boiler");
          var action = TargetResource["::count::Site::boilers"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Site.boilers#create
             * @methodOf lbServices.Site.boilers
             *
             * @description
             *
             * Creates a new instance in boilers of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Site id
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `data` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Boiler` object.)
             * </em>
             */
        R.boilers.create = function() {
          var TargetResource = $injector.get("Boiler");
          var action = TargetResource["::create::Site::boilers"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Site.boilers#createMany
             * @methodOf lbServices.Site.boilers
             *
             * @description
             *
             * Creates a new instance in boilers of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Site id
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `data` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Boiler` object.)
             * </em>
             */
        R.boilers.createMany = function() {
          var TargetResource = $injector.get("Boiler");
          var action = TargetResource["::createMany::Site::boilers"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Site.boilers#destroyAll
             * @methodOf lbServices.Site.boilers
             *
             * @description
             *
             * Deletes all boilers of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Site id
             *
             *  - `options` – `{object=}` -
             *
             *  - `where` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * This method returns no data.
             */
        R.boilers.destroyAll = function() {
          var TargetResource = $injector.get("Boiler");
          var action = TargetResource["::delete::Site::boilers"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Site.boilers#destroyById
             * @methodOf lbServices.Site.boilers
             *
             * @description
             *
             * Delete a related item by id for boilers.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Site id
             *
             *  - `options` – `{object=}` -
             *
             *  - `fk` – `{*}` - Foreign key for boilers
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * This method returns no data.
             */
        R.boilers.destroyById = function() {
          var TargetResource = $injector.get("Boiler");
          var action = TargetResource["::destroyById::Site::boilers"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Site.boilers#findById
             * @methodOf lbServices.Site.boilers
             *
             * @description
             *
             * Find a related item by id for boilers.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Site id
             *
             *  - `options` – `{object=}` -
             *
             *  - `fk` – `{*}` - Foreign key for boilers
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Boiler` object.)
             * </em>
             */
        R.boilers.findById = function() {
          var TargetResource = $injector.get("Boiler");
          var action = TargetResource["::findById::Site::boilers"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Site.boilers#updateById
             * @methodOf lbServices.Site.boilers
             *
             * @description
             *
             * Update a related item by id for boilers.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Site id
             *
             *  - `fk` – `{*}` - Foreign key for boilers
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `data` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Boiler` object.)
             * </em>
             */
        R.boilers.updateById = function() {
          var TargetResource = $injector.get("Boiler");
          var action = TargetResource["::updateById::Site::boilers"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Site#site
             * @methodOf lbServices.Site
             *
             * @description
             *
             * Fetches belongsTo relation site.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Site id
             *
             *  - `options` – `{object=}` -
             *
             *  - `refresh` – `{boolean=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
        R.site = function() {
          var TargetResource = $injector.get("User");
          var action = TargetResource["::get::Site::site"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.Site.users
     * @header lbServices.Site.users
     * @object
     * @description
     *
     * The object `Site.users` groups methods
     * manipulating `User` instances related to `Site`.
     *
     * Call {@link lbServices.Site#users Site.users()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.Site#users
             * @methodOf lbServices.Site
             *
             * @description
             *
             * Queries users of Site.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Site id
             *
             *  - `options` – `{object=}` -
             *
             *  - `filter` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
        R.users = function() {
          var TargetResource = $injector.get("User");
          var action = TargetResource["::get::Site::users"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Site.users#count
             * @methodOf lbServices.Site.users
             *
             * @description
             *
             * Counts users of Site.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Site id
             *
             *  - `options` – `{object=}` -
             *
             *  - `where` – `{object=}` - Criteria to match model instances
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `count` – `{number=}` -
             */
        R.users.count = function() {
          var TargetResource = $injector.get("User");
          var action = TargetResource["::count::Site::users"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Site.users#create
             * @methodOf lbServices.Site.users
             *
             * @description
             *
             * Creates a new instance in users of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Site id
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `data` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
        R.users.create = function() {
          var TargetResource = $injector.get("User");
          var action = TargetResource["::create::Site::users"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Site.users#createMany
             * @methodOf lbServices.Site.users
             *
             * @description
             *
             * Creates a new instance in users of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Site id
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `data` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
        R.users.createMany = function() {
          var TargetResource = $injector.get("User");
          var action = TargetResource["::createMany::Site::users"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Site.users#destroyAll
             * @methodOf lbServices.Site.users
             *
             * @description
             *
             * Deletes all users of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Site id
             *
             *  - `options` – `{object=}` -
             *
             *  - `where` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * This method returns no data.
             */
        R.users.destroyAll = function() {
          var TargetResource = $injector.get("User");
          var action = TargetResource["::delete::Site::users"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Site.users#destroyById
             * @methodOf lbServices.Site.users
             *
             * @description
             *
             * Delete a related item by id for users.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Site id
             *
             *  - `options` – `{object=}` -
             *
             *  - `fk` – `{*}` - Foreign key for users
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * This method returns no data.
             */
        R.users.destroyById = function() {
          var TargetResource = $injector.get("User");
          var action = TargetResource["::destroyById::Site::users"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Site.users#exists
             * @methodOf lbServices.Site.users
             *
             * @description
             *
             * Check the existence of users relation to an item by id.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Site id
             *
             *  - `options` – `{object=}` -
             *
             *  - `fk` – `{*}` - Foreign key for users
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
        R.users.exists = function() {
          var TargetResource = $injector.get("User");
          var action = TargetResource["::exists::Site::users"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Site.users#findById
             * @methodOf lbServices.Site.users
             *
             * @description
             *
             * Find a related item by id for users.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Site id
             *
             *  - `options` – `{object=}` -
             *
             *  - `fk` – `{*}` - Foreign key for users
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
        R.users.findById = function() {
          var TargetResource = $injector.get("User");
          var action = TargetResource["::findById::Site::users"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Site.users#link
             * @methodOf lbServices.Site.users
             *
             * @description
             *
             * Add a related item by id for users.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Site id
             *
             *  - `fk` – `{*}` - Foreign key for users
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `data` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
        R.users.link = function() {
          var TargetResource = $injector.get("User");
          var action = TargetResource["::link::Site::users"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Site.users#unlink
             * @methodOf lbServices.Site.users
             *
             * @description
             *
             * Remove the users relation to an item by id.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Site id
             *
             *  - `options` – `{object=}` -
             *
             *  - `fk` – `{*}` - Foreign key for users
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * This method returns no data.
             */
        R.users.unlink = function() {
          var TargetResource = $injector.get("User");
          var action = TargetResource["::unlink::Site::users"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Site.users#updateById
             * @methodOf lbServices.Site.users
             *
             * @description
             *
             * Update a related item by id for users.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Site id
             *
             *  - `fk` – `{*}` - Foreign key for users
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `data` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
        R.users.updateById = function() {
          var TargetResource = $injector.get("User");
          var action = TargetResource["::updateById::Site::users"];
          return action.apply(R, arguments);
        };


        return R;
      }]);

/**
 * @ngdoc object
 * @name lbServices.Boiler
 * @header lbServices.Boiler
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `Boiler` model.
 *
 * **Details**
 *
 * Manages Boiler info and related data.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
  module.factory(
    "Boiler",
    [
      'LoopBackResource', 'LoopBackAuth', '$injector', '$q',
      function(LoopBackResource, LoopBackAuth, $injector, $q) {
        var R = LoopBackResource(
        urlBase + "/Boilers/:id",
          { 'id': '@id' },
          {

            // INTERNAL. Use Boiler.site() instead.
            "prototype$__get__site": {
              url: urlBase + "/Boilers/:id/site",
              method: "GET",
            },

            // INTERNAL. Use Boiler.boilerRecords.findById() instead.
            "prototype$__findById__boilerRecords": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Boilers/:id/boilerRecords/:fk",
              method: "GET",
            },

            // INTERNAL. Use Boiler.boilerRecords.destroyById() instead.
            "prototype$__destroyById__boilerRecords": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Boilers/:id/boilerRecords/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Boiler.boilerRecords.updateById() instead.
            "prototype$__updateById__boilerRecords": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Boilers/:id/boilerRecords/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Boiler.boilerRecords() instead.
            "prototype$__get__boilerRecords": {
              isArray: true,
              url: urlBase + "/Boilers/:id/boilerRecords",
              method: "GET",
            },

            // INTERNAL. Use Boiler.boilerRecords.create() instead.
            "prototype$__create__boilerRecords": {
              url: urlBase + "/Boilers/:id/boilerRecords",
              method: "POST",
            },

            // INTERNAL. Use Boiler.boilerRecords.destroyAll() instead.
            "prototype$__delete__boilerRecords": {
              url: urlBase + "/Boilers/:id/boilerRecords",
              method: "DELETE",
            },

            // INTERNAL. Use Boiler.boilerRecords.count() instead.
            "prototype$__count__boilerRecords": {
              url: urlBase + "/Boilers/:id/boilerRecords/count",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Boiler#replaceOrCreate
             * @methodOf lbServices.Boiler
             *
             * @description
             *
             * Replace an existing model instance or insert a new one into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Boiler` object.)
             * </em>
             */
            "replaceOrCreate": {
              url: urlBase + "/Boilers/replaceOrCreate",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.Boiler#upsertWithWhere
             * @methodOf lbServices.Boiler
             *
             * @description
             *
             * Update an existing model instance or insert a new one into the data source based on the where criteria.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `where` – `{object=}` - Criteria to match model instances
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - An object of model property name/value pairs
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Boiler` object.)
             * </em>
             */
            "upsertWithWhere": {
              url: urlBase + "/Boilers/upsertWithWhere",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.Boiler#findById
             * @methodOf lbServices.Boiler
             *
             * @description
             *
             * Find a model instance by {{id}} from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Model id
             *
             *  - `filter` – `{object=}` - Filter defining fields and include - must be a JSON-encoded string ({"something":"value"})
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Boiler` object.)
             * </em>
             */
            "findById": {
              url: urlBase + "/Boilers/:id",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Boiler#deleteById
             * @methodOf lbServices.Boiler
             *
             * @description
             *
             * Delete a model instance by {{id}} from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Model id
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Boiler` object.)
             * </em>
             */
            "deleteById": {
              url: urlBase + "/Boilers/:id",
              method: "DELETE",
            },

            /**
             * @ngdoc method
             * @name lbServices.Boiler#newBoiler
             * @methodOf lbServices.Boiler
             *
             * @description
             *
             * <em>
             * (The remote method definition does not provide any description.)
             * </em>
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `signature` – `{string=}` -
             *
             *  - `boiler` – `{object=}` -
             *
             *  - `req` – `{object=}` -
             *
             *  - `res` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `response` – `{string=}` -
             */
            "newBoiler": {
              url: urlBase + "/Boilers/newBoiler",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.Boiler#exist
             * @methodOf lbServices.Boiler
             *
             * @description
             *
             * <em>
             * (The remote method definition does not provide any description.)
             * </em>
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `signUpCode` – `{string=}` -
             *
             *  - `req` – `{object=}` -
             *
             *  - `res` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `response` – `{object=}` -
             */
            "exist": {
              url: urlBase + "/Boilers/:signUpCode/boiler",
              method: "GET",
            },



            /**
             * @ngdoc method
             * @name lbServices.Boiler#findUpdate
             * @methodOf lbServices.Boiler
             *
             * @description
             *
             * <em>
             * (The remote method definition does not provide any description.)
             * </em>
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `signUpCode` – `{string=}` -
             *  - `boilerID` – `{string=}` -
             *
             *  - `req` – `{object=}` -
             *
             *  - `res` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `response` – `{object=}` -
             */
            "findUpdate": {
              url: urlBase + "/Boilers/:signUpCode/:boilerID/boiler",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Boiler#records
             * @methodOf lbServices.Boiler
             *
             * @description
             *
             * Use this method to fetch the records by filter.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `boilerId` – `{string=}` -
             *
             *  - `filter` – `{object=}` -
             *
             *  - `req` – `{object=}` -
             *
             *  - `res` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Boiler` object.)
             * </em>
             */
            "records": {
              isArray: true,
              url: urlBase + "/Boilers/:boilerId/records",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.Boiler#fuelUsage
             * @methodOf lbServices.Boiler
             *
             * @description
             *
             * Use this method to fetch the records by filter.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `boilerId` – `{string=}` -
             *
             *  - `filter` – `{object=}` -
             *
             *  - `req` – `{object=}` -
             *
             *  - `res` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Boiler` object.)
             * </em>
             */
            "fuelUsage": {
              isArray: true,
              url: urlBase + "/Boilers/:boilerId/fuelUsage",
              method: "GET",
            },

            // INTERNAL. Use Site.boilers.findById() instead.
            "::findById::Site::boilers": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Sites/:id/boilers/:fk",
              method: "GET",
            },

            // INTERNAL. Use Site.boilers.destroyById() instead.
            "::destroyById::Site::boilers": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Sites/:id/boilers/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Site.boilers.updateById() instead.
            "::updateById::Site::boilers": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Sites/:id/boilers/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Site.boilers() instead.
            "::get::Site::boilers": {
              isArray: true,
              url: urlBase + "/Sites/:id/boilers",
              method: "GET",
            },

            // INTERNAL. Use Site.boilers.create() instead.
            "::create::Site::boilers": {
              url: urlBase + "/Sites/:id/boilers",
              method: "POST",
            },

            // INTERNAL. Use Site.boilers.createMany() instead.
            "::createMany::Site::boilers": {
              isArray: true,
              url: urlBase + "/Sites/:id/boilers",
              method: "POST",
            },

            // INTERNAL. Use Site.boilers.destroyAll() instead.
            "::delete::Site::boilers": {
              url: urlBase + "/Sites/:id/boilers",
              method: "DELETE",
            },

            // INTERNAL. Use Site.boilers.count() instead.
            "::count::Site::boilers": {
              url: urlBase + "/Sites/:id/boilers/count",
              method: "GET",
            },

            // INTERNAL. Use BoilerFile.boiler() instead.
            "::get::BoilerFile::boiler": {
              url: urlBase + "/BoilerFiles/:id/boiler",
              method: "GET",
            },

            // INTERNAL. Use BoilerReadRecord.boiler() instead.
            "::get::BoilerReadRecord::boiler": {
              url: urlBase + "/BoilerReadRecords/:id/boiler",
              method: "GET",
            },

            // INTERNAL. Use BoilerWriteRecord.boiler() instead.
            "::get::BoilerWriteRecord::boiler": {
              url: urlBase + "/BoilerWriteRecords/:id/boiler",
              method: "GET",
            },

            // INTERNAL. Use BoilerNotification.boiler() instead.
            "::get::BoilerNotification::boiler": {
              url: urlBase + "/BoilerNotifications/:id/boiler",
              method: "GET",
            },
          }
        );



            /**
             * @ngdoc method
             * @name lbServices.Boiler#patchOrCreateWithWhere
             * @methodOf lbServices.Boiler
             *
             * @description
             *
             * Update an existing model instance or insert a new one into the data source based on the where criteria.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `where` – `{object=}` - Criteria to match model instances
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - An object of model property name/value pairs
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Boiler` object.)
             * </em>
             */
        R["patchOrCreateWithWhere"] = R["upsertWithWhere"];

            /**
             * @ngdoc method
             * @name lbServices.Boiler#destroyById
             * @methodOf lbServices.Boiler
             *
             * @description
             *
             * Delete a model instance by {{id}} from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Model id
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Boiler` object.)
             * </em>
             */
        R["destroyById"] = R["deleteById"];

            /**
             * @ngdoc method
             * @name lbServices.Boiler#removeById
             * @methodOf lbServices.Boiler
             *
             * @description
             *
             * Delete a model instance by {{id}} from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Model id
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Boiler` object.)
             * </em>
             */
        R["removeById"] = R["deleteById"];


        /**
        * @ngdoc property
        * @name lbServices.Boiler#modelName
        * @propertyOf lbServices.Boiler
        * @description
        * The name of the model represented by this $resource,
        * i.e. `Boiler`.
        */
        R.modelName = "Boiler";


            /**
             * @ngdoc method
             * @name lbServices.Boiler#site
             * @methodOf lbServices.Boiler
             *
             * @description
             *
             * Fetches belongsTo relation site.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Boiler id
             *
             *  - `options` – `{object=}` -
             *
             *  - `refresh` – `{boolean=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Site` object.)
             * </em>
             */
        R.site = function() {
          var TargetResource = $injector.get("Site");
          var action = TargetResource["::get::Boiler::site"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.Boiler.boilerRecords
     * @header lbServices.Boiler.boilerRecords
     * @object
     * @description
     *
     * The object `Boiler.boilerRecords` groups methods
     * manipulating `BoilerReadRecord` instances related to `Boiler`.
     *
     * Call {@link lbServices.Boiler#boilerRecords Boiler.boilerRecords()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.Boiler#boilerRecords
             * @methodOf lbServices.Boiler
             *
             * @description
             *
             * Queries boilerRecords of Boiler.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Boiler id
             *
             *  - `options` – `{object=}` -
             *
             *  - `filter` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerReadRecord` object.)
             * </em>
             */
        R.boilerRecords = function() {
          var TargetResource = $injector.get("BoilerReadRecord");
          var action = TargetResource["::get::Boiler::boilerRecords"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Boiler.boilerRecords#count
             * @methodOf lbServices.Boiler.boilerRecords
             *
             * @description
             *
             * Counts boilerRecords of Boiler.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Boiler id
             *
             *  - `options` – `{object=}` -
             *
             *  - `where` – `{object=}` - Criteria to match model instances
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `count` – `{number=}` -
             */
        R.boilerRecords.count = function() {
          var TargetResource = $injector.get("BoilerReadRecord");
          var action = TargetResource["::count::Boiler::boilerRecords"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Boiler.boilerRecords#create
             * @methodOf lbServices.Boiler.boilerRecords
             *
             * @description
             *
             * Creates a new instance in boilerRecords of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Boiler id
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `data` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerReadRecord` object.)
             * </em>
             */
        R.boilerRecords.create = function() {
          var TargetResource = $injector.get("BoilerReadRecord");
          var action = TargetResource["::create::Boiler::boilerRecords"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Boiler.boilerRecords#createMany
             * @methodOf lbServices.Boiler.boilerRecords
             *
             * @description
             *
             * Creates a new instance in boilerRecords of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Boiler id
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `data` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerReadRecord` object.)
             * </em>
             */
        R.boilerRecords.createMany = function() {
          var TargetResource = $injector.get("BoilerReadRecord");
          var action = TargetResource["::createMany::Boiler::boilerRecords"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Boiler.boilerRecords#destroyAll
             * @methodOf lbServices.Boiler.boilerRecords
             *
             * @description
             *
             * Deletes all boilerRecords of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Boiler id
             *
             *  - `options` – `{object=}` -
             *
             *  - `where` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * This method returns no data.
             */
        R.boilerRecords.destroyAll = function() {
          var TargetResource = $injector.get("BoilerReadRecord");
          var action = TargetResource["::delete::Boiler::boilerRecords"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Boiler.boilerRecords#destroyById
             * @methodOf lbServices.Boiler.boilerRecords
             *
             * @description
             *
             * Delete a related item by id for boilerRecords.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Boiler id
             *
             *  - `options` – `{object=}` -
             *
             *  - `fk` – `{*}` - Foreign key for boilerRecords
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * This method returns no data.
             */
        R.boilerRecords.destroyById = function() {
          var TargetResource = $injector.get("BoilerReadRecord");
          var action = TargetResource["::destroyById::Boiler::boilerRecords"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Boiler.boilerRecords#findById
             * @methodOf lbServices.Boiler.boilerRecords
             *
             * @description
             *
             * Find a related item by id for boilerRecords.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Boiler id
             *
             *  - `options` – `{object=}` -
             *
             *  - `fk` – `{*}` - Foreign key for boilerRecords
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerReadRecord` object.)
             * </em>
             */
        R.boilerRecords.findById = function() {
          var TargetResource = $injector.get("BoilerReadRecord");
          var action = TargetResource["::findById::Boiler::boilerRecords"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.Boiler.boilerRecords#updateById
             * @methodOf lbServices.Boiler.boilerRecords
             *
             * @description
             *
             * Update a related item by id for boilerRecords.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Boiler id
             *
             *  - `fk` – `{*}` - Foreign key for boilerRecords
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `data` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerReadRecord` object.)
             * </em>
             */
        R.boilerRecords.updateById = function() {
          var TargetResource = $injector.get("BoilerReadRecord");
          var action = TargetResource["::updateById::Boiler::boilerRecords"];
          return action.apply(R, arguments);
        };


        return R;
      }]);

/**
 * @ngdoc object
 * @name lbServices.ErrorCode
 * @header lbServices.ErrorCode
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `ErrorCode` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
  module.factory(
    "ErrorCode",
    [
      'LoopBackResource', 'LoopBackAuth', '$injector', '$q',
      function(LoopBackResource, LoopBackAuth, $injector, $q) {
        var R = LoopBackResource(
        urlBase + "/ErrorCodes/:id",
          { 'id': '@id' },
          {

            /**
             * @ngdoc method
             * @name lbServices.ErrorCode#create
             * @methodOf lbServices.ErrorCode
             *
             * @description
             *
             * Create a new instance of the model and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `ErrorCode` object.)
             * </em>
             */
            "create": {
              url: urlBase + "/ErrorCodes",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.ErrorCode#createMany
             * @methodOf lbServices.ErrorCode
             *
             * @description
             *
             * Create a new instance of the model and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `ErrorCode` object.)
             * </em>
             */
            "createMany": {
              isArray: true,
              url: urlBase + "/ErrorCodes",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.ErrorCode#find
             * @methodOf lbServices.ErrorCode
             *
             * @description
             *
             * Find all instances of the model matched by filter from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"something":"value"})
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `ErrorCode` object.)
             * </em>
             */
            "find": {
              isArray: true,
              url: urlBase + "/ErrorCodes",
              method: "GET",
            },


                        /**
             * @ngdoc method
             * @name lbServices.ErrorCode#findByBrand
             * @methodOf lbServices.ErrorCode
             *
             * @description
             *
             * Find all instances of the model matched by filter from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `brand` – `{object=}` - Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"something":"value"})
             *
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `ErrorCode` object.)
             * </em>
             */
            "findByBrand": {
              isArray: true,
              url: urlBase + "/ErrorCodes/findByBrand",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.ErrorCode#deleteAll
             * @methodOf lbServices.ErrorCode
             *
             * @description
             *
             * Private method, don't call this method.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `response` – `{object=}` -
             */
            "deleteAll": {
              url: urlBase + "/ErrorCodes/all",
              method: "DELETE",
            },

            /**
             * @ngdoc method
             * @name lbServices.ErrorCode#deleteMany
             * @methodOf lbServices.ErrorCode
             *
             * @description
             *
             * Private method, don't call this method.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `response` – `{object=}` -
             */
            "deleteMany": {
              url: urlBase + "/ErrorCodes/brandEC",
              method: "DELETE",
            },
          }
        );




        /**
        * @ngdoc property
        * @name lbServices.ErrorCode#modelName
        * @propertyOf lbServices.ErrorCode
        * @description
        * The name of the model represented by this $resource,
        * i.e. `ErrorCode`.
        */
        R.modelName = "ErrorCode";



        return R;
      }]);

/**
 * @ngdoc object
 * @name lbServices.ServiceRep
 * @header lbServices.ServiceRep
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `ServiceRep` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
  module.factory(
    "ServiceRep",
    [
      'LoopBackResource', 'LoopBackAuth', '$injector', '$q',
      function(LoopBackResource, LoopBackAuth, $injector, $q) {
        var R = LoopBackResource(
        urlBase + "/ServiceReps/:id",
          { 'id': '@id' },
          {

            /**
             * @ngdoc method
             * @name lbServices.ServiceRep#zip
             * @methodOf lbServices.ServiceRep
             *
             * @description
             *
             * Use this method to fetch the service rep by zip code.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{string=}` -
             *
             *  - `req` – `{object=}` -
             *
             *  - `res` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `ServiceRep` object.)
             * </em>
             */
            "zip": {
              url: urlBase + "/ServiceReps/zip/:id",
              method: "GET",
            },
          }
        );




        /**
        * @ngdoc property
        * @name lbServices.ServiceRep#modelName
        * @propertyOf lbServices.ServiceRep
        * @description
        * The name of the model represented by this $resource,
        * i.e. `ServiceRep`.
        */
        R.modelName = "ServiceRep";



        return R;
      }]);

/**
 * @ngdoc object
 * @name lbServices.User
 * @header lbServices.User
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `User` model.
 *
 * **Details**
 *
 * Manages User info and related data.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
  module.factory(
    "User",
    [
      'LoopBackResource', 'LoopBackAuth', '$injector', '$q',
      function(LoopBackResource, LoopBackAuth, $injector, $q) {
        var R = LoopBackResource(
        urlBase + "/users/:id",
          { 'id': '@id' },
          {

            /**
             * @ngdoc method
             * @name lbServices.User#prototype$__findById__accessTokens
             * @methodOf lbServices.User
             *
             * @description
             *
             * Find a related item by id for accessTokens.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             *  - `options` – `{object=}` -
             *
             *  - `fk` – `{*}` - Foreign key for accessTokens
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
            "prototype$__findById__accessTokens": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/accessTokens/:fk",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#prototype$__destroyById__accessTokens
             * @methodOf lbServices.User
             *
             * @description
             *
             * Delete a related item by id for accessTokens.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             *  - `options` – `{object=}` -
             *
             *  - `fk` – `{*}` - Foreign key for accessTokens
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * This method returns no data.
             */
            "prototype$__destroyById__accessTokens": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/accessTokens/:fk",
              method: "DELETE",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#prototype$__updateById__accessTokens
             * @methodOf lbServices.User
             *
             * @description
             *
             * Update a related item by id for accessTokens.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             *  - `fk` – `{*}` - Foreign key for accessTokens
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `data` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
            "prototype$__updateById__accessTokens": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/accessTokens/:fk",
              method: "PUT",
            },

            // INTERNAL. Use User.roles.findById() instead.
            "prototype$__findById__roles": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/roles/:fk",
              method: "GET",
            },

            // INTERNAL. Use User.roles.destroyById() instead.
            "prototype$__destroyById__roles": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/roles/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use User.roles.updateById() instead.
            "prototype$__updateById__roles": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/roles/:fk",
              method: "PUT",
            },

            // INTERNAL. Use User.roles.link() instead.
            "prototype$__link__roles": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/roles/rel/:fk",
              method: "PUT",
            },

            // INTERNAL. Use User.roles.unlink() instead.
            "prototype$__unlink__roles": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/roles/rel/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use User.roles.exists() instead.
            "prototype$__exists__roles": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/roles/rel/:fk",
              method: "HEAD",
            },

            // INTERNAL. Use User.sites.findById() instead.
            "prototype$__findById__sites": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/sites/:fk",
              method: "GET",
            },

            // INTERNAL. Use User.sites.destroyById() instead.
            "prototype$__destroyById__sites": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/sites/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use User.sites.updateById() instead.
            "prototype$__updateById__sites": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/sites/:fk",
              method: "PUT",
            },

            // INTERNAL. Use User.sites.link() instead.
            "prototype$__link__sites": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/sites/rel/:fk",
              method: "PUT",
            },

            // INTERNAL. Use User.sites.unlink() instead.
            "prototype$__unlink__sites": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/sites/rel/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use User.sites.exists() instead.
            "prototype$__exists__sites": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/sites/rel/:fk",
              method: "HEAD",
            },

            // INTERNAL. Use User.devices.findById() instead.
            "prototype$__findById__devices": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/devices/:fk",
              method: "GET",
            },

            // INTERNAL. Use User.devices.destroyById() instead.
            "prototype$__destroyById__devices": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/devices/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use User.devices.updateById() instead.
            "prototype$__updateById__devices": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/devices/:fk",
              method: "PUT",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#prototype$__get__accessTokens
             * @methodOf lbServices.User
             *
             * @description
             *
             * Queries accessTokens of user.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             *  - `options` – `{object=}` -
             *
             *  - `filter` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
            "prototype$__get__accessTokens": {
              isArray: true,
              url: urlBase + "/users/:id/accessTokens",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#prototype$__create__accessTokens
             * @methodOf lbServices.User
             *
             * @description
             *
             * Creates a new instance in accessTokens of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `data` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
            "prototype$__create__accessTokens": {
              url: urlBase + "/users/:id/accessTokens",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#prototype$__delete__accessTokens
             * @methodOf lbServices.User
             *
             * @description
             *
             * Deletes all accessTokens of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             *  - `options` – `{object=}` -
             *
             *  - `where` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * This method returns no data.
             */
            "prototype$__delete__accessTokens": {
              url: urlBase + "/users/:id/accessTokens",
              method: "DELETE",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#prototype$__count__accessTokens
             * @methodOf lbServices.User
             *
             * @description
             *
             * Counts accessTokens of user.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             *  - `options` – `{object=}` -
             *
             *  - `where` – `{object=}` - Criteria to match model instances
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `count` – `{number=}` -
             */
            "prototype$__count__accessTokens": {
              url: urlBase + "/users/:id/accessTokens/count",
              method: "GET",
            },

            // INTERNAL. Use User.roles() instead.
            "prototype$__get__roles": {
              isArray: true,
              url: urlBase + "/users/:id/roles",
              method: "GET",
            },

            // INTERNAL. Use User.roles.create() instead.
            "prototype$__create__roles": {
              url: urlBase + "/users/:id/roles",
              method: "POST",
            },

            // INTERNAL. Use User.roles.destroyAll() instead.
            "prototype$__delete__roles": {
              url: urlBase + "/users/:id/roles",
              method: "DELETE",
            },

            // INTERNAL. Use User.roles.count() instead.
            "prototype$__count__roles": {
              url: urlBase + "/users/:id/roles/count",
              method: "GET",
            },

            // INTERNAL. Use User.sites() instead.
            "prototype$__get__sites": {
              isArray: true,
              url: urlBase + "/users/:id/sites",
              method: "GET",
            },

            // INTERNAL. Use User.sites.create() instead.
            "prototype$__create__sites": {
              url: urlBase + "/users/:id/sites",
              method: "POST",
            },

            // INTERNAL. Use User.sites.destroyAll() instead.
            "prototype$__delete__sites": {
              url: urlBase + "/users/:id/sites",
              method: "DELETE",
            },

            // INTERNAL. Use User.sites.count() instead.
            "prototype$__count__sites": {
              url: urlBase + "/users/:id/sites/count",
              method: "GET",
            },

            // INTERNAL. Use User.devices() instead.
            "prototype$__get__devices": {
              isArray: true,
              url: urlBase + "/users/:id/devices",
              method: "GET",
            },

            // INTERNAL. Use User.devices.create() instead.
            "prototype$__create__devices": {
              url: urlBase + "/users/:id/devices",
              method: "POST",
            },

            // INTERNAL. Use User.devices.destroyAll() instead.
            "prototype$__delete__devices": {
              url: urlBase + "/users/:id/devices",
              method: "DELETE",
            },

            // INTERNAL. Use User.devices.count() instead.
            "prototype$__count__devices": {
              url: urlBase + "/users/:id/devices/count",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#create
             * @methodOf lbServices.User
             *
             * @description
             *
             * Create a new instance of the model and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
            "create": {
              url: urlBase + "/users",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#createMany
             * @methodOf lbServices.User
             *
             * @description
             *
             * Create a new instance of the model and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
            "createMany": {
              isArray: true,
              url: urlBase + "/users",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#patchOrCreate
             * @methodOf lbServices.User
             *
             * @description
             *
             * Patch an existing model instance or insert a new one into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
            "patchOrCreate": {
              url: urlBase + "/users",
              method: "PUT",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#replaceOrCreate
             * @methodOf lbServices.User
             *
             * @description
             *
             * Replace an existing model instance or insert a new one into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
            "replaceOrCreate": {
              url: urlBase + "/users/replaceOrCreate",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#upsertWithWhere
             * @methodOf lbServices.User
             *
             * @description
             *
             * Update an existing model instance or insert a new one into the data source based on the where criteria.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `where` – `{object=}` - Criteria to match model instances
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - An object of model property name/value pairs
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
            "upsertWithWhere": {
              url: urlBase + "/users/upsertWithWhere",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#exists
             * @methodOf lbServices.User
             *
             * @description
             *
             * Check whether a model instance exists in the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Model id
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `exists` – `{boolean=}` -
             */
            "exists": {
              url: urlBase + "/users/:id/exists",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#findById
             * @methodOf lbServices.User
             *
             * @description
             *
             * Find a model instance by {{id}} from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Model id
             *
             *  - `filter` – `{object=}` - Filter defining fields and include - must be a JSON-encoded string ({"something":"value"})
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
            "findById": {
              url: urlBase + "/users/:id",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#replaceById
             * @methodOf lbServices.User
             *
             * @description
             *
             * Replace attributes for a model instance and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Model id
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
            "replaceById": {
              url: urlBase + "/users/:id/replace",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#find
             * @methodOf lbServices.User
             *
             * @description
             *
             * Find all instances of the model matched by filter from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"something":"value"})
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
            "find": {
              isArray: true,
              url: urlBase + "/users",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#findOne
             * @methodOf lbServices.User
             *
             * @description
             *
             * Find first instance of the model matched by filter from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"something":"value"})
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
            "findOne": {
              url: urlBase + "/users/findOne",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#destroyAll
             * @methodOf lbServices.User
             *
             * @description
             *
             * Delete all matching records.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `where` – `{object=}` - filter.where object
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * The number of instances deleted
             */
            "destroyAll": {
              url: urlBase + "/users",
              method: "DELETE",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#updateAll
             * @methodOf lbServices.User
             *
             * @description
             *
             * Update instances of the model matched by {{where}} from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `where` – `{object=}` - Criteria to match model instances
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - An object of model property name/value pairs
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Information related to the outcome of the operation
             */
            "updateAll": {
              url: urlBase + "/users/update",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#deleteById
             * @methodOf lbServices.User
             *
             * @description
             *
             * Delete a model instance by {{id}} from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Model id
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
            "deleteById": {
              url: urlBase + "/users/:id",
              method: "DELETE",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#count
             * @methodOf lbServices.User
             *
             * @description
             *
             * Count instances of the model matched by where from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `where` – `{object=}` - Criteria to match model instances
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `count` – `{number=}` -
             */
            "count": {
              url: urlBase + "/users/count",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#prototype$patchAttributes
             * @methodOf lbServices.User
             *
             * @description
             *
             * Patch attributes for a model instance and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `data` – `{object=}` - An object of model property name/value pairs
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
            "prototype$patchAttributes": {
              url: urlBase + "/users/:id",
              method: "PUT",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#createChangeStream
             * @methodOf lbServices.User
             *
             * @description
             *
             * Create a change stream.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `changes` – `{ReadableStream=}` -
             */
            "createChangeStream": {
              url: urlBase + "/users/change-stream",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#login
             * @methodOf lbServices.User
             *
             * @description
             *
             * Login a user with username/email and password.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `include` – `{string=}` - Related objects to include in the response. See the description of return value for more details.
             *   Default value: `user`.
             *
             *  - `rememberMe` - `boolean` - Whether the authentication credentials
             *     should be remembered in localStorage across app/browser restarts.
             *     Default: `true`.
             *
             * @param {Object} postData Request data.
             *
             * This method expects a subset of model properties as request parameters.
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * The response body contains properties of the AccessToken created on login.
             * Depending on the value of `include` parameter, the body may contain additional properties:
             *   - `user` - `U+007BUserU+007D` - Data of the currently logged in user. (`include=user`)
             *
             */
            "login": {
              // params: {
              //   include: 'user',
              // },
              interceptor: {
                response: function(response) {
                  var accessToken = response.data;
                  LoopBackAuth.setUser(
                    accessToken.id, accessToken.userId, accessToken.user);
                  LoopBackAuth.rememberMe =
                    response.config.params.rememberMe !== false;
                  LoopBackAuth.save();
                  return response.resource;
                },
              },
              url: urlBase + "/users/login",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#logout
             * @methodOf lbServices.User
             *
             * @description
             *
             * Logout a user with access token.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `access_token` – `{string=}` - Do not supply this argument, it is automatically extracted from request headers.
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * This method returns no data.
             */
            "logout": {
              interceptor: {
                response: function(response) {
                  LoopBackAuth.clearUser();
                  LoopBackAuth.clearStorage();
                  //location.reload();
                  return response.resource;
                },
                responseError: function(responseError) {
                  LoopBackAuth.clearUser();
                  LoopBackAuth.clearStorage();
                  //location.reload();
                  return responseError.resource;
                },
              },
              url: urlBase + "/users/logout",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#prototype$verify
             * @methodOf lbServices.User
             *
             * @description
             *
             * Trigger user's identity verification with configured verifyOptions
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `verifyOptions` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * This method returns no data.
             */
            "prototype$verify": {
              url: urlBase + "/users/:id/verify",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#confirm
             * @methodOf lbServices.User
             *
             * @description
             *
             * Confirm a user registration with identity verification token.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `uid` – `{string}` -
             *
             *  - `token` – `{string}` -
             *
             *  - `redirect` – `{string=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * This method returns no data.
             */
            "confirm": {
              url: urlBase + "/users/confirm",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#resetPassword
             * @methodOf lbServices.User
             *
             * @description
             *
             * Reset password for a user with email.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             * This method expects a subset of model properties as request parameters.
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * This method returns no data.
             */
            "resetPassword": {
              url: urlBase + "/users/reset",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#setPassword
             * @methodOf lbServices.User
             *
             * @description
             *
             * Reset user's password via a password-reset token.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `id` – `{*=}` -
             *
             *  - `newPassword` – `{string}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * This method returns no data.
             */
            "setPassword": {
              url: urlBase + "/users/reset-password",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#forgotPassword
             * @methodOf lbServices.User
             *
             * @description
             *
             * <em>
             * (The remote method definition does not provide any description.)
             * </em>
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `email` – `{object=}` -
             *
             *  - `req` – `{object=}` -
             *
             *  - `res` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `response` – `{object=}` -
             */
            "forgotPassword": {
              url: urlBase + "/users/forgotPassword",
              method: "POST",
            },


             /**
             * @ngdoc method
             * @name lbServices.User#checkEmail
             * @methodOf lbServices.User
             *
             * @description
             *
             * <em>
             * (The remote method definition does not provide any description.)
             * </em>
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `email` – `{object=}` -
             *
             *  - `req` – `{object=}` -
             *
             *  - `res` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `response` – `{object=}` -
             */
            "checkEmail": {
              url: urlBase + "/users/checkEmail",
              method: "POST",
            },

            "isUserExist": {
              url: urlBase + "/users/isUserExist",
              method: "POST",
            },


                         /**
             * @ngdoc method
             * @name lbServices.User#checkEmail
             * @methodOf lbServices.User
             *
             * @description
             *
             * <em>
             * (The remote method definition does not provide any description.)
             * </em>
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `email` – `{object=}` -
             *
             *  - `req` – `{object=}` -
             *
             *  - `res` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `response` – `{object=}` -
             */
            "resendInvite": {
              url: urlBase + "/users/resendInvite",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#changePassword
             * @methodOf lbServices.User
             *
             * @description
             *
             * <em>
             * (The remote method definition does not provide any description.)
             * </em>
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `email` – `{object=}` -
             *
             *  - `req` – `{object=}` -
             *
             *  - `res` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `response` – `{object=}` -
             */
            "changePassword": {
              url: urlBase + "/users/changePassword",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#reset
             * @methodOf lbServices.User
             *
             * @description
             *
             * <em>
             * (The remote method definition does not provide any description.)
             * </em>
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `record` – `{object=}` -
             *
             *  - `req` – `{object=}` -
             *
             *  - `res` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `response` – `{object=}` -
             */
            "reset": {
              url: urlBase + "/users/resetPassword",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#invite
             * @methodOf lbServices.User
             *
             * @description
             *
             * <em>
             * (The remote method definition does not provide any description.)
             * </em>
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `user` – `{object=}` -
             *
             *  - `req` – `{object=}` -
             *
             *  - `res` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `response` – `{object=}` -
             */
            "invite": {
              url: urlBase + "/users/invite",
              method: "POST",
            },

            // INTERNAL. Use Site.site() instead.
            "::get::Site::site": {
              url: urlBase + "/Sites/:id/site",
              method: "GET",
            },

            // INTERNAL. Use Site.users.findById() instead.
            "::findById::Site::users": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Sites/:id/users/:fk",
              method: "GET",
            },

            // INTERNAL. Use Site.users.destroyById() instead.
            "::destroyById::Site::users": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Sites/:id/users/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Site.users.updateById() instead.
            "::updateById::Site::users": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Sites/:id/users/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Site.users.link() instead.
            "::link::Site::users": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Sites/:id/users/rel/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Site.users.unlink() instead.
            "::unlink::Site::users": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Sites/:id/users/rel/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Site.users.exists() instead.
            "::exists::Site::users": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Sites/:id/users/rel/:fk",
              method: "HEAD",
            },

            // INTERNAL. Use Site.users() instead.
            "::get::Site::users": {
              isArray: true,
              url: urlBase + "/Sites/:id/users",
              method: "GET",
            },

            // INTERNAL. Use Site.users.create() instead.
            "::create::Site::users": {
              url: urlBase + "/Sites/:id/users",
              method: "POST",
            },

            // INTERNAL. Use Site.users.createMany() instead.
            "::createMany::Site::users": {
              isArray: true,
              url: urlBase + "/Sites/:id/users",
              method: "POST",
            },

            // INTERNAL. Use Site.users.destroyAll() instead.
            "::delete::Site::users": {
              url: urlBase + "/Sites/:id/users",
              method: "DELETE",
            },

            // INTERNAL. Use Site.users.count() instead.
            "::count::Site::users": {
              url: urlBase + "/Sites/:id/users/count",
              method: "GET",
            },

            // INTERNAL. Use BoilerFile.user() instead.
            "::get::BoilerFile::user": {
              url: urlBase + "/BoilerFiles/:id/user",
              method: "GET",
            },

            // INTERNAL. Use BoilerWriteRecord.user() instead.
            "::get::BoilerWriteRecord::user": {
              url: urlBase + "/BoilerWriteRecords/:id/user",
              method: "GET",
            },

            // INTERNAL. Use BoilerWriteRecord.user.create() instead.
            "::create::BoilerWriteRecord::user": {
              url: urlBase + "/BoilerWriteRecords/:id/user",
              method: "POST",
            },

            // INTERNAL. Use BoilerWriteRecord.user.createMany() instead.
            "::createMany::BoilerWriteRecord::user": {
              isArray: true,
              url: urlBase + "/BoilerWriteRecords/:id/user",
              method: "POST",
            },

            // INTERNAL. Use BoilerWriteRecord.user.update() instead.
            "::update::BoilerWriteRecord::user": {
              url: urlBase + "/BoilerWriteRecords/:id/user",
              method: "PUT",
            },

            // INTERNAL. Use BoilerWriteRecord.user.destroy() instead.
            "::destroy::BoilerWriteRecord::user": {
              url: urlBase + "/BoilerWriteRecords/:id/user",
              method: "DELETE",
            },

            // INTERNAL. Use UserToSite.user() instead.
            "::get::UserToSite::user": {
              url: urlBase + "/UserToSites/:id/user",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.User#getCurrent
             * @methodOf lbServices.User
             *
             * @description
             *
             * Get data of the currently logged user. Fail with HTTP result 401
             * when there is no user logged in.
             *
             * @param {function(Object,Object)=} successCb
             *    Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *    `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             */
            'getCurrent': {
              url: urlBase + "/users" + '/:id',
              method: 'GET',
              params: {
                id: function() {
                  var id = LoopBackAuth.currentUserId;
                  if (id == null) id = '__anonymous__';
                  return id;
                },
              },
              interceptor: {
                response: function(response) {
                  LoopBackAuth.currentUserData = response.data;
                  return response.resource;
                },
                responseError: function(responseError) {
                  LoopBackAuth.clearUser();
                  LoopBackAuth.clearStorage();
                  return $q.reject(responseError);
                },
              },
              __isGetCurrentUser__: true,
            },
          }
        );



            /**
             * @ngdoc method
             * @name lbServices.User#upsert
             * @methodOf lbServices.User
             *
             * @description
             *
             * Patch an existing model instance or insert a new one into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
        R["upsert"] = R["patchOrCreate"];

            /**
             * @ngdoc method
             * @name lbServices.User#updateOrCreate
             * @methodOf lbServices.User
             *
             * @description
             *
             * Patch an existing model instance or insert a new one into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
        R["updateOrCreate"] = R["patchOrCreate"];

            /**
             * @ngdoc method
             * @name lbServices.User#patchOrCreateWithWhere
             * @methodOf lbServices.User
             *
             * @description
             *
             * Update an existing model instance or insert a new one into the data source based on the where criteria.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `where` – `{object=}` - Criteria to match model instances
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - An object of model property name/value pairs
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
        R["patchOrCreateWithWhere"] = R["upsertWithWhere"];

            /**
             * @ngdoc method
             * @name lbServices.User#update
             * @methodOf lbServices.User
             *
             * @description
             *
             * Update instances of the model matched by {{where}} from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `where` – `{object=}` - Criteria to match model instances
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - An object of model property name/value pairs
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Information related to the outcome of the operation
             */
        R["update"] = R["updateAll"];

            /**
             * @ngdoc method
             * @name lbServices.User#destroyById
             * @methodOf lbServices.User
             *
             * @description
             *
             * Delete a model instance by {{id}} from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Model id
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
        R["destroyById"] = R["deleteById"];

            /**
             * @ngdoc method
             * @name lbServices.User#removeById
             * @methodOf lbServices.User
             *
             * @description
             *
             * Delete a model instance by {{id}} from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Model id
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
        R["removeById"] = R["deleteById"];

            /**
             * @ngdoc method
             * @name lbServices.User#prototype$updateAttributes
             * @methodOf lbServices.User
             *
             * @description
             *
             * Patch attributes for a model instance and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `data` – `{object=}` - An object of model property name/value pairs
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
        R["prototype$updateAttributes"] = R["prototype$patchAttributes"];

        /**
         * @ngdoc method
         * @name lbServices.User#getCachedCurrent
         * @methodOf lbServices.User
         *
         * @description
         *
         * Get data of the currently logged user that was returned by the last
         * call to {@link lbServices.User#login} or
         * {@link lbServices.User#getCurrent}. Return null when there
         * is no user logged in or the data of the current user were not fetched
         * yet.
         *
         * @returns {Object} A User instance.
         */
        R.getCachedCurrent = function() {
          var data = LoopBackAuth.currentUserData;
          return data ? new R(data) : null;
        };

        /**
         * @ngdoc method
         * @name lbServices.User#isAuthenticated
         * @methodOf lbServices.User
         *
         * @returns {boolean} True if the current user is authenticated (logged in).
         */
        R.isAuthenticated = function() {
          return this.getCurrentId() != null;
        };

        /**
         * @ngdoc method
         * @name lbServices.User#getCurrentId
         * @methodOf lbServices.User
         *
         * @returns {Object} Id of the currently logged-in user or null.
         */
        R.getCurrentId = function() {
          return LoopBackAuth.currentUserId;
        };

        /**
        * @ngdoc property
        * @name lbServices.User#modelName
        * @propertyOf lbServices.User
        * @description
        * The name of the model represented by this $resource,
        * i.e. `User`.
        */
        R.modelName = "User";

    /**
     * @ngdoc object
     * @name lbServices.User.roles
     * @header lbServices.User.roles
     * @object
     * @description
     *
     * The object `User.roles` groups methods
     * manipulating `Role` instances related to `User`.
     *
     * Call {@link lbServices.User#roles User.roles()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.User#roles
             * @methodOf lbServices.User
             *
             * @description
             *
             * Queries roles of user.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             *  - `options` – `{object=}` -
             *
             *  - `filter` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Role` object.)
             * </em>
             */
        R.roles = function() {
          var TargetResource = $injector.get("Role");
          var action = TargetResource["::get::User::roles"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.User.roles#count
             * @methodOf lbServices.User.roles
             *
             * @description
             *
             * Counts roles of user.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             *  - `options` – `{object=}` -
             *
             *  - `where` – `{object=}` - Criteria to match model instances
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `count` – `{number=}` -
             */
        R.roles.count = function() {
          var TargetResource = $injector.get("Role");
          var action = TargetResource["::count::User::roles"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.User.roles#create
             * @methodOf lbServices.User.roles
             *
             * @description
             *
             * Creates a new instance in roles of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `data` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Role` object.)
             * </em>
             */
        R.roles.create = function() {
          var TargetResource = $injector.get("Role");
          var action = TargetResource["::create::User::roles"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.User.roles#createMany
             * @methodOf lbServices.User.roles
             *
             * @description
             *
             * Creates a new instance in roles of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `data` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Role` object.)
             * </em>
             */
        R.roles.createMany = function() {
          var TargetResource = $injector.get("Role");
          var action = TargetResource["::createMany::User::roles"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.User.roles#destroyAll
             * @methodOf lbServices.User.roles
             *
             * @description
             *
             * Deletes all roles of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             *  - `options` – `{object=}` -
             *
             *  - `where` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * This method returns no data.
             */
        R.roles.destroyAll = function() {
          var TargetResource = $injector.get("Role");
          var action = TargetResource["::delete::User::roles"];
          return action.apply(R, arguments);
        };
        

            /**
             * @ngdoc method
             * @name lbServices.User.roles#destroyById
             * @methodOf lbServices.User.roles
             *
             * @description
             *
             * Delete a related item by id for roles.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             *  - `options` – `{object=}` -
             *
             *  - `fk` – `{*}` - Foreign key for roles
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * This method returns no data.
             */
        R.roles.destroyById = function() {
          var TargetResource = $injector.get("Role");
          var action = TargetResource["::destroyById::User::roles"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.User.roles#exists
             * @methodOf lbServices.User.roles
             *
             * @description
             *
             * Check the existence of roles relation to an item by id.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             *  - `options` – `{object=}` -
             *
             *  - `fk` – `{*}` - Foreign key for roles
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Role` object.)
             * </em>
             */
        R.roles.exists = function() {
          var TargetResource = $injector.get("Role");
          var action = TargetResource["::exists::User::roles"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.User.roles#findById
             * @methodOf lbServices.User.roles
             *
             * @description
             *
             * Find a related item by id for roles.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             *  - `options` – `{object=}` -
             *
             *  - `fk` – `{*}` - Foreign key for roles
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Role` object.)
             * </em>
             */
        R.roles.findById = function() {
          var TargetResource = $injector.get("Role");
          var action = TargetResource["::findById::User::roles"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.User.roles#link
             * @methodOf lbServices.User.roles
             *
             * @description
             *
             * Add a related item by id for roles.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             *  - `fk` – `{*}` - Foreign key for roles
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `data` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Role` object.)
             * </em>
             */
        R.roles.link = function() {
          var TargetResource = $injector.get("Role");
          var action = TargetResource["::link::User::roles"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.User.roles#unlink
             * @methodOf lbServices.User.roles
             *
             * @description
             *
             * Remove the roles relation to an item by id.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             *  - `options` – `{object=}` -
             *
             *  - `fk` – `{*}` - Foreign key for roles
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * This method returns no data.
             */
        R.roles.unlink = function() {
          var TargetResource = $injector.get("Role");
          var action = TargetResource["::unlink::User::roles"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.User.roles#updateById
             * @methodOf lbServices.User.roles
             *
             * @description
             *
             * Update a related item by id for roles.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             *  - `fk` – `{*}` - Foreign key for roles
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `data` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Role` object.)
             * </em>
             */
        R.roles.updateById = function() {
          var TargetResource = $injector.get("Role");
          var action = TargetResource["::updateById::User::roles"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.User.sites
     * @header lbServices.User.sites
     * @object
     * @description
     *
     * The object `User.sites` groups methods
     * manipulating `Site` instances related to `User`.
     *
     * Call {@link lbServices.User#sites User.sites()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.User#sites
             * @methodOf lbServices.User
             *
             * @description
             *
             * Queries sites of user.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             *  - `options` – `{object=}` -
             *
             *  - `filter` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Site` object.)
             * </em>
             */
        R.sites = function() {
          var TargetResource = $injector.get("Site");
          var action = TargetResource["::get::User::sites"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.User.sites#count
             * @methodOf lbServices.User.sites
             *
             * @description
             *
             * Counts sites of user.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             *  - `options` – `{object=}` -
             *
             *  - `where` – `{object=}` - Criteria to match model instances
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `count` – `{number=}` -
             */
        R.sites.count = function() {
          var TargetResource = $injector.get("Site");
          var action = TargetResource["::count::User::sites"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.User.sites#create
             * @methodOf lbServices.User.sites
             *
             * @description
             *
             * Creates a new instance in sites of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `data` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Site` object.)
             * </em>
             */
        R.sites.create = function() {
          var TargetResource = $injector.get("Site");
          var action = TargetResource["::create::User::sites"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.User.sites#createMany
             * @methodOf lbServices.User.sites
             *
             * @description
             *
             * Creates a new instance in sites of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `data` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Site` object.)
             * </em>
             */
        R.sites.createMany = function() {
          var TargetResource = $injector.get("Site");
          var action = TargetResource["::createMany::User::sites"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.User.sites#destroyAll
             * @methodOf lbServices.User.sites
             *
             * @description
             *
             * Deletes all sites of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             *  - `options` – `{object=}` -
             *
             *  - `where` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * This method returns no data.
             */
        R.sites.destroyAll = function() {
          var TargetResource = $injector.get("Site");
          var action = TargetResource["::delete::User::sites"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.User.sites#destroyById
             * @methodOf lbServices.User.sites
             *
             * @description
             *
             * Delete a related item by id for sites.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             *  - `options` – `{object=}` -
             *
             *  - `fk` – `{*}` - Foreign key for sites
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * This method returns no data.
             */
        R.sites.destroyById = function() {
          var TargetResource = $injector.get("Site");
          var action = TargetResource["::destroyById::User::sites"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.User.sites#exists
             * @methodOf lbServices.User.sites
             *
             * @description
             *
             * Check the existence of sites relation to an item by id.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             *  - `options` – `{object=}` -
             *
             *  - `fk` – `{*}` - Foreign key for sites
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Site` object.)
             * </em>
             */
        R.sites.exists = function() {
          var TargetResource = $injector.get("Site");
          var action = TargetResource["::exists::User::sites"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.User.sites#findById
             * @methodOf lbServices.User.sites
             *
             * @description
             *
             * Find a related item by id for sites.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             *  - `options` – `{object=}` -
             *
             *  - `fk` – `{*}` - Foreign key for sites
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Site` object.)
             * </em>
             */
        R.sites.findById = function() {
          var TargetResource = $injector.get("Site");
          var action = TargetResource["::findById::User::sites"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.User.sites#link
             * @methodOf lbServices.User.sites
             *
             * @description
             *
             * Add a related item by id for sites.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             *  - `fk` – `{*}` - Foreign key for sites
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `data` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Site` object.)
             * </em>
             */
        R.sites.link = function() {
          var TargetResource = $injector.get("Site");
          var action = TargetResource["::link::User::sites"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.User.sites#unlink
             * @methodOf lbServices.User.sites
             *
             * @description
             *
             * Remove the sites relation to an item by id.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             *  - `options` – `{object=}` -
             *
             *  - `fk` – `{*}` - Foreign key for sites
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * This method returns no data.
             */
        R.sites.unlink = function() {
          var TargetResource = $injector.get("Site");
          var action = TargetResource["::unlink::User::sites"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.User.sites#updateById
             * @methodOf lbServices.User.sites
             *
             * @description
             *
             * Update a related item by id for sites.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             *  - `fk` – `{*}` - Foreign key for sites
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `data` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Site` object.)
             * </em>
             */
        R.sites.updateById = function() {
          var TargetResource = $injector.get("Site");
          var action = TargetResource["::updateById::User::sites"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.User.devices
     * @header lbServices.User.devices
     * @object
     * @description
     *
     * The object `User.devices` groups methods
     * manipulating `Device` instances related to `User`.
     *
     * Call {@link lbServices.User#devices User.devices()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.User#devices
             * @methodOf lbServices.User
             *
             * @description
             *
             * Queries devices of user.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             *  - `options` – `{object=}` -
             *
             *  - `filter` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Device` object.)
             * </em>
             */
        R.devices = function() {
          var TargetResource = $injector.get("Device");
          var action = TargetResource["::get::User::devices"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.User.devices#count
             * @methodOf lbServices.User.devices
             *
             * @description
             *
             * Counts devices of user.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             *  - `options` – `{object=}` -
             *
             *  - `where` – `{object=}` - Criteria to match model instances
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `count` – `{number=}` -
             */
        R.devices.count = function() {
          var TargetResource = $injector.get("Device");
          var action = TargetResource["::count::User::devices"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.User.devices#create
             * @methodOf lbServices.User.devices
             *
             * @description
             *
             * Creates a new instance in devices of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `data` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Device` object.)
             * </em>
             */
        R.devices.create = function() {
          var TargetResource = $injector.get("Device");
          var action = TargetResource["::create::User::devices"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.User.devices#createMany
             * @methodOf lbServices.User.devices
             *
             * @description
             *
             * Creates a new instance in devices of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `data` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Device` object.)
             * </em>
             */
        R.devices.createMany = function() {
          var TargetResource = $injector.get("Device");
          var action = TargetResource["::createMany::User::devices"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.User.devices#destroyAll
             * @methodOf lbServices.User.devices
             *
             * @description
             *
             * Deletes all devices of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             *  - `options` – `{object=}` -
             *
             *  - `where` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * This method returns no data.
             */
        R.devices.destroyAll = function() {
          var TargetResource = $injector.get("Device");
          var action = TargetResource["::delete::User::devices"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.User.devices#destroyById
             * @methodOf lbServices.User.devices
             *
             * @description
             *
             * Delete a related item by id for devices.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             *  - `options` – `{object=}` -
             *
             *  - `fk` – `{*}` - Foreign key for devices
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * This method returns no data.
             */
        R.devices.destroyById = function() {
          var TargetResource = $injector.get("Device");
          var action = TargetResource["::destroyById::User::devices"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.User.devices#findById
             * @methodOf lbServices.User.devices
             *
             * @description
             *
             * Find a related item by id for devices.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             *  - `options` – `{object=}` -
             *
             *  - `fk` – `{*}` - Foreign key for devices
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Device` object.)
             * </em>
             */
        R.devices.findById = function() {
          var TargetResource = $injector.get("Device");
          var action = TargetResource["::findById::User::devices"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.User.devices#updateById
             * @methodOf lbServices.User.devices
             *
             * @description
             *
             * Update a related item by id for devices.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - user id
             *
             *  - `fk` – `{*}` - Foreign key for devices
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `data` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Device` object.)
             * </em>
             */
        R.devices.updateById = function() {
          var TargetResource = $injector.get("Device");
          var action = TargetResource["::updateById::User::devices"];
          return action.apply(R, arguments);
        };


        return R;
      }]);

/**
 * @ngdoc object
 * @name lbServices.BoilerModel
 * @header lbServices.BoilerModel
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `BoilerModel` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
  module.factory(
    "BoilerModel",
    [
      'LoopBackResource', 'LoopBackAuth', '$injector', '$q',
      function(LoopBackResource, LoopBackAuth, $injector, $q) {
        var R = LoopBackResource(
        urlBase + "/BoilerModels/:id",
          { 'id': '@id' },
          {

            /**
             * @ngdoc method
             * @name lbServices.BoilerModel#create
             * @methodOf lbServices.BoilerModel
             *
             * @description
             *
             * Create a new instance of the model and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerModel` object.)
             * </em>
             */
            "create": {
              url: urlBase + "/BoilerModels",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.BoilerModel#createMany
             * @methodOf lbServices.BoilerModel
             *
             * @description
             *
             * Create a new instance of the model and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerModel` object.)
             * </em>
             */
            "createMany": {
              isArray: true,
              url: urlBase + "/BoilerModels",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.BoilerModel#find
             * @methodOf lbServices.BoilerModel
             *
             * @description
             *
             * Find all instances of the model matched by filter from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"something":"value"})
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerModel` object.)
             * </em>
             */
            "find": {
              isArray: true,
              url: urlBase + "/BoilerModels",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.BoilerModel#findByBrand
             * @methodOf lbServices.BoilerModel
             *
             * @description
             *
             * Find all instances of the model matched by filter from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `brand` – `{object=}` - Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"something":"value"})
             *
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerModel` object.)
             * </em>
             */
            "findByBrand": {
              isArray: true,
              url: urlBase + "/BoilerModels/findByBrand",
              method: "GET",
            },


            /**
             * @ngdoc method
             * @name lbServices.BoilerModel#deleteAll
             * @methodOf lbServices.BoilerModel
             *
             * @description
             *
             * Private method, don't call this method.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `response` – `{object=}` -
             */
            "deleteAll": {
              url: urlBase + "/BoilerModels/all",
              method: "DELETE",
            },

            /**
             * @ngdoc method
             * @name lbServices.BoilerModel#deleteMany
             * @methodOf lbServices.BoilerModel
             *
             * @description
             *
             * Private method, don't call this method.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `response` – `{object=}` -
             */
            "deleteMany": {
              url: urlBase + "/BoilerModels/brandBM",
              method: "DELETE",
            },
          }
        );




        /**
        * @ngdoc property
        * @name lbServices.BoilerModel#modelName
        * @propertyOf lbServices.BoilerModel
        * @description
        * The name of the model represented by this $resource,
        * i.e. `BoilerModel`.
        */
        R.modelName = "BoilerModel";



        return R;
      }]);

/**
 * @ngdoc object
 * @name lbServices.BoilerFile
 * @header lbServices.BoilerFile
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `BoilerFile` model.
 *
 * **Details**
 *
 * Manages the file download requests for a Boiler.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
  module.factory(
    "BoilerFile",
    [
      'LoopBackResource', 'LoopBackAuth', '$injector', '$q',
      function(LoopBackResource, LoopBackAuth, $injector, $q) {
        var R = LoopBackResource(
        urlBase + "/BoilerFiles/:id",
          { 'id': '@id' },
          {

            // INTERNAL. Use BoilerFile.boiler() instead.
            "prototype$__get__boiler": {
              url: urlBase + "/BoilerFiles/:id/boiler",
              method: "GET",
            },

            // INTERNAL. Use BoilerFile.user() instead.
            "prototype$__get__user": {
              url: urlBase + "/BoilerFiles/:id/user",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.BoilerFile#create
             * @methodOf lbServices.BoilerFile
             *
             * @description
             *
             * Create a new instance of the model and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerFile` object.)
             * </em>
             */
            "create": {
              url: urlBase + "/BoilerFiles",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.BoilerFile#createMany
             * @methodOf lbServices.BoilerFile
             *
             * @description
             *
             * Create a new instance of the model and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerFile` object.)
             * </em>
             */
            "createMany": {
              isArray: true,
              url: urlBase + "/BoilerFiles",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.BoilerFile#deleteById
             * @methodOf lbServices.BoilerFile
             *
             * @description
             *
             * Delete a model instance by {{id}} from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Model id
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerFile` object.)
             * </em>
             */
            "deleteById": {
              url: urlBase + "/BoilerFiles/:id",
              method: "DELETE",
            },

            /**
             * @ngdoc method
             * @name lbServices.BoilerFile#upload
             * @methodOf lbServices.BoilerFile
             *
             * @description
             *
             * Boiler to call this method to upload the file based on the id.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `req` – `{object=}` -
             *
             *  - `res` – `{object=}` -
             *
             *  - `id` – `{string=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `status` – `{string=}` -
             */
            "upload": {
              url: urlBase + "/BoilerFiles/:id/upload",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.BoilerFile#download
             * @methodOf lbServices.BoilerFile
             *
             * @description
             *
             * Client to call this method to get the file uploaded by the boiler, returns error if not ready.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `req` – `{object=}` -
             *
             *  - `res` – `{object=}` -
             *
             *  - `id` – `{string=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `status` – `{string=}` -
             */
            "download": {
              url: urlBase + "/BoilerFiles/:id/download",
              method: "GET",
            },
          }
        );



            /**
             * @ngdoc method
             * @name lbServices.BoilerFile#destroyById
             * @methodOf lbServices.BoilerFile
             *
             * @description
             *
             * Delete a model instance by {{id}} from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Model id
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerFile` object.)
             * </em>
             */
        R["destroyById"] = R["deleteById"];

            /**
             * @ngdoc method
             * @name lbServices.BoilerFile#removeById
             * @methodOf lbServices.BoilerFile
             *
             * @description
             *
             * Delete a model instance by {{id}} from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Model id
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerFile` object.)
             * </em>
             */
        R["removeById"] = R["deleteById"];


        /**
        * @ngdoc property
        * @name lbServices.BoilerFile#modelName
        * @propertyOf lbServices.BoilerFile
        * @description
        * The name of the model represented by this $resource,
        * i.e. `BoilerFile`.
        */
        R.modelName = "BoilerFile";


            /**
             * @ngdoc method
             * @name lbServices.BoilerFile#boiler
             * @methodOf lbServices.BoilerFile
             *
             * @description
             *
             * Fetches belongsTo relation boiler.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - BoilerFile id
             *
             *  - `options` – `{object=}` -
             *
             *  - `refresh` – `{boolean=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Boiler` object.)
             * </em>
             */
        R.boiler = function() {
          var TargetResource = $injector.get("Boiler");
          var action = TargetResource["::get::BoilerFile::boiler"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.BoilerFile#user
             * @methodOf lbServices.BoilerFile
             *
             * @description
             *
             * Fetches belongsTo relation user.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - BoilerFile id
             *
             *  - `options` – `{object=}` -
             *
             *  - `refresh` – `{boolean=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
        R.user = function() {
          var TargetResource = $injector.get("User");
          var action = TargetResource["::get::BoilerFile::user"];
          return action.apply(R, arguments);
        };


        return R;
      }]);

/**
 * @ngdoc object
 * @name lbServices.DataPoint
 * @header lbServices.DataPoint
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `DataPoint` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
  module.factory(
    "DataPoint",
    [
      'LoopBackResource', 'LoopBackAuth', '$injector', '$q',
      function(LoopBackResource, LoopBackAuth, $injector, $q) {
        var R = LoopBackResource(
        urlBase + "/DataPoints/:id",
          { 'id': '@id' },
          {

            /**
             * @ngdoc method
             * @name lbServices.DataPoint#create
             * @methodOf lbServices.DataPoint
             *
             * @description
             *
             * Create a new instance of the model and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `DataPoint` object.)
             * </em>
             */
            "create": {
              url: urlBase + "/DataPoints",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.DataPoint#createMany
             * @methodOf lbServices.DataPoint
             *
             * @description
             *
             * Create a new instance of the model and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `DataPoint` object.)
             * </em>
             */
            "createMany": {
              isArray: true,
              url: urlBase + "/DataPoints",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.DataPoint#find
             * @methodOf lbServices.DataPoint
             *
             * @description
             *
             * Find all instances of the model matched by filter from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"something":"value"})
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `DataPoint` object.)
             * </em>
             */
            "find": {
              isArray: true,
              url: urlBase + "/DataPoints",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.DataPoint#deleteById
             * @methodOf lbServices.DataPoint
             *
             * @description
             *
             * Delete a model instance by {{id}} from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Model id
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `DataPoint` object.)
             * </em>
             */
            "deleteById": {
              url: urlBase + "/DataPoints/:id",
              method: "DELETE",
            },
          }
        );



            /**
             * @ngdoc method
             * @name lbServices.DataPoint#destroyById
             * @methodOf lbServices.DataPoint
             *
             * @description
             *
             * Delete a model instance by {{id}} from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Model id
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `DataPoint` object.)
             * </em>
             */
        R["destroyById"] = R["deleteById"];

            /**
             * @ngdoc method
             * @name lbServices.DataPoint#removeById
             * @methodOf lbServices.DataPoint
             *
             * @description
             *
             * Delete a model instance by {{id}} from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Model id
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `DataPoint` object.)
             * </em>
             */
        R["removeById"] = R["deleteById"];


        /**
        * @ngdoc property
        * @name lbServices.DataPoint#modelName
        * @propertyOf lbServices.DataPoint
        * @description
        * The name of the model represented by this $resource,
        * i.e. `DataPoint`.
        */
        R.modelName = "DataPoint";



        return R;
      }]);

/**
 * @ngdoc object
 * @name lbServices.BoilerReadRecord
 * @header lbServices.BoilerReadRecord
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `BoilerReadRecord` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
  module.factory(
    "BoilerReadRecord",
    [
      'LoopBackResource', 'LoopBackAuth', '$injector', '$q',
      function(LoopBackResource, LoopBackAuth, $injector, $q) {
        var R = LoopBackResource(
        urlBase + "/BoilerReadRecords/:id",
          { 'id': '@id' },
          {

            // INTERNAL. Use BoilerReadRecord.boiler() instead.
            "prototype$__get__boiler": {
              url: urlBase + "/BoilerReadRecords/:id/boiler",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.BoilerReadRecord#newRecord
             * @methodOf lbServices.BoilerReadRecord
             *
             * @description
             *
             * Boiler to call this method to update new records.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `signature` – `{string=}` -
             *
             *  - `record` – `{object=}` -
             *
             *  - `req` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `response` – `{object=}` -
             */
            "newRecord": {
              url: urlBase + "/BoilerReadRecords/newRecord",
              method: "POST",
            },


            /**
             * @ngdoc method
             * @name lbServices.BoilerReadRecord#boilerNewRecord
             * @methodOf lbServices.BoilerReadRecord
             *
             * @description
             *
             * Boiler to call this method to update new records.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `signature` – `{string=}` -
             *
             *  - `record` – `{object=}` -
             *
             *  - `req` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `response` – `{object=}` -
             */
            "boilerNewRecord": {
              url: urlBase + "/BoilerReadRecords/boilerNewRecord",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.BoilerReadRecord#replace
             * @methodOf lbServices.BoilerReadRecord
             *
             * @description
             *
             * Use this method to fetch the records by filter.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `boilerId` – `{string=}` -
             *
             *  - `update` – `{object=}` -
             *
             *  - `req` – `{object=}` -
             *
             *  - `res` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerReadRecord` object.)
             * </em>
             */
            "replace": {
              isArray: true,
              url: urlBase + "/BoilerReadRecords/:boilerId/replace",
              method: "GET",
            },

            // INTERNAL. Use Boiler.boilerRecords.findById() instead.
            "::findById::Boiler::boilerRecords": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Boilers/:id/boilerRecords/:fk",
              method: "GET",
            },

            // INTERNAL. Use Boiler.boilerRecords.destroyById() instead.
            "::destroyById::Boiler::boilerRecords": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Boilers/:id/boilerRecords/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use Boiler.boilerRecords.updateById() instead.
            "::updateById::Boiler::boilerRecords": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/Boilers/:id/boilerRecords/:fk",
              method: "PUT",
            },

            // INTERNAL. Use Boiler.boilerRecords() instead.
            "::get::Boiler::boilerRecords": {
              isArray: true,
              url: urlBase + "/Boilers/:id/boilerRecords",
              method: "GET",
            },

            // INTERNAL. Use Boiler.boilerRecords.create() instead.
            "::create::Boiler::boilerRecords": {
              url: urlBase + "/Boilers/:id/boilerRecords",
              method: "POST",
            },

            // INTERNAL. Use Boiler.boilerRecords.createMany() instead.
            "::createMany::Boiler::boilerRecords": {
              isArray: true,
              url: urlBase + "/Boilers/:id/boilerRecords",
              method: "POST",
            },

            // INTERNAL. Use Boiler.boilerRecords.destroyAll() instead.
            "::delete::Boiler::boilerRecords": {
              url: urlBase + "/Boilers/:id/boilerRecords",
              method: "DELETE",
            },

            // INTERNAL. Use Boiler.boilerRecords.count() instead.
            "::count::Boiler::boilerRecords": {
              url: urlBase + "/Boilers/:id/boilerRecords/count",
              method: "GET",
            },
          }
        );




        /**
        * @ngdoc property
        * @name lbServices.BoilerReadRecord#modelName
        * @propertyOf lbServices.BoilerReadRecord
        * @description
        * The name of the model represented by this $resource,
        * i.e. `BoilerReadRecord`.
        */
        R.modelName = "BoilerReadRecord";


            /**
             * @ngdoc method
             * @name lbServices.BoilerReadRecord#boiler
             * @methodOf lbServices.BoilerReadRecord
             *
             * @description
             *
             * Fetches belongsTo relation boiler.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - BoilerReadRecord id
             *
             *  - `options` – `{object=}` -
             *
             *  - `refresh` – `{boolean=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Boiler` object.)
             * </em>
             */
        R.boiler = function() {
          var TargetResource = $injector.get("Boiler");
          var action = TargetResource["::get::BoilerReadRecord::boiler"];
          return action.apply(R, arguments);
        };


        return R;
      }]);

/**
 * @ngdoc object
 * @name lbServices.BoilerWriteRecord
 * @header lbServices.BoilerWriteRecord
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `BoilerWriteRecord` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
  module.factory(
    "BoilerWriteRecord",
    [
      'LoopBackResource', 'LoopBackAuth', '$injector', '$q',
      function(LoopBackResource, LoopBackAuth, $injector, $q) {
        var R = LoopBackResource(
        urlBase + "/BoilerWriteRecords/:id",
          { 'id': '@id' },
          {

            // INTERNAL. Use BoilerWriteRecord.boiler() instead.
            "prototype$__get__boiler": {
              url: urlBase + "/BoilerWriteRecords/:id/boiler",
              method: "GET",
            },

            // INTERNAL. Use BoilerWriteRecord.user() instead.
            "prototype$__get__user": {
              url: urlBase + "/BoilerWriteRecords/:id/user",
              method: "GET",
            },

            // INTERNAL. Use BoilerWriteRecord.user.create() instead.
            "prototype$__create__user": {
              url: urlBase + "/BoilerWriteRecords/:id/user",
              method: "POST",
            },

            // INTERNAL. Use BoilerWriteRecord.user.update() instead.
            "prototype$__update__user": {
              url: urlBase + "/BoilerWriteRecords/:id/user",
              method: "PUT",
            },

            // INTERNAL. Use BoilerWriteRecord.user.destroy() instead.
            "prototype$__destroy__user": {
              url: urlBase + "/BoilerWriteRecords/:id/user",
              method: "DELETE",
            },

            /**
             * @ngdoc method
             * @name lbServices.BoilerWriteRecord#create
             * @methodOf lbServices.BoilerWriteRecord
             *
             * @description
             *
             * Create a new instance of the model and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerWriteRecord` object.)
             * </em>
             */
            "create": {
              url: urlBase + "/BoilerWriteRecords",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.BoilerWriteRecord#createMany
             * @methodOf lbServices.BoilerWriteRecord
             *
             * @description
             *
             * Create a new instance of the model and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerWriteRecord` object.)
             * </em>
             */
            "createMany": {
              isArray: true,
              url: urlBase + "/BoilerWriteRecords",
              method: "POST",
            },
          }
        );




        /**
        * @ngdoc property
        * @name lbServices.BoilerWriteRecord#modelName
        * @propertyOf lbServices.BoilerWriteRecord
        * @description
        * The name of the model represented by this $resource,
        * i.e. `BoilerWriteRecord`.
        */
        R.modelName = "BoilerWriteRecord";


            /**
             * @ngdoc method
             * @name lbServices.BoilerWriteRecord#boiler
             * @methodOf lbServices.BoilerWriteRecord
             *
             * @description
             *
             * Fetches belongsTo relation boiler.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - BoilerWriteRecord id
             *
             *  - `options` – `{object=}` -
             *
             *  - `refresh` – `{boolean=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Boiler` object.)
             * </em>
             */
        R.boiler = function() {
          var TargetResource = $injector.get("Boiler");
          var action = TargetResource["::get::BoilerWriteRecord::boiler"];
          return action.apply(R, arguments);
        };
    /**
     * @ngdoc object
     * @name lbServices.BoilerWriteRecord.user
     * @header lbServices.BoilerWriteRecord.user
     * @object
     * @description
     *
     * The object `BoilerWriteRecord.user` groups methods
     * manipulating `User` instances related to `BoilerWriteRecord`.
     *
     * Call {@link lbServices.BoilerWriteRecord#user BoilerWriteRecord.user()}
     * to query all related instances.
     */


            /**
             * @ngdoc method
             * @name lbServices.BoilerWriteRecord#user
             * @methodOf lbServices.BoilerWriteRecord
             *
             * @description
             *
             * Fetches hasOne relation user.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - BoilerWriteRecord id
             *
             *  - `options` – `{object=}` -
             *
             *  - `refresh` – `{boolean=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
        R.user = function() {
          var TargetResource = $injector.get("User");
          var action = TargetResource["::get::BoilerWriteRecord::user"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.BoilerWriteRecord.user#create
             * @methodOf lbServices.BoilerWriteRecord.user
             *
             * @description
             *
             * Creates a new instance in user of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - BoilerWriteRecord id
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `data` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
        R.user.create = function() {
          var TargetResource = $injector.get("User");
          var action = TargetResource["::create::BoilerWriteRecord::user"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.BoilerWriteRecord.user#createMany
             * @methodOf lbServices.BoilerWriteRecord.user
             *
             * @description
             *
             * Creates a new instance in user of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - BoilerWriteRecord id
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `data` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
        R.user.createMany = function() {
          var TargetResource = $injector.get("User");
          var action = TargetResource["::createMany::BoilerWriteRecord::user"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.BoilerWriteRecord.user#destroy
             * @methodOf lbServices.BoilerWriteRecord.user
             *
             * @description
             *
             * Deletes user of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - BoilerWriteRecord id
             *
             *  - `options` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * This method returns no data.
             */
        R.user.destroy = function() {
          var TargetResource = $injector.get("User");
          var action = TargetResource["::destroy::BoilerWriteRecord::user"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.BoilerWriteRecord.user#update
             * @methodOf lbServices.BoilerWriteRecord.user
             *
             * @description
             *
             * Update user of this model.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - BoilerWriteRecord id
             *
             * @param {Object} postData Request data.
             *
             *  - `options` – `{object=}` -
             *
             *  - `data` – `{object=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
        R.user.update = function() {
          var TargetResource = $injector.get("User");
          var action = TargetResource["::update::BoilerWriteRecord::user"];
          return action.apply(R, arguments);
        };


        return R;
      }]);

/**
 * @ngdoc object
 * @name lbServices.UserToSite
 * @header lbServices.UserToSite
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `UserToSite` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
  module.factory(
    "UserToSite",
    [
      'LoopBackResource', 'LoopBackAuth', '$injector', '$q',
      function(LoopBackResource, LoopBackAuth, $injector, $q) {
        var R = LoopBackResource(
        urlBase + "/UserToSites/:id",
          { 'id': '@id' },
          {

            // INTERNAL. Use UserToSite.user() instead.
            "prototype$__get__user": {
              url: urlBase + "/UserToSites/:id/user",
              method: "GET",
            },

            // INTERNAL. Use UserToSite.site() instead.
            "prototype$__get__site": {
              url: urlBase + "/UserToSites/:id/site",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.UserToSite#replaceById
             * @methodOf lbServices.UserToSite
             *
             * @description
             *
             * Replace attributes for a model instance and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Model id
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `UserToSite` object.)
             * </em>
             */
            "replaceById": {
              url: urlBase + "/UserToSites/:id/replace",
              method: "POST",
            },

            "replaceUser": {
              url: urlBase + "/UserToSites/:id/replaceUser",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.UserToSite#find
             * @methodOf lbServices.UserToSite
             *
             * @description
             *
             * Find all instances of the model matched by filter from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"something":"value"})
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `UserToSite` object.)
             * </em>
             */
            "find": {
              isArray: true,
              url: urlBase + "/UserToSites",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.UserToSite#unlinkAll
             * @methodOf lbServices.UserToSite
             *
             * @description
             *
             * Use this method to fetch the records by filter.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `siteId` – `{string=}` -
             *
             *  - `req` – `{object=}` -
             *
             *  - `res` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `response` – `{undefined=}` -
             */
            "unlinkAll": {
              url: urlBase + "/UserToSites/:siteId/unlinkAll",
              method: "GET",
            },

            "checkUserExist": {
              url: urlBase + "/UserToSites/checkUserExist",
              method: "GET"
            }
          }
        );




        /**
        * @ngdoc property
        * @name lbServices.UserToSite#modelName
        * @propertyOf lbServices.UserToSite
        * @description
        * The name of the model represented by this $resource,
        * i.e. `UserToSite`.
        */
        R.modelName = "UserToSite";


            /**
             * @ngdoc method
             * @name lbServices.UserToSite#user
             * @methodOf lbServices.UserToSite
             *
             * @description
             *
             * Fetches belongsTo relation user.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - UserToSite id
             *
             *  - `options` – `{object=}` -
             *
             *  - `refresh` – `{boolean=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `User` object.)
             * </em>
             */
        R.user = function() {
          var TargetResource = $injector.get("User");
          var action = TargetResource["::get::UserToSite::user"];
          return action.apply(R, arguments);
        };

            /**
             * @ngdoc method
             * @name lbServices.UserToSite#site
             * @methodOf lbServices.UserToSite
             *
             * @description
             *
             * Fetches belongsTo relation site.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - UserToSite id
             *
             *  - `options` – `{object=}` -
             *
             *  - `refresh` – `{boolean=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Site` object.)
             * </em>
             */
        R.site = function() {
          var TargetResource = $injector.get("Site");
          var action = TargetResource["::get::UserToSite::site"];
          return action.apply(R, arguments);
        };


        return R;
      }]);

/**
 * @ngdoc object
 * @name lbServices.BoilerState
 * @header lbServices.BoilerState
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `BoilerState` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
  module.factory(
    "BoilerState",
    [
      'LoopBackResource', 'LoopBackAuth', '$injector', '$q',
      function(LoopBackResource, LoopBackAuth, $injector, $q) {
        var R = LoopBackResource(
        urlBase + "/BoilerStates/:id",
          { 'id': '@id' },
          {

            /**
             * @ngdoc method
             * @name lbServices.BoilerState#create
             * @methodOf lbServices.BoilerState
             *
             * @description
             *
             * Create a new instance of the model and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerState` object.)
             * </em>
             */
            "create": {
              url: urlBase + "/BoilerStates",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.BoilerState#createMany
             * @methodOf lbServices.BoilerState
             *
             * @description
             *
             * Create a new instance of the model and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerState` object.)
             * </em>
             */
            "createMany": {
              isArray: true,
              url: urlBase + "/BoilerStates",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.BoilerState#find
             * @methodOf lbServices.BoilerState
             *
             * @description
             *
             * Find all instances of the model matched by filter from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"something":"value"})
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerState` object.)
             * </em>
             */
            "find": {
              isArray: true,
              url: urlBase + "/BoilerStates",
              method: "GET",
            },


                        /**
             * @ngdoc method
             * @name lbServices.BoilerState#findByBrand
             * @methodOf lbServices.BoilerState
             *
             * @description
             *
             * Find all instances of the model matched by filter from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `brand` – `{object=}` - Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"something":"value"})
             *
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerState` object.)
             * </em>
             */
              "findByBrand": {
                isArray: true,
                url: urlBase + "/BoilerStates/findByBrand",
                method: "GET",
              },

            /**
             * @ngdoc method
             * @name lbServices.BoilerState#deleteAll
             * @methodOf lbServices.BoilerState
             *
             * @description
             *
             * Private method, don't call this method.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `response` – `{object=}` -
             */
            "deleteAll": {
              url: urlBase + "/BoilerStates/all",
              method: "DELETE",
            },


            /**
             * @ngdoc method
             * @name lbServices.BoilerState#deleteMany
             * @methodOf lbServices.BoilerState
             *
             * @description
             *
             * Private method, don't call this method.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `response` – `{object=}` -
             */
             "deleteMany": {
              url: urlBase + "/BoilerStates/brandBS",
              method: "DELETE",
            },
          }
        );




        /**
        * @ngdoc property
        * @name lbServices.BoilerState#modelName
        * @propertyOf lbServices.BoilerState
        * @description
        * The name of the model represented by this $resource,
        * i.e. `BoilerState`.
        */
        R.modelName = "BoilerState";



        return R;
      }]);

/**
 * @ngdoc object
 * @name lbServices.BoilerStatus
 * @header lbServices.BoilerStatus
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `BoilerStatus` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
  module.factory(
    "BoilerStatus",
    [
      'LoopBackResource', 'LoopBackAuth', '$injector', '$q',
      function(LoopBackResource, LoopBackAuth, $injector, $q) {
        var R = LoopBackResource(
        urlBase + "/BoilerStatuses/:id",
          { 'id': '@id' },
          {

            /**
             * @ngdoc method
             * @name lbServices.BoilerStatus#create
             * @methodOf lbServices.BoilerStatus
             *
             * @description
             *
             * Create a new instance of the model and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerStatus` object.)
             * </em>
             */
            "create": {
              url: urlBase + "/BoilerStatuses",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.BoilerStatus#createMany
             * @methodOf lbServices.BoilerStatus
             *
             * @description
             *
             * Create a new instance of the model and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerStatus` object.)
             * </em>
             */
            "createMany": {
              isArray: true,
              url: urlBase + "/BoilerStatuses",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.BoilerStatus#find
             * @methodOf lbServices.BoilerStatus
             *
             * @description
             *
             * Find all instances of the model matched by filter from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"something":"value"})
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerStatus` object.)
             * </em>
             */
            "find": {
              isArray: true,
              url: urlBase + "/BoilerStatuses",
              method: "GET",
            },


                        /**
             * @ngdoc method
             * @name lbServices.BoilerStatus#findByBrand
             * @methodOf lbServices.BoilerStatus
             *
             * @description
             *
             * Find all instances of the model matched by filter from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `brand` – `{object=}` - Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"something":"value"})
             *
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerStatus` object.)
             * </em>
             */
            "findByBrand": {
              isArray: true,
              url: urlBase + "/BoilerStatuses/findByBrand",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.BoilerStatus#deleteAll
             * @methodOf lbServices.BoilerStatus
             *
             * @description
             *
             * Private method, don't call this method.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `response` – `{object=}` -
             */
            "deleteAll": {
              url: urlBase + "/BoilerStatuses/all",
              method: "DELETE",
            },


            /**
             * @ngdoc method
             * @name lbServices.BoilerStatus#deleteMany
             * @methodOf lbServices.BoilerStatus
             *
             * @description
             *
             * Private method, don't call this method.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `response` – `{object=}` -
             */
             "deleteMany": {
              url: urlBase + "/BoilerStatuses/brandBST",
              method: "DELETE",
            },
          }
        );




        /**
        * @ngdoc property
        * @name lbServices.BoilerStatus#modelName
        * @propertyOf lbServices.BoilerStatus
        * @description
        * The name of the model represented by this $resource,
        * i.e. `BoilerStatus`.
        */
        R.modelName = "BoilerStatus";



        return R;
      }]);

/**
 * @ngdoc object
 * @name lbServices.UserTitle
 * @header lbServices.UserTitle
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `UserTitle` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
  module.factory(
    "UserTitle",
    [
      'LoopBackResource', 'LoopBackAuth', '$injector', '$q',
      function(LoopBackResource, LoopBackAuth, $injector, $q) {
        var R = LoopBackResource(
        urlBase + "/UserTitles/:id",
          { 'id': '@id' },
          {

            /**
             * @ngdoc method
             * @name lbServices.UserTitle#create
             * @methodOf lbServices.UserTitle
             *
             * @description
             *
             * Create a new instance of the model and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `UserTitle` object.)
             * </em>
             */
            "create": {
              url: urlBase + "/UserTitles",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.UserTitle#createMany
             * @methodOf lbServices.UserTitle
             *
             * @description
             *
             * Create a new instance of the model and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `UserTitle` object.)
             * </em>
             */
            "createMany": {
              isArray: true,
              url: urlBase + "/UserTitles",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.UserTitle#find
             * @methodOf lbServices.UserTitle
             *
             * @description
             *
             * Find all instances of the model matched by filter from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"something":"value"})
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `UserTitle` object.)
             * </em>
             */
            "find": {
              isArray: true,
              url: urlBase + "/UserTitles",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.UserTitle#deleteAll
             * @methodOf lbServices.UserTitle
             *
             * @description
             *
             * Private method, don't call this method.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `response` – `{object=}` -
             */
            "deleteAll": {
              url: urlBase + "/UserTitles/all",
              method: "DELETE",
            },
          }
        );




        /**
        * @ngdoc property
        * @name lbServices.UserTitle#modelName
        * @propertyOf lbServices.UserTitle
        * @description
        * The name of the model represented by this $resource,
        * i.e. `UserTitle`.
        */
        R.modelName = "UserTitle";



        return R;
      }]);

/**
 * @ngdoc object
 * @name lbServices.BoilerNotification
 * @header lbServices.BoilerNotification
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `BoilerNotification` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
  module.factory(
    "BoilerNotification",
    [
      'LoopBackResource', 'LoopBackAuth', '$injector', '$q',
      function(LoopBackResource, LoopBackAuth, $injector, $q) {
        var R = LoopBackResource(
        urlBase + "/BoilerNotifications/:id",
          { 'id': '@id' },
          {

            // INTERNAL. Use BoilerNotification.boiler() instead.
            "prototype$__get__boiler": {
              url: urlBase + "/BoilerNotifications/:id/boiler",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.BoilerNotification#create
             * @methodOf lbServices.BoilerNotification
             *
             * @description
             *
             * Create a new instance of the model and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerNotification` object.)
             * </em>
             */
            "create": {
              url: urlBase + "/BoilerNotifications",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.BoilerNotification#createMany
             * @methodOf lbServices.BoilerNotification
             *
             * @description
             *
             * Create a new instance of the model and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerNotification` object.)
             * </em>
             */
            "createMany": {
              isArray: true,
              url: urlBase + "/BoilerNotifications",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.BoilerNotification#find
             * @methodOf lbServices.BoilerNotification
             *
             * @description
             *
             * Find all instances of the model matched by filter from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"something":"value"})
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerNotification` object.)
             * </em>
             */
            "find": {
              isArray: true,
              url: urlBase + "/BoilerNotifications",
              method: "GET",
            },
          }
        );




        /**
        * @ngdoc property
        * @name lbServices.BoilerNotification#modelName
        * @propertyOf lbServices.BoilerNotification
        * @description
        * The name of the model represented by this $resource,
        * i.e. `BoilerNotification`.
        */
        R.modelName = "BoilerNotification";


            /**
             * @ngdoc method
             * @name lbServices.BoilerNotification#boiler
             * @methodOf lbServices.BoilerNotification
             *
             * @description
             *
             * Fetches belongsTo relation boiler.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - BoilerNotification id
             *
             *  - `options` – `{object=}` -
             *
             *  - `refresh` – `{boolean=}` -
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Boiler` object.)
             * </em>
             */
        R.boiler = function() {
          var TargetResource = $injector.get("Boiler");
          var action = TargetResource["::get::BoilerNotification::boiler"];
          return action.apply(R, arguments);
        };


        return R;
      }]);

/**
 * @ngdoc object
 * @name lbServices.Device
 * @header lbServices.Device
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `Device` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
  module.factory(
    "Device",
    [
      'LoopBackResource', 'LoopBackAuth', '$injector', '$q',
      function(LoopBackResource, LoopBackAuth, $injector, $q) {
        var R = LoopBackResource(
        urlBase + "/Devices/:id",
          { 'id': '@id' },
          {

            // INTERNAL. Use User.devices.findById() instead.
            "::findById::User::devices": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/devices/:fk",
              method: "GET",
            },

            // INTERNAL. Use User.devices.destroyById() instead.
            "::destroyById::User::devices": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/devices/:fk",
              method: "DELETE",
            },

            // INTERNAL. Use User.devices.updateById() instead.
            "::updateById::User::devices": {
              params: {
                'fk': '@fk',
              },
              url: urlBase + "/users/:id/devices/:fk",
              method: "PUT",
            },

            // INTERNAL. Use User.devices() instead.
            "::get::User::devices": {
              isArray: true,
              url: urlBase + "/users/:id/devices",
              method: "GET",
            },

            // INTERNAL. Use User.devices.create() instead.
            "::create::User::devices": {
              url: urlBase + "/users/:id/devices",
              method: "POST",
            },

            // INTERNAL. Use User.devices.createMany() instead.
            "::createMany::User::devices": {
              isArray: true,
              url: urlBase + "/users/:id/devices",
              method: "POST",
            },

            // INTERNAL. Use User.devices.destroyAll() instead.
            "::delete::User::devices": {
              url: urlBase + "/users/:id/devices",
              method: "DELETE",
            },

            // INTERNAL. Use User.devices.count() instead.
            "::count::User::devices": {
              url: urlBase + "/users/:id/devices/count",
              method: "GET",
            },
          }
        );




        /**
        * @ngdoc property
        * @name lbServices.Device#modelName
        * @propertyOf lbServices.Device
        * @description
        * The name of the model represented by this $resource,
        * i.e. `Device`.
        */
        R.modelName = "Device";



        return R;
      }]);

/**
 * @ngdoc object
 * @name lbServices.BoilerImage
 * @header lbServices.BoilerImage
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `BoilerImage` model.
 *
 * **Details**
 *
 * Manages the images of the Boiler by model number.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
  module.factory(
    "BoilerImage",
    [
      'LoopBackResource', 'LoopBackAuth', '$injector', '$q',
      function(LoopBackResource, LoopBackAuth, $injector, $q) {
        var R = LoopBackResource(
        urlBase + "/BoilerImages/:id",
          { 'id': '@id' },
          {

            /**
             * @ngdoc method
             * @name lbServices.BoilerImage#find
             * @methodOf lbServices.BoilerImage
             *
             * @description
             *
             * Find all instances of the model matched by filter from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"something":"value"})
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerImage` object.)
             * </em>
             */
            "find": {
              isArray: true,
              url: urlBase + "/BoilerImages",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.BoilerImage#deleteById
             * @methodOf lbServices.BoilerImage
             *
             * @description
             *
             * Delete a model instance by {{id}} from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Model id
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerImage` object.)
             * </em>
             */
            "deleteById": {
              url: urlBase + "/BoilerImages/:id",
              method: "DELETE",
            },

            /**
             * @ngdoc method
             * @name lbServices.BoilerImage#view
             * @methodOf lbServices.BoilerImage
             *
             * @description
             *
             * Use this method to view the image of the boiler based on the name.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{string=}` -
             *
             *  - `req` – `{object=}` -
             *
             *  - `res` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerImage` object.)
             * </em>
             */
            "view": {
              url: urlBase + "/BoilerImages/view/:id",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.BoilerImage#upload
             * @methodOf lbServices.BoilerImage
             *
             * @description
             *
             * Use this method to upload the latest Boiler images based on image name in model data.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `req` – `{object=}` -
             *
             *  - `res` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `response` – `{object=}` -
             */
            "upload": {
              url: urlBase + "/BoilerImages/upload",
              method: "POST",
            },


            /**
             * @ngdoc method
             * @name lbServices.BoilerImage#findByBrand
             * @methodOf lbServices.BoilerImage
             *
             * @description
             *
             * Find all instances of the model matched by filter from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `brand` – `{object=}` - Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"something":"value"})
             *
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `ErrorCode` object.)
             * </em>
             */
            "findByBrand": {
              isArray: true,
              url: urlBase + "/BoilerImages/findByBrand",
              method: "GET",
            },
          }
        );



            /**
             * @ngdoc method
             * @name lbServices.BoilerImage#destroyById
             * @methodOf lbServices.BoilerImage
             *
             * @description
             *
             * Delete a model instance by {{id}} from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Model id
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerImage` object.)
             * </em>
             */
        R["destroyById"] = R["deleteById"];

            /**
             * @ngdoc method
             * @name lbServices.BoilerImage#removeById
             * @methodOf lbServices.BoilerImage
             *
             * @description
             *
             * Delete a model instance by {{id}} from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{*}` - Model id
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `BoilerImage` object.)
             * </em>
             */
        R["removeById"] = R["deleteById"];


        /**
        * @ngdoc property
        * @name lbServices.BoilerImage#modelName
        * @propertyOf lbServices.BoilerImage
        * @description
        * The name of the model represented by this $resource,
        * i.e. `BoilerImage`.
        */
        R.modelName = "BoilerImage";



        return R;
      }]);

/**
 * @ngdoc object
 * @name lbServices.Weather
 * @header lbServices.Weather
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `Weather` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
  module.factory(
    "Weather",
    [
      'LoopBackResource', 'LoopBackAuth', '$injector', '$q',
      function(LoopBackResource, LoopBackAuth, $injector, $q) {
        var R = LoopBackResource(
        urlBase + "/Weather/:id",
          { 'id': '@id' },
          {

            /**
             * @ngdoc method
             * @name lbServices.Weather#zip
             * @methodOf lbServices.Weather
             *
             * @description
             *
             * Use this method to fetch the weather by zip code.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `id` – `{string=}` -
             *
             *  - `req` – `{object=}` -
             *
             *  - `res` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `Weather` object.)
             * </em>
             */
            "zip": {
              url: urlBase + "/Weather/zip/:id",
              method: "GET",
            },
          }
        );




        /**
        * @ngdoc property
        * @name lbServices.Weather#modelName
        * @propertyOf lbServices.Weather
        * @description
        * The name of the model represented by this $resource,
        * i.e. `Weather`.
        */
        R.modelName = "Weather";



        return R;
      }]);

/**
 * @ngdoc object
 * @name lbServices.RelayText
 * @header lbServices.RelayText
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `RelayText` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
  module.factory(
    "RelayText",
    [
      'LoopBackResource', 'LoopBackAuth', '$injector', '$q',
      function(LoopBackResource, LoopBackAuth, $injector, $q) {
        var R = LoopBackResource(
        urlBase + "/RelayTexts/:id",
          { 'id': '@id' },
          {

            /**
             * @ngdoc method
             * @name lbServices.RelayText#create
             * @methodOf lbServices.RelayText
             *
             * @description
             *
             * Create a new instance of the model and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `RelayText` object.)
             * </em>
             */
            "create": {
              url: urlBase + "/RelayTexts",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.RelayText#createMany
             * @methodOf lbServices.RelayText
             *
             * @description
             *
             * Create a new instance of the model and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `RelayText` object.)
             * </em>
             */
            "createMany": {
              isArray: true,
              url: urlBase + "/RelayTexts",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.RelayText#find
             * @methodOf lbServices.RelayText
             *
             * @description
             *
             * Find all instances of the model matched by filter from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"something":"value"})
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `RelayText` object.)
             * </em>
             */
            "find": {
              isArray: true,
              url: urlBase + "/RelayTexts",
              method: "GET",
            },


                        /**
             * @ngdoc method
             * @name lbServices.RelayText#findByBrand
             * @methodOf lbServices.RelayText
             *
             * @description
             *
             * Find all instances of the model matched by filter from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"something":"value"})
             *
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `RelayText` object.)
             * </em>
             */
              "findByBrand": {
                isArray: true,
                url: urlBase + "/RelayTexts/findByBrand",
                method: "GET",
              },

            /**
             * @ngdoc method
             * @name lbServices.RelayText#deleteAll
             * @methodOf lbServices.RelayText
             *
             * @description
             *
             * Private method, don't call this method.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `response` – `{object=}` -
             */
            "deleteAll": {
              url: urlBase + "/RelayTexts/all",
              method: "DELETE",
            },

            /**
             * @ngdoc method
             * @name lbServices.RelayText#deleteMany
             * @methodOf lbServices.RelayText
             *
             * @description
             *
             * Private method, don't call this method.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `response` – `{object=}` -
             */
             "deleteMany": {
              url: urlBase + "/RelayTexts/brandRT",
              method: "DELETE",
            },
          }
        );




        /**
        * @ngdoc property
        * @name lbServices.RelayText#modelName
        * @propertyOf lbServices.RelayText
        * @description
        * The name of the model represented by this $resource,
        * i.e. `RelayText`.
        */
        R.modelName = "RelayText";



        return R;
      }]);

/**
 * @ngdoc object
 * @name lbServices.ActiveModeDemand
 * @header lbServices.ActiveModeDemand
 * @object
 *
 * @description
 *
 * A $resource object for interacting with the `ActiveModeDemand` model.
 *
 * ## Example
 *
 * See
 * {@link http://docs.angularjs.org/api/ngResource.$resource#example $resource}
 * for an example of using this object.
 *
 */
  module.factory(
    "ActiveModeDemand",
    [
      'LoopBackResource', 'LoopBackAuth', '$injector', '$q',
      function(LoopBackResource, LoopBackAuth, $injector, $q) {
        var R = LoopBackResource(
        urlBase + "/ActiveModeDemands/:id",
          { 'id': '@id' },
          {

            /**
             * @ngdoc method
             * @name lbServices.ActiveModeDemand#create
             * @methodOf lbServices.ActiveModeDemand
             *
             * @description
             *
             * Create a new instance of the model and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `ActiveModeDemand` object.)
             * </em>
             */
            "create": {
              url: urlBase + "/ActiveModeDemands",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.ActiveModeDemand#createMany
             * @methodOf lbServices.ActiveModeDemand
             *
             * @description
             *
             * Create a new instance of the model and persist it into the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {Object} postData Request data.
             *
             *  - `data` – `{object=}` - Model instance data
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `ActiveModeDemand` object.)
             * </em>
             */
            "createMany": {
              isArray: true,
              url: urlBase + "/ActiveModeDemands",
              method: "POST",
            },

            /**
             * @ngdoc method
             * @name lbServices.ActiveModeDemand#find
             * @methodOf lbServices.ActiveModeDemand
             *
             * @description
             *
             * Find all instances of the model matched by filter from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `filter` – `{object=}` - Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"something":"value"})
             *
             *  - `options` – `{object=}` -
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `ActiveModeDemand` object.)
             * </em>
             */
            "find": {
              isArray: true,
              url: urlBase + "/ActiveModeDemands",
              method: "GET",
            },


                        /**
             * @ngdoc method
             * @name lbServices.ActiveModeDemand#findByBrand
             * @methodOf lbServices.ActiveModeDemand
             *
             * @description
             *
             * Find all instances of the model matched by filter from the data source.
             *
             * @param {Object=} parameters Request parameters.
             *
             *  - `brand` – `{object=}` - Filter defining fields, where, include, order, offset, and limit - must be a JSON-encoded string ({"something":"value"})
             *
             *
             * @param {function(Array.<Object>,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Array.<Object>} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * <em>
             * (The remote method definition does not provide any description.
             * This usually means the response is a `ActiveModeDemand` object.)
             * </em>
             */
            "findByBrand": {
              isArray: true,
              url: urlBase + "/ActiveModeDemands/findByBrand",
              method: "GET",
            },

            /**
             * @ngdoc method
             * @name lbServices.ActiveModeDemand#deleteAll
             * @methodOf lbServices.ActiveModeDemand
             *
             * @description
             *
             * Private method, don't call this method.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `response` – `{object=}` -
             */
            "deleteAll": {
              url: urlBase + "/ActiveModeDemands/all",
              method: "DELETE",
            },

            /**
             * @ngdoc method
             * @name lbServices.ActiveModeDemand#deleteMany
             * @methodOf lbServices.ActiveModeDemand
             *
             * @description
             *
             * Private method, don't call this method.
             *
             * @param {Object=} parameters Request parameters.
             *
             *   This method does not accept any parameters.
             *   Supply an empty object or omit this argument altogether.
             *
             * @param {function(Object,Object)=} successCb
             *   Success callback with two arguments: `value`, `responseHeaders`.
             *
             * @param {function(Object)=} errorCb Error callback with one argument:
             *   `httpResponse`.
             *
             * @returns {Object} An empty reference that will be
             *   populated with the actual data once the response is returned
             *   from the server.
             *
             * Data properties:
             *
             *  - `response` – `{object=}` -
             */
             "deleteMany": {
              url: urlBase + "/ActiveModeDemands/brandAMD",
              method: "DELETE",
            },
          }
        );




        /**
        * @ngdoc property
        * @name lbServices.ActiveModeDemand#modelName
        * @propertyOf lbServices.ActiveModeDemand
        * @description
        * The name of the model represented by this $resource,
        * i.e. `ActiveModeDemand`.
        */
        R.modelName = "ActiveModeDemand";



        return R;
      }]);

      module.factory(
        "DestoryUser",
        [
          'LoopBackResource', 'LoopBackAuth', '$injector', '$q',
          function(LoopBackResource, LoopBackAuth, $injector, $q) {
            var R = LoopBackResource(
            urlBase + "/users/:id/rolesnew",
              { 'id': '@id' },
              {

                /**
                 * @ngdoc method
                 * @name lbServices.DeleteUser#user
                 * @methodOf lbServices.DeleteUser
                 *
                 * @description
                 *
                 * Use this method to delete user.
                 *
                 * @param {Object=} parameters Request parameters.
                 *
                 *  - `id` – `{string=}` -
                 *
                 *  - `req` – `{object=}` -
                 *
                 *  - `res` – `{object=}` -
                 *
                 * @param {function(Object,Object)=} successCb
                 *   Success callback with two arguments: `value`, `responseHeaders`.
                 *
                 * @param {function(Object)=} errorCb Error callback with one argument:
                 *   `httpResponse`.
                 *
                 * @returns {Object} An empty reference that will be
                 *   populated with the actual data once the response is returned
                 *   from the server.
                 *
                 * <em>
                 * (The remote method definition does not provide any description.
                 * This usually means the response is a `DestoryUser` object.)
                 * </em>
                 */
                "userdelete": {
                  url: urlBase + "/users/:id/rolesnew",
                  method: "DELETE",
                },
              }
            );

          /**
            * @ngdoc property
            * @name lbServices.DestoryUser#modelName
            * @propertyOf lbServices.DestoryUser
            * @description
            * The name of the model represented by this $resource,
            * i.e. `DestoryUser`.
            */
          R.modelName = "DestoryUser";

          return R;
        }]);


  module
  .factory('LoopBackAuth', function() {
    var props = ['accessTokenId', 'currentUserId', 'rememberMe'];
    var propsPrefix = '$LoopBack$';

    function LoopBackAuth() {
      var self = this;
      props.forEach(function(name) {
        self[name] = load(name);
      });
      this.currentUserData = null;
    }

    LoopBackAuth.prototype.save = function() {
      var self = this;
      var storage = this.rememberMe ? localStorage : sessionStorage;
      props.forEach(function(name) {
        save(storage, name, self[name]);
      });
    };

    LoopBackAuth.prototype.setUser = function(accessTokenId, userId, userData) {
      this.accessTokenId = accessTokenId;
      this.currentUserId = userId;
      this.currentUserData = userData;
    };

    LoopBackAuth.prototype.clearUser = function() {
      this.accessTokenId = null;
      this.currentUserId = null;
      this.currentUserData = null;
    };

    LoopBackAuth.prototype.clearStorage = function() {
      props.forEach(function(name) {
        save(sessionStorage, name, null);
        save(localStorage, name, null);
      });
    };

    return new LoopBackAuth();

    // Note: LocalStorage converts the value to string
    // We are using empty string as a marker for null/undefined values.
    function save(storage, name, value) {
      try {
        var key = propsPrefix + name;
        if (value == null) value = '';
        storage[key] = value;
      } catch (err) {
        console.log('Cannot access local/session storage:', err);
      }
    }

    function load(name) {
      var key = propsPrefix + name;
      return localStorage[key] || sessionStorage[key] || null;
    }
  })
  .config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('LoopBackAuthRequestInterceptor');
  }])
  .factory('LoopBackAuthRequestInterceptor', ['$q', 'LoopBackAuth',
    function($q, LoopBackAuth) {
      return {
        'request': function(config) {
          // filter out external requests
          var host = getHost(config.url);
          if (host && config.url.indexOf(urlBaseHost) === -1) {
            return config;
          }

          if (LoopBackAuth.accessTokenId) {
            config.headers[authHeader] = LoopBackAuth.accessTokenId;
          } else if (config.__isGetCurrentUser__) {
            // Return a stub 401 error for User.getCurrent() when
            // there is no user logged in
            var res = {
              body: { error: { status: 401 }},
              status: 401,
              config: config,
              headers: function() { return undefined; },
            };
            return $q.reject(res);
          }
          return config || $q.when(config);
        },
      };
    }])

  /**
   * @ngdoc object
   * @name lbServices.LoopBackResourceProvider
   * @header lbServices.LoopBackResourceProvider
   * @description
   * Use `LoopBackResourceProvider` to change the global configuration
   * settings used by all models. Note that the provider is available
   * to Configuration Blocks only, see
   * {@link https://docs.angularjs.org/guide/module#module-loading-dependencies Module Loading & Dependencies}
   * for more details.
   *
   * ## Example
   *
   * ```js
   * angular.module('app')
   *  .config(function(LoopBackResourceProvider) {
   *     LoopBackResourceProvider.setAuthHeader('X-Access-Token');
   *  });
   * ```
   */
  .provider('LoopBackResource', function LoopBackResourceProvider() {
    /**
     * @ngdoc method
     * @name lbServices.LoopBackResourceProvider#setAuthHeader
     * @methodOf lbServices.LoopBackResourceProvider
     * @param {string} header The header name to use, e.g. `X-Access-Token`
     * @description
     * Configure the REST transport to use a different header for sending
     * the authentication token. It is sent in the `Authorization` header
     * by default.
     */
    this.setAuthHeader = function(header) {
      authHeader = header;
    };

    /**
     * @ngdoc method
     * @name lbServices.LoopBackResourceProvider#getAuthHeader
     * @methodOf lbServices.LoopBackResourceProvider
     * @description
     * Get the header name that is used for sending the authentication token.
     */
    this.getAuthHeader = function() {
      return authHeader;
    };

    /**
     * @ngdoc method
     * @name lbServices.LoopBackResourceProvider#setUrlBase
     * @methodOf lbServices.LoopBackResourceProvider
     * @param {string} url The URL to use, e.g. `/api` or `//example.com/api`.
     * @description
     * Change the URL of the REST API server. By default, the URL provided
     * to the code generator (`lb-ng` or `grunt-loopback-sdk-angular`) is used.
     */
    this.setUrlBase = function(url) {
      urlBase = url;
      urlBaseHost = getHost(urlBase) || location.host;
    };

    /**
     * @ngdoc method
     * @name lbServices.LoopBackResourceProvider#getUrlBase
     * @methodOf lbServices.LoopBackResourceProvider
     * @description
     * Get the URL of the REST API server. The URL provided
     * to the code generator (`lb-ng` or `grunt-loopback-sdk-angular`) is used.
     */
    this.getUrlBase = function() {
      return urlBase;
    };

    this.$get = ['$resource', function($resource) {
      var LoopBackResource = function(url, params, actions) {
        var resource = $resource(url, params, actions);

        // Angular always calls POST on $save()
        // This hack is based on
        // http://kirkbushell.me/angular-js-using-ng-resource-in-a-more-restful-manner/
        resource.prototype.$save = function(success, error) {
          // Fortunately, LoopBack provides a convenient `upsert` method
          // that exactly fits our needs.
          var result = resource.upsert.call(this, {}, this, success, error);
          return result.$promise || result;
        };
        return resource;
      };

      LoopBackResource.getUrlBase = function() {
        return urlBase;
      };

      LoopBackResource.getAuthHeader = function() {
        return authHeader;
      };

      return LoopBackResource;
    }];
  });
})(window, window.angular);
