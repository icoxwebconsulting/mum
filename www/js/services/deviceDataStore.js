angular.module('app.deviceDataStore', [])
    .factory('deviceDatastore', function () {
        function getDeviceId() {
            return window.localStorage.getItem('device_id') || null;
        }

        function setDeviceId(deviceId) {
            window.localStorage.setItem('device_id', deviceId);
        }

        function getDbExist() {
            return window.localStorage.getItem('db_exist') || null;
        }

        function setDbExist(dbExist) {
            window.localStorage.setItem('db_exist', dbExist);
        }

        return {
            getDeviceId: getDeviceId,
            setDeviceId: setDeviceId,
            getDbExist: getDbExist,
            setDbExist: setDbExist
        };
    });
