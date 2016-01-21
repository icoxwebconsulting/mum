angular.module('app.deviceDataStore', [])
    .factory('deviceDatastore', function () {
        function getDeviceId() {
            return window.localStorage.getItem('device_id') || null;
        }

        function setDeviceId(deviceId) {
            window.localStorage.setItem('device_id', deviceId);
        }

        return {
            getDeviceId: getDeviceId,
            setDeviceId: setDeviceId
        };
    });
