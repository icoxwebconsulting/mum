angular.module('app')
    .controller('InitCtrl', function ($scope, $state, $ionicPopup, $ionicLoading, $ionicHistory, user) {
        $scope.data = {};

        $scope.toVerify = user.isVerified();

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

                var customerData = {
                    username: $scope.data.cc + $scope.data.phone
                };

                user.register(customerData,
                    function () {
                        $ionicLoading.hide();

                        $ionicPopup.alert({
                            title: 'Se envió un mensaje a su teléfono.'
                        });

                        $scope.toVerify = user.isVerified();
                    },
                    function () {
                        $ionicLoading.hide();

                        $ionicPopup.alert({
                            title: 'No verificado, intente nuevamente.'
                        });
                    });
            }
        };

        $scope.verifyCode = function () {
            if (!$scope.data.code) {
                $ionicPopup.alert({
                    title: 'Ingrese el código recibido vía SMS'
                });
            } else {
                user.verifyCode($scope.data.code,
                    function () {
                        $ionicPopup.alert({
                            title: 'Se ha validado correctamente su teléfono.'
                        });
                        $ionicHistory.nextViewOptions({
                            disableAnimate: true,
                            disableBack: true,
                            historyRoot: true
                        });
                        $state.go('layout.home');
                    },
                    function () {
                        $ionicPopup.alert({
                            title: 'Código erróneo, verifique y vuelva a intentar.'
                        });
                    });
            }
        };

    });
