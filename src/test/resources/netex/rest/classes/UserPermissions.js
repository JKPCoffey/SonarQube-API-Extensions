define([
    'jscore/core',
    'jscore/ext/net'
], function (core, net) {

    var UserPermissions = function (options) {
        this.options = options;
    };

    UserPermissions.prototype = {

        REST_USERPROFILE: '/editprofile', // {username:{String},firstName:{String},lastName:{String},email:{String},userType:{String},status:{String},_id:{String},_rev:{String},isMemberOf:{String},lastLogin:{String}}
        REST_USERPRIVILEGES: '/oss/idm/usermanagement/users/%s/privileges',


        /**
         * Main method to retrieve user permissions. In the options parameter are registered both
         * the callback in case of success and the one in case of failure.
         *
         * Uses:
         *  - this.currentUser
         *
         * @method  fetch
         * @param options {Object} callback result in format:
         *                 {
         *                    success: <callback in case of success>,
         *                    error: <callback in case of error>
         *                 }
         */
        fetch: function ( options ) {
            if(!this.currentUser) {
                net.ajax({
                    url: this.REST_USERPROFILE,
                    type: 'GET',
                    dataType: 'json',
                    success: function(userProfile){
                        this.currentUser = userProfile.username;
                        this.fetchPermissions(options);
                    }.bind(this),
                    error: function(e, xhr){
                        options.error(e, xhr);
                    }.bind(this)
                });
            }
            else {
                this.fetchPermissions(options);
            }
        },


        /**
         * This methods retrieve the user permissions from server.
         * It is called by fetch in case of successful get of user Id.
         *
         * Uses:
         *  - this.currentUser
         *  - this.userPermissions
         *
         * @private
         * @method   fetchPermissions
         * @param options {Object} callback result in format:
         *                 {
         *                    success: <callback in case of success>,
         *                    error: <callback in case of error>
         *                 }
         */
        fetchPermissions: function( options ) {
            if (!this.userPermissions) {
                net.ajax({
                    url: this.REST_USERPRIVILEGES.replace('%s', this.currentUser),
                    type: 'GET',
                    dataType: 'json',
                    success: function(userPermissions){
                        this.userPermissions = userPermissions;
                        options.success();
                    }.bind(this),
                    error: function(e, xhr){
                        options.error(e, xhr);
                    }.bind(this)
                });
            } else {
                options.success();
            }
        },



        /**
         * This method check whether the user is adminstrator.
         *
         * Uses:
         *  - this.userPermissions
         *
         * @method   isAdministrator
         * @return {boolean} TRUE in case of adminstrator.
         */
        isAdministrator: function() {
            if( this.userPermissions !== undefined ) {
                for( var i=0; i<this.userPermissions.length; i++) {
                    if( this.userPermissions[i].role === 'ADMINISTRATOR' ) {
                        return true;
                    }
                }
            }

            return false;
        }


    };

    return UserPermissions;

});