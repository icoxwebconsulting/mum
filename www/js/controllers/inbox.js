angular.module('app').controller('InboxCtrl', function ($scope, $state, $ionicActionSheet, $timeout, messageSrv) {

    $scope.$on('$ionicView.enter', function (e) {
        console.log("en el modulo de inbox");
        messageSrv.getInboxMessages().then(function (resp) {
            $scope.chats = resp;
        });
    });

    $scope.remove = function (chat) {
        Chats.remove(chat);
    };

    $scope.open = function (chat) {
        if (chat.type == 'sms') {
            messageSrv.setConversation({
                id: chat.id_conversation,
                image: chat.image,
                displayName: chat.name,
                type: chat.type,
                receivers: chat.receivers,
                lastText: chat.lastText
            });
            $state.go('conversation');
        }
        //$state.go('layout.inbox');
    }
});
