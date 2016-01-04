angular.module('app.user', [])
    .factory('user', function (OAUTH_CONF, customer, userDatastore) {
        function getProfile() {
            return {
                name: window.localStorage.getItem('name'),
                image: window.localStorage.getItem('image')
            };
        }

        function register(registrationData, successCallback, failCallback) {
            customer.save(registrationData, function (response) {
                userDatastore.setNumber(registrationData.username);
                userDatastore.setVerified(1);
                userDatastore.setCustomerId(response.customer);
                successCallback();
            }, failCallback);
        }

        function verifyCode(code, successCallback, failCallback) {
            var confirmationData = {
                customer: userDatastore.getCustomerId(),
                confirmationCode: code
            };
            customer.confirm(confirmationData, function (response) {
                userDatastore.setVerified(2);
                userDatastore.setPassword(response.password);
                requestAccessToken(successCallback, failCallback);
            }, failCallback);
        }

        function requestAccessToken(successCallback, failCallback) {
            var authData = {
                client_id: OAUTH_CONF.CLIENT_ID,
                client_secret: OAUTH_CONF.CLIENT_SECRET,
                grant_type: 'password',
                redirect_uri: 'www.mum.com'
            };
            customer.requestAccessToken(authData,
                function (response) {
                    userDatastore.setTokens(response.access_token, response.refresh_token);
                    successCallback();
                }, failCallback);
        }

        function refreshAccessToken(successCallback, failCallback) {
            if (successCallback === null || successCallback === undefined) {
                successCallback = function () {
                };
            }

            if (failCallback === null || failCallback === undefined) {
                failCallback = function () {
                };
            }

            if (userDatastore.isRefreshingAccessToken() == 0) {
                userDatastore.setRefreshingAccessToken(1);
                var authData = {
                    client_id: OAUTH_CONF.CLIENT_ID,
                    client_secret: OAUTH_CONF.CLIENT_SECRET,
                    grant_type: 'refresh_token',
                    redirect_uri: 'www.mum.com',
                    refresh_token: userDatastore.getTokens().refreshToken
                };
                customer.refreshAccessToken(authData,
                    function (response) {
                        userDatastore.setTokens(response.access_token, response.refresh_token);
                        userDatastore.setRefreshingAccessToken(0);
                        successCallback();
                    },
                    function () {
                        requestAccessToken(function () {
                            userDatastore.setRefreshingAccessToken(0);
                            successCallback();
                        }, function () {
                            userDatastore.setRefreshingAccessToken(0);
                            failCallback();
                        });
                    });

                // refresh access_token every minute
                setInterval(refreshAccessToken, OAUTH_CONF.REFRESH_INTERVAL);
            }
        }

        // refresh access_token at start
        refreshAccessToken();

        return {
            isVerified: userDatastore.isVerified,
            verifyCode: verifyCode,
            getProfile: getProfile,
            register: register
        };
    });
