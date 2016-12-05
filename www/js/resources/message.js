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
                },
                getInstants: {
                    method: 'GET',
                    url: SERVER_CONF.API_HOST + 'messages/instant',
                    params: null,
                    headers: {
                        Authorization: 'Bearer ' + token
                    }
                },
                notifyReceived: {
                    method: 'PUT',
                    url: SERVER_CONF.API_HOST + 'messages/instant/:messageId/received',
                    headers: {
                        Authorization: 'Bearer ' + token
                    }
                },
                deleteMessageRes: {
                    method: 'DELETE',
                    url: SERVER_CONF.API_HOST + 'messages/:messageId/delete',
                    headers: {
                        Authorization: 'Bearer ' + token
                    }
                },
                patchMessageRes: {
                    method: 'PATCH',
                    url: SERVER_CONF.API_HOST + 'messages/:messageId/update',
                    headers: {
                        Authorization: 'Bearer ' + token
                    },
                    params: {message: '@message'}
                },
                patchEmailRes: {
                    method: 'PATCH',
                    url: SERVER_CONF.API_HOST + 'messages/email/:messageId/update',
                    headers: {
                        Authorization: 'Bearer ' + token
                    },
                    params: {message: '@message'}
                }
            });
        }
    });
