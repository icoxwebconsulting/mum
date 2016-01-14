angular.module('app').controller('MessageCtrl', function ($scope, messageSrv) {

    $scope.$on('$ionicView.enter', function () {
        $scope.fecha = messageSrv.getMum();
        console.log("estableciendo fecha")
    });

});
