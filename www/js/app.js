angular.module('app', ['ionic', 'app.controllers', 'app.routes', 'app.services', 'app.user'])

.run(function($rootScope, $state, $stateParams, $ionicPlatform, usuario) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;

  $ionicPlatform.ready(function() {
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

    if (usuario.isVerified() && (
        toState.name == 'start' ||
        toState.name == 'verify')) {
      event.preventDefault();
      return $state.go('layout.home');
    }

    if (!usuario.isVerified() && (
      toState.name != 'start' &&
      toState.name != 'verify')) {
      event.preventDefault();
      return $state.go('start');
    }

  });
})

.constant("SERVER_CONF", {
  "HOST": "http://192.168.0.101/server/"
});
