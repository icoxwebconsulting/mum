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

        function setCountryCode(countryCode) {
            window.localStorage.setItem('countryCode', countryCode);
        }

        function getCountryCode() {
            return window.localStorage.getItem('countryCode');
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
            window.localStorage.setItem('customerId', id);
        }

        function getCustomerId() {
            return window.localStorage.getItem('customerId');
        }

        function setTokens(accessToken, refreshToken) {
            window.localStorage.setItem('accessToken', accessToken);
            window.localStorage.setItem('refreshToken', refreshToken);
        }

        function getTokens() {
            return {
                accessToken: window.localStorage.getItem('accessToken'),
                refreshToken: window.localStorage.getItem('refreshToken')
            };
        }

        function isRefreshingAccessToken() {
            return window.localStorage.getItem('refreshingAccessToken') || false;
        }

        function setRefreshingAccessToken(refreshing) {
            window.localStorage.setItem('refreshingAccessToken', refreshing);
        }

        function setProfile(displayName, avatarURL) {
            window.localStorage.setItem('displayName', displayName);
            window.localStorage.setItem('avatarURL', avatarURL);
        }

        function getProfile() {
            return {
                displayName: window.localStorage.getItem('displayName'),
                avatarURL: window.localStorage.getItem('avatarURL')
            }
        }

        function setScheduleDay(date){
            window.localStorage.setItem('scheduleDay', date);
        }

        function getScheduleDay() {
            return window.localStorage.getItem('scheduleDay');
        }

        function removeScheduleDay() {
            return window.localStorage.removeItem('scheduleDay');
        }

        function setScheduleMessages(total){
            window.localStorage.setItem('scheduleMessages', total);
        }

        function getScheduleMessages() {
            return window.localStorage.getItem('scheduleMessages');
        }

        function removeScheduleMessages() {
            return window.localStorage.removeItem('scheduleMessages');
        }

        return {
            getVerified: getVerified,
            isVerified: isVerified,
            setVerified: setVerified,
            setCountryCode: setCountryCode,
            getCountryCode: getCountryCode,
            setNumber: setNumber,
            getNumber: getNumber,
            setPassword: setPassword,
            getPassword: getPassword,
            setCustomerId: setCustomerId,
            getCustomerId: getCustomerId,
            setTokens: setTokens,
            getTokens: getTokens,
            isRefreshingAccessToken: isRefreshingAccessToken,
            setRefreshingAccessToken: setRefreshingAccessToken,
            setProfile: setProfile,
            getProfile: getProfile,
            setScheduleDay: setScheduleDay,
            getScheduleDay: getScheduleDay,
            removeScheduleDay: removeScheduleDay,
            setScheduleMessages: setScheduleMessages,
            getScheduleMessages: getScheduleMessages,
            removeScheduleMessages: removeScheduleMessages
        };
    });
