angular.module('app.resources', [])
    .factory('customer', function ($resource, SERVER_CONF, OAUTH_CONF, userDatastore) {
        return $resource(SERVER_CONF.API_HOST + 'customers/:customer', {customer: '@customer'}, {
            confirm: {
                method: 'POST',
                url: SERVER_CONF.API_HOST + 'customers/:customer/confirms/:confirmation_code',
                params: {customer: '@customer', confirmation_code: '@confirmationCode'}
            },
            requestAccessToken: {
                method: 'GET',
                url: OAUTH_CONF.OAUTH_HOST + 'token',
                headers: {
                    username: userDatastore.getNumber,
                    password: userDatastore.getPassword
                }
            },
            refreshAccessToken: {
                method: 'GET',
                url: OAUTH_CONF.OAUTH_HOST + 'token',
                headers: {
                    username: userDatastore.getNumber,
                    password: userDatastore.getPassword
                }
            }
        });
    });
