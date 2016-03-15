angular.module('app')
    .controller('InitCtrl', function ($scope, $state, $ionicPopup, $ionicLoading, $ionicHistory, user, MUMSMS) {
        $scope.data = {};

        $scope.toVerify = user.getVerified();

        $scope.inProcess = 0;

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
                    countryCode: $scope.data.cc,
                    phoneNumber: $scope.data.phone
                };

                user.register(customerData)
                    .then(function () {
                        $ionicLoading.hide();

                        $ionicPopup.alert({
                            title: 'Se envió un mensaje a su teléfono.'
                        });

                        $scope.toVerify = user.getVerified();

                        return MUMSMS.watchIncome();
                    })
                    .then(function (message) {
                        try {
                            var code = message.data.body.match(/Your confirmation number is \d+/)[0].match(/\d+/);

                            if (code) {
                                $scope.data.code = code;
                                $scope.inProcess = 1;
                                verify();
                            }
                        } catch (error) {
                        }
                    });
            }
        };

        function verify() {
            user.verifyCode($scope.data.code)
                .then(function () {
                    $ionicHistory.nextViewOptions({
                        disableAnimate: true,
                        disableBack: true,
                        historyRoot: true
                    });
                    $state.go('layout.home');
                })
                .catch(function (error) {
                    $scope.inProcess = 0;
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
                $scope.inProcess = 1;
                verify();
            }
        };
    });
