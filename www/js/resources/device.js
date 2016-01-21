angular.module('app.device', [])
    .factory('device', function ($resource, SERVER_CONF, OAUTH_CONF, userDatastore) {
        return function (token) {
            return $resource(SERVER_CONF.API_HOST + 'devices/:device', {device: '@device'}, {
                save: {
                    method: 'POST',
                    headers: {
                        Authorization: 'Bearer ' + ((token !== null && token !== undefined) ? token : userDatastore.getTokens().accessToken)
                    }
                }
            });
        };
    });
