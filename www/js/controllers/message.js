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
        messageSrv.sendMessage($scope.message)
            .then(function (resp) {
                $ionicLoading.hide();
                $state.go('layout.inbox');
            })
            .catch(function () {
                $ionicLoading.hide();
            });
    };
    
    $scope.getConversationMessage = function(){
        messageSrv().then(function (msjs) {
            
        })
    }

});
