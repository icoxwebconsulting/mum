angular.module('app', ['ionic', 'app.routes', 'app.userDataStore', 'app.user', 'app.pushNotification',
        'app.resources', 'app.messageResource', 'app.device', 'app.deviceDataStore',
    'ngResource', 'ngCordova', 'app.contacts', 'ionic-timepicker', 'app.sqliteDataStore'])
    .run(function ($rootScope, $state, $stateParams, $ionicPlatform, Contacts, sqliteDatastore, user, pushNotification) {
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

            if (ionic.Platform.isAndroid()) {
                Contacts.loadContacts();
            }
            sqliteDatastore.initDb();
        });

        //TODO: remove me just an example on how to receive notifications
        pushNotification.listenNotification(function(data){console.log('new service', data)});

        $rootScope.$on("$stateChangeStart", function (event, toState) {

        });
    });
