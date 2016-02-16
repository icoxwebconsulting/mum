angular.module('app').controller('MessageCtrl', function ($scope, $rootScope, $state, $ionicLoading, $ionicPopup, messageSrv) {

    $scope.$on('$ionicView.enter', function () {
        if ($rootScope.previousState != 'layout.inbox') {
            $scope.mum = messageSrv.getMum();
        }
    });

    $scope.message = {
        subject: "",
        body: "",
        from: ""
    };

    $scope.sendMessage = function () {
        $ionicLoading.show();
        messageSrv.saveConversation($scope.message).then(function (resp) {
            messageSrv.sendMessage($scope.message, resp.insertId).then(function () {
                $ionicLoading.hide();
                $state.go('layout.inbox');
            }).catch(function (error) {
                console.log('hay un error', error);
                $ionicLoading.hide();
            });
        });

    };

});
