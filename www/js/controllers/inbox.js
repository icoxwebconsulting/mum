angular.module('app').controller('InboxCtrl', function ($scope, $rootScope, $state, $ionicPopup, $filter, messageService) {

    $scope.conversation = messageService.factory().createConversation();

    messageService.getInboxMessages().then(function (conversations) {
        $rootScope.conversations = conversations;
    });

    $scope.open = function (conversation) {
        messageService.setConversation(conversation);
        var message = messageService.factory().createMessage();
        message.type = conversation.type;
        message.displayName = conversation.displayName;
        messageService.setMessage(message);
        $state.go('conversation');
    };

    function toDelete() {
        messageService.deleteConversation($scope.conversation).then(function () {
            $rootScope.conversations.splice($rootScope.conversations.indexOf($scope.conversation), 1);
        }).catch(function (error) {
            console.log("Error al borrar conversacion", error);
        })
    }

    $scope.deleteConversation = function (conversation) {
        $scope.conversation = conversation;
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

    $rootScope.$on('receivedMessage', function (e, data) {

        var found = $filter('getById')($rootScope.conversations, data.idConversation);
        console.log("a ver que encontró", found);
        if (found) {
            found.isUnread = 1;
        } else {
            //TODO: insertar la nueva conversación.
        }
        if ($rootScope.currentState != "conversation") {
            var conversation = messageService.factory().createConversation();

        }
    });
});
