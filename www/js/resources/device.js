angular.module('app.device', [])
    .factory('device', function ($resource, SERVER_CONF) {
        return function (token) {
            if (token === null || token === undefined) {
                throw new Error('access token need to be provided');
            }

            return $resource(SERVER_CONF.API_HOST + 'devices/:device', {device: '@device'}, {
                save: {
                    method: 'POST',
                    headers: {
                        Authorization: 'Bearer ' + token
                    }
                }
            });
        };
    });
