angular.module('app', ['ionic', 'app.routes', 'app.services', 'app.user', 'app.contacts', 'ngResource', 'ngCordova'])

  .run(function ($rootScope, $state, $stateParams, $ionicPlatform, $ionicHistory, usuario) {
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
    });

    $rootScope.$on("$stateChangeStart", function (event, toState) {

    });
  });
