angular.module('app.user', [])
    .factory('user', function (OAUTH_CONF, customer, userDatastore) {
        function getProfile() {
            return {
                name: window.localStorage.getItem('name'),
                image: window.localStorage.getItem('image')
            };
        }

        function register(registrationData) {
            return customer.save(registrationData).$promise
                .then(function (response) {
                    userDatastore.setNumber(registrationData.username);
                    userDatastore.setVerified(1);
                    userDatastore.setCustomerId(response.customer);
                });
        }

        function verifyCode(code) {
            var confirmationData = {
                customer: userDatastore.getCustomerId(),
                confirmationCode: code
            };
            return customer.confirm(confirmationData).$promise
                .then(function (response) {
                    userDatastore.setVerified(2);
                    userDatastore.setPassword(response.password);
                    requestAccessToken();
                });
        }

        function requestAccessToken() {
            var authData = {
                client_id: OAUTH_CONF.CLIENT_ID,
                client_secret: OAUTH_CONF.CLIENT_SECRET,
                grant_type: 'password',
                redirect_uri: 'www.mum.com'
            };
            return customer.requestAccessToken(authData).$promise
                .then(function (response) {
                    userDatastore.setTokens(response.access_token, response.refresh_token);
                });
        }

        function refreshAccessToken() {
            if (userDatastore.isRefreshingAccessToken() == 0 && userDatastore.isVerified()) {
                userDatastore.setRefreshingAccessToken(1);
                var authData = {
                    client_id: OAUTH_CONF.CLIENT_ID,
                    client_secret: OAUTH_CONF.CLIENT_SECRET,
                    grant_type: 'refresh_token',
                    redirect_uri: 'www.mum.com',
                    refresh_token: userDatastore.getTokens().refreshToken
                };
                return customer.refreshAccessToken(authData).$promise
                    .then(function (response) {
                        userDatastore.setTokens(response.access_token, response.refresh_token);
                        userDatastore.setRefreshingAccessToken(0);
                    })
                    .catch(function () {
                        requestAccessToken(function () {
                            userDatastore.setRefreshingAccessToken(0);
                        }, function () {
                            userDatastore.setRefreshingAccessToken(0);
                        });
                    });

                // refresh access_token every minute
                setInterval(refreshAccessToken, OAUTH_CONF.REFRESH_INTERVAL);
            }
        }

        // refresh access_token at start
        refreshAccessToken();

        return {
            getVerified: userDatastore.getVerified,
            isVerified: userDatastore.isVerified,
            verifyCode: verifyCode,
            getProfile: getProfile,
            register: register
        };
    });
