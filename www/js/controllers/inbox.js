angular.module('app').controller('InboxCtrl', function ($scope, $state, $ionicPopup, messageService) {

    $scope.chats;
    $scope.conversation;

    messageService.getInboxMessages().then(function (conversations) {
        $scope.conversations = conversations;
    });

    $scope.open = function (conv) {

        messageService.setConversation({
            id: conv.id,
            image: conv.image,
            displayName: conv.name,
            type: conv.type,
            receivers: conv.receivers,
            lastMessage: conv.lastMessage
        });
        $state.go('conversation');

    };

    function toDelete() {
        console.log($scope.conversation, "la conversacion");
        messageService.deleteConversation($scope.conversation).then(function () {
            $scope.conversations.splice($scope.conversations.indexOf($scope.conversation), 1);
        }).catch(function (e) {
            console.log("no se borro la conversacion", e)
        })
    }

    $scope.deleteConversation = function (c) {
        $scope.conversation = c;
        $ionicPopup.alert({
            title: 'Eliminar conversación',
            subTitle: '¿Desea eliminar la conversación?',
            scope: $scope,
            buttons: [
                {
                    text: '<b>Aceptar</b>',
                    type: 'button-positive',
                    onTap: function (e) {
                        toDelete();
                    }
                },
                {text: 'Cancelar'}
            ]
        });
    };
});
