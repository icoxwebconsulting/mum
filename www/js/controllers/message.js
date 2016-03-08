angular.module('app').controller('MessageCtrl', function ($scope, $rootScope, $state, $ionicLoading, $ionicPopup, messageService) {

    //maneja el envío de mensajes desde el formulario de envios programados

    $scope.$on('$ionicView.enter', function () {
        $scope.message = messageService.getMessage();
    });

    $scope.message = {
        id: "",
        type: "",
        body: "",
        date: null,
        from: null,
        subject: null,
        phoneNumber: null,
        email: null,
        displayName: "",
        created: null,
    };

    $scope.conversation = {
        id: null,
        image: null,
        displayName: "",
        type: "",
        receivers: [],
        lastMessage: "",
        created: null,
        updated: null
    };

    $scope.sendMessage = function () {
        //$ionicLoading.show();

        $scope.conversation.receivers.push(($scope.message.type == 'email') ? $scope.message.email : $scope.message.phoneNumber);
        $scope.conversation.type = $scope.message.type;
        $scope.conversation.displayName = $scope.message.displayName;
        $scope.conversation.lastMessage = $scope.message.body;

        function processSend() {
            messageService.sendMessage($scope.message, $scope.conversation).then(function () {
                //$ionicLoading.hide();
                $scope.message = {
                    id: "",
                    type: "",
                    body: "",
                    date: null,
                    from: null,
                    subject: null,
                    phoneNumber: null,
                    email: null,
                    displayName: "",
                    created: null,
                };

                $scope.conversation = {
                    id: null,
                    image: null,
                    displayName: "",
                    type: "",
                    receivers: [],
                    lastMessage: "",
                    created: null,
                    updated: null
                };

                $state.go('layout.inbox');
            }).catch(function (error) {
                console.log('hay un error', error);
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
                    $rootScope.conversations.unshift($scope.conversation);
                    processSend();
                });
            }
        });
    };

});
