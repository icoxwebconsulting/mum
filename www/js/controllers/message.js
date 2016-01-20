angular.module('app').controller('MessageCtrl', function ($scope, $ionicLoading, $ionicPopup, messageSrv) {

    $scope.$on('$ionicView.enter', function () {
        $scope.mum = messageSrv.getMum();
    });

    $scope.message = {
        subject: "",
        body: "",
        from: ""
    };

    $scope.sendMessage = function () {
        $ionicLoading.show();
        messageSrv.sendMessage($scope.message)
            .then(function (resp) {
                $ionicLoading.hide();
                console.log(resp);
            })
            .catch(function () {
                $ionicLoading.hide();
            });
    };

});
