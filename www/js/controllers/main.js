angular.module('app').controller('MainCtrl', function ($scope, $rootScope, $state, $ionicActionSheet, delayedMessageSrv) {
    moment.locale('es');
    $scope.day = moment();

    //delayedMessageSrv.run();

    $scope.showMenu = function () {
        // Show the action sheet
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                {text: 'Perfil'},
                {text: 'Nuevo grupo'},
                {text: 'Política de privacidad'}
            ],
            titleText: 'Opciones',
            cancelText: 'Cancelar',
            cancel: function () {
                // add cancel code..
            },
            buttonClicked: function (index) {
                switch (index) {
                    case 0:
                        $state.go('profile');
                        break;
                    case 2:
                        $state.go('terms');
                        break;
                }
                return true;
            }
        });
    };

    //$rootScope.previousState;
    //$rootScope.currentState;
    $rootScope.$on('$stateChangeSuccess', function(ev, to, toParams, from, fromParams) {
        $rootScope.previousState = from.name;
        $rootScope.currentState = to.name;
        console.log('Previous state:'+$rootScope.previousState);
        console.log('Current state:'+$rootScope.currentState)
    });
});
