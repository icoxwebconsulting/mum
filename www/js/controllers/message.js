angular.module('app').controller('MessageCtrl', function ($scope, $rootScope, $state, $ionicLoading, $ionicPopup, messageService) {

    $scope.$on('$ionicView.enter', function () {
        if ($rootScope.previousState != 'layout.inbox') {
            $scope.mum = messageService.getMum();
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
        var mum = messageService.getMum();
        messageData.receivers = [];
        messageData.receivers.push((mum.type == 'sms') ? JSON.stringify([mum.phoneNumber]) : JSON.stringify([mum.email]));
        messageData.type = mum.type;
        messageData.displayName = mum.displayName;
        messageService.saveConversation(messageData).then(function (insertId) {
            messageService.sendMessage($scope.message, insertId).then(function () {
                $ionicLoading.hide();
                $scope.message = "";
                $state.go('layout.inbox');
            }).catch(function (error) {
                console.log('hay un error', error);
                $ionicLoading.hide();
            });
        });

    };

});
