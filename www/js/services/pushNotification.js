angular.module('app.pushNotification', [])
    .factory('pushNotification', function ($q, messageReceived) {
        var push = null;

        if (window.PushNotification) {
            var PushNotification = window.PushNotification;

            push = PushNotification.init({
                android: {
                    senderID: "850066050595",
                    icon: "mum",
                    iconColor: "lightgrey"
                }
            });
        }

        function register() {
            var deferred = $q.defer();

            if (push !== null) {
                push.on('registration',
                    function (data) {
                        deferred.resolve(data.registrationId);
                    },
                    function () {
                        deferred.reject('No push notification available');
                    });
            } else {
                deferred.reject('No push notification available');
            }

            return deferred.promise;
        }

        function listenNotification() {
            if (push !== null) {
                push.on('notification', function (data) {
                    messageReceived.processReceivedMessage(data);
                });
            }

        }

        return {
            register: register,
            listenNotification: listenNotification
        };
    });
