angular.module('app.pushNotification', [])
    .factory('pushNotification', function ($rootScope) {
        var push = null;
        var registrationId = null;

        function getRegistrationId() {
            return registrationId;
        }

        function init() {
            if (window.PushNotification) {
                var PushNotification = window.PushNotification;

                push = PushNotification.init({
                    forceReload: true,
                    android: {
                        senderID: "850066050595",
                        icon: "mum",
                        iconColor: "lightgrey"
                    }
                });

                if (push !== null) {
                    push.on('registration', function (data) {
                        registrationId = data.registrationId;

                        $rootScope.$emit('pushRegistrationId', registrationId);
                    });
                }
            }
        }

        function listenNotification(callback) {
            if (push !== null) {
                push.on('notification', callback);
            }
        }

        return {
            init: init,
            getRegistrationId: getRegistrationId,
            listenNotification: listenNotification
        };
    });
