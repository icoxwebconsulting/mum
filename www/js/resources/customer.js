angular.module('app.resources', []).factory('customer', function ($resource, SERVER_CONF, userDatastore) {
    return $resource(SERVER_CONF.API_HOST + 'customers/:customer', {customer: '@customer'}, {
        confirm: {
            method: 'POST',
            url: SERVER_CONF.API_HOST + 'customers/:customer/confirms/:confirmation_code',
            params: {customer: '@customer', confirmation_code: '@confirmationCode'}
        },
        requestAccessToken: {
            method: 'GET',
            url: SERVER_CONF.OAUTH_HOST + 'token',
            transformRequest: function (data, headers) {
                console.log(headers);
                headers.username = userDatastore.getNumber();
                headers.password = userDatastore.getPassword();
                console.log(headers);
                return data;
            }
        }
    });
});
