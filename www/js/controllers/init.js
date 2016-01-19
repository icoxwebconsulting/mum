angular.module('app')
    .controller('InitCtrl', function ($scope, $state, $ionicPopup, $ionicLoading, $ionicHistory, user) {
        $scope.data = {};

        $scope.toVerify = user.getVerified();

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

                user.register(customerData)
                    .then(function () {
                        $ionicLoading.hide();

                        $ionicPopup.alert({
                            title: 'Se envió un mensaje a su teléfono.'
                        });

                        $scope.toVerify = user.getVerified();

                        if (SMS) {
                            SMS.startWatch(function () {
                                document.addEventListener('onSMSArrive', function (e) {
                                    try {
                                        var code = e.data.body.match(/Your confirmation number is \d+/)[0].match(/\d+/);

                                        if (code) {
                                            $scope.data.code = code;
                                            verify();
                                        }
                                    } catch (e) {

                                    }
                                });
                            });
                        }
                    })
                    .catch(function () {
                        $ionicLoading.hide();

                        $ionicPopup.alert({
                            title: 'No verificado, intente nuevamente.'
                        });
                    });
            }
        };

        function verify() {
            user.verifyCode($scope.data.code)
                .then(function () {
                    $ionicPopup.alert({
                        title: 'Se ha validado correctamente su teléfono.'
                    });
                    $ionicHistory.nextViewOptions({
                        disableAnimate: true,
                        disableBack: true,
                        historyRoot: true
                    });
                    $state.go('layout.home');
                })
                .catch(function () {
                    $ionicPopup.alert({
                        title: 'Código erróneo, verifique y vuelva a intentar.'
                    });
                });
        }

        $scope.verifyCode = function () {
            if (!$scope.data.code) {
                $ionicPopup.alert({
                    title: 'Ingrese el código recibido vía SMS'
                });
            } else {
                verify();
            }
        };
    });
