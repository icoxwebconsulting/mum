angular.module('app.messageResource', [])
    .factory('messageRes', function ($resource, SERVER_CONF) {

        return $resource(SERVER_CONF.API_HOST + 'messages', null, {
            sendSms:{
                method: 'POST',
                url: SERVER_CONF.API_HOST + 'messages/sms',
                params: null,
                headers: {
                    Authorization: 'Bearer ' + window.localStorage.getItem('accessToken')
                }
            },
            sendEmail:{
                method: 'POST',
                url: SERVER_CONF.API_HOST + 'messages/email',
                params: null,
                headers: {
                    Authorization: 'Bearer ' + window.localStorage.getItem('accessToken')
                }
            }
        });

    });
