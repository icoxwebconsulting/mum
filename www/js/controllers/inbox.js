angular.module('app').controller('InboxCtrl', function ($scope, $state, $ionicPopup, messageSrv) {

    $scope.conversation;

    $scope.$on('$ionicView.enter', function (e) {
        console.log("en el modulo de inbox");
        messageSrv.getInboxMessages().then(function (resp) {
            $scope.chats = resp;
        });
    });

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
    };

    function toDelete() {
        messageSrv.deleteConversation($scope.conversation).then(function () {
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
