angular.module('app').controller('ChatsCtrl', function ($scope, $ionicActionSheet, $timeout, inbox) {

    $scope.$on('$ionicView.enter', function(e) {
    });

    $scope.chats = inbox.getTopMessages();
    $scope.remove = function (chat) {
        Chats.remove(chat);
    };
});
