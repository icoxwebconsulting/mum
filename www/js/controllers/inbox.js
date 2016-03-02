angular.module('app').controller('InboxCtrl', function ($scope, $state, $ionicPopup, messageService) {

    $scope.chats;
    $scope.conversation;

    messageService.getInboxMessages().then(function (chats) {
        $scope.chats = chats;
    });

    $scope.open = function (chat) {

        messageService.setConversation({
            id: chat.id,
            image: chat.image,
            displayName: chat.name,
            type: chat.type,
            receivers: chat.receivers,
            lastText: chat.last_text
        });
        $state.go('conversation');

    };

    function toDelete() {
        console.log($scope.conversation, "la conversacion")
        //messageService.deleteConversation($scope.conversation).then(function () {
        //    console.log("conversacion borrada exitosamente")
        //}).catch(function (e) {
        //    console.log("no se borro la conversacion", e)
        //})
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
