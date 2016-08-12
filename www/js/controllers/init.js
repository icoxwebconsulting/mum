angular.module('app')
    .controller('InitCtrl', function ($scope, $state, $ionicPopup, $ionicLoading, $ionicHistory, user, MUMSMS, $http) {
        $scope.data = {};

        $scope.toVerify = user.getVerified();

        $scope.inProcess = 0;

        function buildSelect() {
            $http.get('js/paises.json',
                {header: {'Content-Type': 'application/json; charset=UTF-8'}}
            ).then(function (countries) {
                $scope.select.availableOptions = countries.data;
                try {
                    window.plugins.sim.getSimInfo(function (result) {
                        var iso = result.countryCode;
                        iso = iso.toUpperCase();
                        for (var i = 0; i < $scope.select.availableOptions.length; i++) {
                            if ($scope.select.availableOptions[i].iso2 == iso) {
                                $scope.select.selectedOption = $scope.select.availableOptions[i];
                                break;
                            }
                        }
                    }, function () {
                        //error
                        $scope.select.selectedOption = $scope.select.availableOptions[63];
                    });
                } catch (e) {
                    //seleccionar españa como predeterminado
                    $scope.select.selectedOption = $scope.select.availableOptions[63];
                }
            });
        }

        $scope.select = {
            availableOptions: [],
            selectedOption: null
        };

        buildSelect();
        
        
        $scope.haveCode = function (opt) {
            if (opt) {
                $scope.toVerify = 1;
            } else {
                $scope.toVerify = 0;
            }
        };

        $scope.sendCode = function () {
            if (!$scope.select.selectedOption) {
                $ionicPopup.alert({
                    title: 'Seleccione el país'
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
                    countryCode: $scope.select.selectedOption.phone_code,
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
                            console.log("error");
                        }
                    }).catch(function (error) {
                    $ionicLoading.hide();

                    $ionicPopup.alert({
                        title: 'Ha ocurrido un error, intente más tarde. '
                    });
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
