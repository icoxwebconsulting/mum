angular.module('app.MUMSMS', [])
    .factory('MUMSMS', function ($q) {

        function init() {
            cordova.plugins.diagnostic.requestRuntimePermissions(
                function (statuses) {
                    for (var permission in statuses) {
                        switch (statuses[permission]) {
                            case cordova.plugins.diagnostic.runtimePermissionStatus.GRANTED:
                                console.log("Permission granted to use " + permission);
                                break;
                            case cordova.plugins.diagnostic.runtimePermissionStatus.NOT_REQUESTED:
                                console.log("Permission to use " + permission + " has not been requested yet");
                                break;
                            case cordova.plugins.diagnostic.runtimePermissionStatus.DENIED:
                                console.log("Permission denied to use " + permission + " - ask again?");
                                break;
                            case cordova.plugins.diagnostic.runtimePermissionStatus.DENIED_ALWAYS:
                                console.log("Permission permanently denied to use " + permission + " - guess we won't be using it then!");
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
