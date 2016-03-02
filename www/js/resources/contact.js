angular.module('app.contactRes', [])
    .factory('contact', function ($resource, SERVER_CONF) {
        return $resource(SERVER_CONF.API_HOST + 'customers/me/contacts', {}, {
            save: {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + window.localStorage.getItem('accessToken')
                }
            }
        });
    });
