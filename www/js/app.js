angular.module('app', ['ionic', 'app.routes', 'app.userDataStore', 'app.user', 'app.pushNotification',
        'app.resources', 'app.messageResource', 'app.device', 'app.contactRes', 'app.deviceDataStore',
        'ngResource', 'ngCordova', 'app.contacts', 'ionic-timepicker', 'app.sqliteDataStore'])
    .run(function ($rootScope, $state, $stateParams, $ionicPlatform, user, Contacts, sqliteDatastore, pushNotification) {
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

            sqliteDatastore.initDb();
            user.refreshAccessToken()
                .then(function () {
                    Contacts.loadContacts();
                });
        });

        //TODO: remove me just an example on how to receive notifications
        pushNotification.listenNotification();

        $rootScope.$on("$stateChangeStart", function (event, toState) {

        });
    });
