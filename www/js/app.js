angular.module('app', ['ionic', 'app.routes', 'app.userDataStore', 'app.user', 'app.pushNotification',
        'app.resources', 'app.messageResource', 'app.device', 'app.contactRes', 'app.deviceDataStore',
        'ngResource', 'ngCordova', 'app.contacts', 'ionic-timepicker', 'app.sqliteDataStore', 'app.MUMSMS', 'app.filters'])
    .run(function ($rootScope, $state, $stateParams, $ionicPlatform, user, Contacts, sqliteDatastore, userDatastore,
                   pushNotification, messageReceived, MUMSMS) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);

            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }

            init();
        });

        $rootScope.$on("$stateChangeStart", function (event, toState) {

        });

        function init() {
            sqliteDatastore.initDb();
            pushNotification.init();
            pushNotification.listenNotification(messageReceived.processReceivedMessage);
            pushNotification.listenNotification(MUMSMS.processPushNotification);
            userDatastore.setRefreshingAccessToken(0);
            if (SMS) {
                MUMSMS.init();
            }
            user.refreshAccessToken()
                .then(function () {
                    Contacts.loadContacts();
                });
        }
    });
