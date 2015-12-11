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
        templateUrl: 'templates/verify.html'
      })

      //terminos y condiciones
      .state('terms', {
        url: '/terms',
        templateUrl: 'templates/terms.html'
      })

      //prueba de pantalla con tabs de forma manual
      .state('home', {
        url: '/home',
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl'
      })

      //for test purposes
      .state('test', {
        url: '/test',
        templateUrl: 'templates/test.html',
        controller: 'TestCtrl'
      })

      //
      .state('chats', {
        url: '/chats',
        templateUrl: 'templates/chats.html',
        controller: 'ChatsCtrl'
      })

      //
      .state('contacto', {
        url: '/contacto',
        templateUrl: 'templates/contacto.html',
        controller: 'ContactCtrl'
      })

      .state('chat', {
        url: '/chat',
        templateUrl: 'templates/chat-detail.html',
        controller: 'ContactCtrl'
      })

      .state('mum', {
        url: '/mum',
        templateUrl: 'templates/mum.html',
        controller: 'ContactCtrl'
      })
    // setup an abstract state for the tabs directive
    //.state('tab', {
    //    url: 'tab',
    //    abstract: true,
    //    templateUrl: 'templates/tabs.html'
    //})
    //
    //// Each tab has its own nav history stack:
    //.state('tab.dash', {
    //    url: '/dash',
    //    views: {
    //        'tab-dash': {
    //            templateUrl: 'templates/tab-dash.html'//,
    //           // controller: 'DashCtrl'
    //        }
    //    }
    //})
    //.state('tab.chats', {
    //    url: '/tab/chats',
    //    views: {
    //        'tab-chats': {
    //            templateUrl: 'templates/tab-chats.html',
    //            controller: 'ChatsCtrl'
    //        }
    //    }
    //})
    //
    //.state('tab.chat-detail', {
    //    url: '/chats/:chatId',
    //    views: {
    //        'tab-chats': {
    //            templateUrl: 'templates/chat-detail.html',
    //            controller: 'ChatDetailCtrl'
    //        }
    //    }
    //})
    //
    //.state('tab.account', {
    //    url: '/account',
    //    views: {
    //        'tab-account': {
    //            templateUrl: 'templates/tab-account.html',
    //            controller: 'AccountCtrl'
    //        }
    //    }
    //});

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/start');
  });