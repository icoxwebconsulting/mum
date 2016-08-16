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
                    },
                    ios: {
                        alert: "true",
                        badge: "true",
                        sound: "true",
                        senderID: "850066050595" // GCM Sender ID (project ID)
                    }
                });

                if (push !== null) {
                    push.on('registration', function (data) {
                        registrationId = data.registrationId;

                        $rootScope.$emit('pushRegistrationId', registrationId);
                    });

                    push.on('error', function (e) {
                        console.log("Error en el registro");
                        console.log(e);
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
