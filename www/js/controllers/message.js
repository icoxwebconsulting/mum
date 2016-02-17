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
        var messageData = $scope.message;
        var mum = messageSrv.getMum();
        messageData.receivers = [];
        messageData.receivers.push((mum.type == 'sms') ? JSON.stringify([mum.phoneNumber]) : JSON.stringify([mum.email]));
        messageData.type = mum.type;
        messageData.displayName = mum.displayName;
        messageSrv.saveConversation(messageData).then(function (insertId) {
            messageSrv.sendMessage($scope.message, insertId).then(function () {
                $ionicLoading.hide();
                $state.go('layout.inbox');
            }).catch(function (error) {
                console.log('hay un error', error);
                $ionicLoading.hide();
            });
        });

    };

});
