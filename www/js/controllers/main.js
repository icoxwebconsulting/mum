angular.module('app').controller('MainCtrl', function ($scope, $rootScope, $state, $ionicActionSheet, delayedMessageService, messageService) {
    moment.locale('es');
    $scope.day = moment();

    $rootScope.conversations = [];

    $scope.count = 0;

    $scope.$on('$ionicView.enter', function (e) {
        messageService.getUnreadMessages().then(function (result) {
            if (result) {
                $scope.count = (result.count > 99) ? '+99' : result.count;
            } else {
                $scope.count = 0;
            }
        });
    });


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
        console.log("cambió el status de la red", networkState);
        delayedMessageService.run();
    });
});
