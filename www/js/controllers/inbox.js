angular.module('app').controller('InboxCtrl', function ($scope, $rootScope, $state, $ionicPopup, $filter, messageService) {

    $scope.conversation = messageService.factory().createConversation();
    var popup;

    messageService.getInboxMessages().then(function (conversations) {
        $scope.conversations = conversations;
    });

    $rootScope.$on('addConversation', function (e, data) {
        $scope.conversations.unshift(data.conversation);
    });

    $scope.open = function (conversation) {
        messageService.setConversation(conversation);
        var message = messageService.factory().createMessage();
        message.type = conversation.type;
        message.displayName = conversation.displayName;
        messageService.setMessage(message);
        if(popup){
            popup.close();
        }
        $state.go('conversation');
    };

    function toDelete() {
        messageService.deleteConversation($scope.conversation).then(function () {
            $scope.conversations.splice($scope.conversations.indexOf($scope.conversation), 1);
        }).catch(function (error) {
        })
    }

    $scope.deleteConversation = function (conversation) {
        $scope.conversation = conversation;
        popup = $ionicPopup.alert({
            title: 'Eliminar conversación',
            subTitle: '¿Desea eliminar la conversación?',
            scope: $scope,
            buttons: [
                {
                    text: '<b>Aceptar</b>',
                    type: 'button-mum',
                    onTap: function (e) {
                        toDelete();
                    }
                },
                {text: 'Cancelar'}
            ]
        });
    };

    $rootScope.$on('receivedMessage', function (e, data) {

        var found;
        for (var i = 0; i < $scope.conversations.length; i++) {
            if ($scope.conversations[i]['id'] == data.conversation.id) {
                found = $scope.conversations[i];
            }
        }

        if (found) {
            $scope.conversations.splice($scope.conversations.indexOf(found), 1);
        }
        $scope.conversations.unshift(data.conversation);
    });
});
