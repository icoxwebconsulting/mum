angular.module('app.MUMSMS', [])
    .factory('MUMSMS', function ($q) {

        function init() {
            if (ionic.Platform.isAndroid()) {
                cordova.plugins.diagnostic.requestRuntimePermissions(
                    function (statuses) {
                        for (var permission in statuses) {
                            switch (statuses[permission]) {
                                case cordova.plugins.diagnostic.runtimePermissionStatus.GRANTED:
                                    break;
                                case cordova.plugins.diagnostic.runtimePermissionStatus.NOT_REQUESTED:
                                    break;
                                case cordova.plugins.diagnostic.runtimePermissionStatus.DENIED:
                                    break;
                                case cordova.plugins.diagnostic.runtimePermissionStatus.DENIED_ALWAYS:
                                    break;
                            }
                        }
                    },
                    function (error) {
                        console.error("The following error occurred: " + error);
                    }, [
                        cordova.plugins.diagnostic.runtimePermission.SEND_SMS,
                        cordova.plugins.diagnostic.runtimePermission.RECEIVE_SMS,
                        cordova.plugins.diagnostic.runtimePermission.READ_SMS
                    ]);
            }
        }

        function watchIncome() {
            var deferred = $q.defer();

            SMS.startWatch(function () {
                document.addEventListener('onSMSArrive', function (data) {
                    deferred.resolve(data);
                });
            });

            return deferred.promise;
        }

        return {
            init: init,
            watchIncome: watchIncome
        };
    });
