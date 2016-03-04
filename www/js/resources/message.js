angular.module('app.messageResource', [])
    .factory('messageRes', function ($resource, SERVER_CONF) {
        return function (token) {
            if (token === null || token === undefined) {
                throw new Error('access token need to be provided');
            }

            return $resource(SERVER_CONF.API_HOST + 'messages', null, {
                sendSms: {
                    method: 'POST',
                    url: SERVER_CONF.API_HOST + 'messages/sms',
                    params: null,
                    headers: {
                        Authorization: 'Bearer ' + token
                    }
                },
                sendEmail: {
                    method: 'POST',
                    url: SERVER_CONF.API_HOST + 'messages/email',
                    params: null,
                    headers: {
                        Authorization: 'Bearer ' + token
                    }
                },
                sendInstant: {
                    method: 'POST',
                    url: SERVER_CONF.API_HOST + 'messages/instant',
                    params: null,
                    headers: {
                        Authorization: 'Bearer ' + token
                    }
                }
            });
        }
    });
