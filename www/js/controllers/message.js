angular.module('app').controller('MessageCtrl', function ($scope, $ionicLoading, $ionicPopup, messageSrv) {

    $scope.$on('$ionicView.enter', function () {
        $scope.mum = messageSrv.getMum();
    });

    $scope.message = {
        subject: "",
        body: ""
    };

    function sendSms() {
        $ionicLoading.show();
        messageSrv.sendSms($scope.mum)
            .then(function () {
                $ionicLoading.hide();

                $ionicPopup.alert({
                    title: 'Mensaje enviado!'
                });


            })
            .catch(function () {
                $ionicLoading.hide();

                $ionicPopup.alert({
                    title: 'Error'
                });
            });
    }

    function sendEmail() {

    }

    $scope.sendMessage = function () {
        if ($scope.mum.type == 'sms') {
            sendSms();
        } else if ($scope.mum.type == 'email') {
            sendEmail();
        }
    };

});
