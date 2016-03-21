angular.module('app').controller('InboxCtrl', function ($scope, $rootScope, $state, $ionicPopup, $filter, messageService) {

    $scope.conversation = messageService.factory().createConversation();

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

        var found = $filter('getById')($scope.conversations, data.conversation.id);
        if (found) {
            $scope.conversations.splice($scope.conversations.indexOf(found), 1);
        }
        $scope.conversations.unshift(data.conversation);
    });
});
