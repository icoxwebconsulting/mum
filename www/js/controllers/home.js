angular.module('app').controller('HomeCtrl', function ($scope, $ionicViewService) {
    $scope.selected = moment();
    console.log($scope.selected)

    $scope.$on('$ionicView.enter', function (e) {
        $ionicViewService.clearHistory();
    });

});
