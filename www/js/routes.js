angular.module('app.routes', [])

  .config(function ($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

      //pantalla inicial sólo mostrada si es primera vez
      .state('start', {
        url: '/start',
        templateUrl: 'templates/start.html'
      })

      //pantalla de verificacion de numero telefonico, igual mostrada la primera vez
      .state('verify', {
        url: '/verify',
        templateUrl: 'templates/verify.html',
        controller: 'InitCtrl'
      })

      //terminos y condiciones
      .state('terms', {
        url: '/terms',
        templateUrl: 'templates/terms.html'
      })

      //perfil
      .state('profile', {
        url: '/profile',
        templateUrl: 'templates/profile.html'
      })

      //Plantilla del header
      .state('layout', {
        url: '/content',
        abstract: true,
        templateUrl: 'templates/layout.html',
        controller: 'MainCtrl'
      })

      .state('layout.home', {
        url: '/home',
        templateUrl: 'templates/home.html'
      })

      .state('layout.chats', {
        url: '/chats',
        templateUrl: 'templates/chats.html',
        controller: 'ChatsCtrl'
      })

    .state('layout.contacts', {
      url: '/contacts',
      templateUrl: 'templates/contacts.html',
      controller: 'ContactCtrl'
    })

    .state('chat', {
      url: '/chat',
      templateUrl: 'templates/chat-detail.html',
      controller: 'ContactCtrl'
    })

    .state('mum', {
      url: '/mum',
      templateUrl: 'templates/mum.html'
    })

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/start');
  });
