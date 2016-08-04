angular.module('app').controller('HomeCtrl', function ($scope) {
    $scope.selected = moment();
    console.log($scope.selected)
});
