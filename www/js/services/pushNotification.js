angular.module('app.pushNotification', [])
    .factory('pushNotification', function ($q) {
        var push = null;

        function init() {
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
        }

        function register() {
            var deferred = $q.defer();

            if (push !== null) {
                console.log('push available');
                push.on('registration',
                    function (data) {
                        console.log('push registered', data);
                        deferred.resolve(data.registrationId);
                    },
                    function () {
                        console.log('error registering push');
                        deferred.reject('No push notification available');
                    });
            } else {
                deferred.reject('No push notification available');
            }

            return deferred.promise;
        }

        function listenNotification(callback) {
            if (push !== null) {
                push.on('notification', callback);
            }
        }

        return {
            init: init,
            register: register,
            listenNotification: listenNotification
        };
    });
