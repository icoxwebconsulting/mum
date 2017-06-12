angular.module('app').controller('MessageCtrl', function ($scope, $rootScope, $state, $ionicLoading, $ionicPopup, messageService) {

    //maneja el envío de mensajes desde el formulario de envios programados

    $scope.$on('$ionicView.enter', function () {
        $scope.message = messageService.getMessage();
        console.log('$scope.message', $scope.message)
    });

    $scope.message = messageService.factory().createMessage();
    $scope.conversation = messageService.factory().createConversation();

    $scope.sendMessage = function () {
        //$ionicLoading.show();

        $scope.conversation.receivers.push(($scope.message.type == 'email') ? $scope.message.email : $scope.message.phoneNumber);
        $scope.conversation.type = $scope.message.type;
        $scope.conversation.displayName = $scope.message.displayName;
        //$scope.conversation.lastMessage = '';

        function processSend() {
            messageService.sendMessage($scope.message, $scope.conversation).then(function () {
                //$ionicLoading.hide();
                $scope.message = messageService.factory().createMessage();
                $scope.conversation = messageService.factory().createConversation();

                $state.go('refresh');
            }).catch(function (error) {
                //$ionicLoading.hide();
            });
        }

        messageService.findConversation($scope.message.type, $scope.conversation.receivers).then(function (response) {
            if (response) {
                $scope.conversation.id = response.id;
                messageService.setConversation($scope.conversation);
                processSend();
            } else {
                messageService.saveConversation($scope.conversation).then(function (insertId) {
                    $scope.conversation.id = insertId;
                    messageService.setConversation($scope.conversation);
                    $rootScope.$emit('addConversation', {
                        conversation: $scope.conversation
                    });
                    processSend();
                });
            }
        });
    };

});
