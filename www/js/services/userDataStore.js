angular.module('app.userDataStore', [])
    .factory('userDatastore', function () {
        function getVerified() {
            return window.localStorage.getItem('verified') || 0;
        }

        function isVerified() {
            return getVerified() == 2;
        }

        function setVerified(status) {
            status = status || 0;
            window.localStorage.setItem('verified', status);
        }

        function setNumber(number) {
            window.localStorage.setItem('number', number);
        }

        function getNumber() {
            return window.localStorage.getItem('number');
        }

        function setPassword(password) {
            window.localStorage.setItem('password', password);
        }

        function getPassword() {
            return window.localStorage.getItem('password');
        }

        function setCustomerId(id) {
            window.localStorage.setItem('customer_id', id);
        }

        function getCustomerId() {
            return window.localStorage.getItem('customer_id');
        }

        function setTokens(accessToken, refreshToken) {
            window.localStorage.setItem('access_token', accessToken);
            window.localStorage.setItem('refresh_token', refreshToken);
        }

        function getTokens() {
            return {
                accessToken: window.localStorage.getItem('access_token'),
                refreshToken: window.localStorage.getItem('refresh_token')
            };
        }

        function isRefreshingAccessToken() {
            return window.localStorage.getItem('refreshingAccessToken') || false;
        }

        function setRefreshingAccessToken(refreshing) {
            window.localStorage.setItem('refreshingAccessToken', refreshing);
        }

        return {
            getVerified: getVerified,
            isVerified: isVerified,
            setVerified: setVerified,
            setNumber: setNumber,
            getNumber: getNumber,
            setPassword: setPassword,
            getPassword: getPassword,
            setCustomerId: setCustomerId,
            getCustomerId: getCustomerId,
            setTokens: setTokens,
            getTokens: getTokens,
            isRefreshingAccessToken: isRefreshingAccessToken,
            setRefreshingAccessToken: setRefreshingAccessToken
        };
    });
