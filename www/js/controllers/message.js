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
                    title: 'Probando probando'
                });

                $scope.toVerify = user.getVerified();
                console.log($scope.toVerify);
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
        alert("por enviar mensaje");
        //if ($scope.mum.type == 'sms') {
            sendSms();
        //} else if ($scope.mum.type == 'email') {
        //    sendEmail();
        //}
    };

});
