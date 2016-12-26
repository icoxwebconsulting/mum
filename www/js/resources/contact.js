angular.module('app.contactRes', [])
    .factory('contact', function ($resource, SERVER_CONF) {
        return function (token) {
            if (token === null || token === undefined) {
                throw new Error('access token need to be provided');
            }

            return $resource(SERVER_CONF.API_HOST + 'customers/me/contacts', {}, {
                save: {
                    method: 'POST',
                    headers: {
                        Authorization: 'Bearer ' + token
                    }
                },
                contactProfile: {
                    method: 'GET',
                    url: SERVER_CONF.API_HOST + 'customers/me/contactsProfile',
                    isArray: true,
                    headers: {
                        Authorization: 'Bearer ' + token
                    }
                }
            });
        }
    });
