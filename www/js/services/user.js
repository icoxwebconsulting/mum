angular.module('app.user', [])
    .factory('user', function ($q, OAUTH_CONF, customer, userDatastore, device, deviceDatastore, pushNotification, Contacts) {
        function register(registrationData) {
            return customer().save(registrationData).$promise
                .then(function (response) {
                    userDatastore.setVerified(1);
                    userDatastore.setCustomerId(response.customer);
                    userDatastore.setCountryCode(registrationData.countryCode)
                });
        }

        function registerDevice() {
            return pushNotification.register()
                .then(function (deviceToken) {
                    var data = {
                        token: deviceToken,
                        os: 'Android'
                    };
                    return device(userDatastore.getTokens().accessToken).save(data).$promise;
                })
                .then(function (response) {
                    deviceDatastore.setDeviceId(response.device);
                });
        }

        function verifyCode(code) {
            var confirmationData = {
                customer: userDatastore.getCustomerId(),
                confirmationCode: code
            };
            return customer().confirm(confirmationData).$promise
                .then(function (response) {
                    userDatastore.setVerified(2);
                    userDatastore.setNumber(response.username);
                    userDatastore.setPassword(response.password);
                    requestAccessToken()
                        .then(function () {
                            Contacts.loadContacts();
                            return registerDevice();
                        });
                });
        }

        function requestAccessToken() {
            var authData = {
                client_id: OAUTH_CONF.CLIENT_ID,
                client_secret: OAUTH_CONF.CLIENT_SECRET,
                grant_type: 'password',
                redirect_uri: 'www.mum.com'
            };
            return customer(userDatastore.getNumber(), userDatastore.getPassword()).requestAccessToken(authData).$promise
                .then(function (response) {
                    userDatastore.setTokens(response.access_token, response.refresh_token);
                });
        }

        function refreshAccessToken() {
            var deferred = $q.defer();

            // refresh access_token every minute
            setInterval(refreshAccessToken, OAUTH_CONF.REFRESH_INTERVAL);

            if (userDatastore.isRefreshingAccessToken() == 0 && userDatastore.isVerified()) {
                userDatastore.setRefreshingAccessToken(1);
                var authData = {
                    client_id: OAUTH_CONF.CLIENT_ID,
                    client_secret: OAUTH_CONF.CLIENT_SECRET,
                    grant_type: 'refresh_token',
                    redirect_uri: 'www.mum.com',
                    refresh_token: userDatastore.getTokens().refreshToken
                };
                return customer(userDatastore.getNumber(), userDatastore.getPassword()).refreshAccessToken(authData).$promise
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
            } else {
                deferred.resolve(true);
            }

            return deferred.promise;
        }

        function setProfile(displayName, avatarData, avatarMimeType) {
            var params = {
                customer: userDatastore.getCustomerId()
            };
            var profileData = {
                displayName: displayName,
                avatarData: avatarData,
                avatarMimeType: avatarMimeType
            };
            return customer.setProfile(params, profileData).$promise
                .then(function (response) {
                    userDatastore.setProfile(response.display_name, response.avatar_url);
                });
        }

        function getProfile() {
            var profile = userDatastore.getProfile();
            if (profile.avatarURL == null ||
                profile.avatarURL == undefined ||
                profile.avatarURL == 'undefined') {
                profile.avatarURL = 'img/person.png';
            }
            if (profile.displayName == null ||
                profile.displayName == undefined ||
                profile.displayName == 'undefined') {
                profile.displayName = userDatastore.getNumber();
            }
            return profile;
        }

        return {
            getVerified: userDatastore.getVerified,
            isVerified: userDatastore.isVerified,
            refreshAccessToken: refreshAccessToken,
            setProfile: setProfile,
            verifyCode: verifyCode,
            register: register,
            getProfile: getProfile
        };
    });
