angular.module('app').controller('InboxCtrl', function ($scope, $state, $ionicPopup, messageService) {

    $scope.conversation;

    messageService.getInboxMessages().then(function (resp) {
        $scope.chats = resp;
    });

    $scope.open = function (chat) {
        if (chat.type == 'sms') {
            messageService.setConversation({
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
    };

    function toDelete() {
        messageService.deleteConversation($scope.conversation).then(function () {
            console.log("conversacion borrada exitosamente")
        }).catch(function (e) {
            console.log("no se borro la conversacion", e)
        })
    }

    $scope.deleteConversation = function (c) {
        $scope.conversation = c;
        $ionicPopup.alert({
            title: 'Eliminar mensajes',
            subTitle: '¿Desea eliminar el mensaje?',
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
