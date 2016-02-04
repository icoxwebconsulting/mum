angular.module('app').controller('InboxCtrl', function ($scope, $ionicActionSheet, $timeout, inbox) {

    $scope.$on('$ionicView.enter', function (e) {
        console.log("en el modulo de inbox");
        inbox.getTopMessages().then(function (resp) {
            $scope.chats = resp;
        });
    });

    $scope.remove = function (chat) {
        Chats.remove(chat);
    };
});
