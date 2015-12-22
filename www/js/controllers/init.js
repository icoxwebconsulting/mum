angular.module('app').controller('InitCtrl', function ($scope, $state, $ionicPopup, $ionicLoading, $ionicHistory, usuario) {
  $scope.data = {};

  $scope.toVerify = false;

  $scope.sendCode = function () {
    if (!$scope.data.cc) {
      $ionicPopup.alert({
        title: 'Ingrese el código del país'
      });
    } else if (!$scope.data.phone) {
      $ionicPopup.alert({
        title: 'Ingrese el número de teléfono'
      });
    } else {
      $ionicLoading.show({
        template: 'Verificando...'
      });

      usuario.sendCode('+' + $scope.data.cc + $scope.data.phone, function (isSuccess) {
        $ionicLoading.hide();
        $ionicPopup.alert({
          title: (isSuccess) ? 'Se envió un mensaje a su teléfono.' : 'No verificado, intente nuevamente.'
        });
        if (isSuccess) {
          $scope.toVerify = true;
          usuario.setNumber($scope.data.cc + $scope.data.phone);
        }
      });
    }
  };

  $scope.verifyCode = function () {
    if (!$scope.data.code) {
      $ionicPopup.alert({
        title: 'Ingrese el código recibido vía SMS'
      });
    } else {
      usuario.verifyCode($scope.data.code, function (isValid) {
        if (isValid) {
          $ionicPopup.alert({
            title: 'Se ha validado correctamente su teléfono.'
          });
          $ionicHistory.nextViewOptions({
            disableAnimate: true,
            disableBack: true,
            historyRoot: true
          });
          $state.go('layout.home');
        } else {
          $ionicPopup.alert({
            title: 'Código erróneo, verifique y vuelva a intentar.'
          });
        }
      });
    }
  };

});
