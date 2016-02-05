angular.module('app').controller('InboxCtrl', function ($scope, $state, $ionicActionSheet, $timeout, inbox) {

    $scope.$on('$ionicView.enter', function (e) {
        console.log("en el modulo de inbox");
        inbox.getTopMessages().then(function (resp) {
            $scope.chats = resp;
        });
    });

    $scope.remove = function (chat) {
        Chats.remove(chat);
    };

    $scope.open = function (chat) {
        //{id: 1, name: "David", lastText: "da", image: "img/person.png", type: "sms", updated: "04-02-2016 18:46:33"}
        if (chat.type == 'sms') {
            $state.go('conversation');
        }
        //$state.go('layout.inbox');
    }
});
