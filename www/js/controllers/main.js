angular.module('app').controller('MainCtrl', function ($scope, $rootScope, $state, $ionicActionSheet, delayedMessageService) {
    moment.locale('es');
    $scope.day = moment();

    $rootScope.conversations = [];

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

    $rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
        $rootScope.previousState = from.name;
        $rootScope.currentState = to.name;
    });

    $rootScope.$on('$cordovaNetwork:online', function (event, networkState) {
        delayedMessageService.run();
    });
});
