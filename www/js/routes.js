angular.module('app.routes', [])
    .config(function ($stateProvider, $urlRouterProvider) {
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
                templateUrl: 'templates/profile.html',
                controller: 'ProfileCtrl'
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

            .state('layout.inbox', {
                url: '/inbox',
                templateUrl: 'templates/inbox.html',
                controller: 'InboxCtrl'
            })

            .state('layout.contacts', {
                url: '/contacts',
                templateUrl: 'templates/contacts.html',
                controller: 'ContactsCtrl'
            })

            .state('email_contacts', {
                url: '/pick/email/contact',
                templateUrl: 'templates/pick-contacts.html',
                controller: 'EmailContactCtrl'
            })

            .state('sms_contacts', {
                url: '/pick/email/contact',
                templateUrl: 'templates/pick-contacts.html',
                controller: 'SMSContactCtrl'
            })

            //pantalla de crear mum
            .state('layout.mum', {
                url: '/mum',
                templateUrl: 'templates/mum.html',
                controller: 'MumCtrl'
            })

            .state('message', {
                url: '/message/create',
                templateUrl: 'templates/message.html',
                controller: 'MessageCtrl'
            })

            .state('inbox', {
                url: '/inbox',
                templateUrl: 'templates/chat-detail.html',
                controller: 'ContactCtrl'
            })

            .state('conversation', {
                url: '/conversation',
                templateUrl: 'templates/conversation.html',
                controller: 'MessageCtrl'
            });


        // if none of the above states are matched, use this as the fallback
        if (window.localStorage.getItem('verified') == 2) {
            $urlRouterProvider.otherwise('/content/home');
        } else {
            $urlRouterProvider.otherwise('/start');
        }

    });
