angular.module('app').controller('MainCtrl', function ($scope, $state, $ionicLoading, $ionicActionSheet, user) {

    //$scope.$on('$ionicView.enter', function () {
    //    $ionicLoading.show({
    //        template: 'Cargando ...'
    //    });
    //
    //    user.getProfile().then(function (profile) {
    //
    //    }).catch(function () {
    //        $ionicLoading.hide();
    //    });
    //});

    $scope.day = moment();

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
});
