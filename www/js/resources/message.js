angular.module('app.messageResource', [])
    .factory('messageRes', function ($resource, SERVER_CONF, OAUTH_CONF, userDatastore) {

        return $resource(SERVER_CONF.API_HOST + 'messages', null, {
            sendSms:{
                method: 'POST',
                url: SERVER_CONF.API_HOST + 'messages/sms',
                params: null,
                headers: {
                    Authorization: 'Bearer ' + userDatastore.getTokens().accessToken
                }
            }
        });

    });
