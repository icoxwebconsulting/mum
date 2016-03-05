angular.module('app').controller('ContactDetailCtrl', function ($scope, $state, $ionicPopup, $ionicLoading, messageService, Contacts) {

    $scope.contact;

    $scope.$on('$ionicView.enter', function (e) {
        $scope.contact = Contacts.getSingleContact();
    });

    $scope.startConversation = function (type) {

        messageService.setMum({
            type: type,
            date: moment.utc().format("DD-MM-YYYY HH:mm:ss"),
            phoneNumber: $scope.contact.phoneNumber,
            email: $scope.contact.email,
            displayName: $scope.contact.displayName
        });

        var receivers = [];
        receivers.push($scope.contact.phoneNumber);

        messageService.findConversation(type, receivers).then(function (response) {
            var conversation;

            if (response) {
                conversation = {
                    id: response.id,
                    displayName: response.display_name,
                    image: response.image,
                    lastMessage: response.last_message,
                    receivers: JSON.parse(response.receivers),
                    type: response.type,
                    updated: response.updated,
                    created: response.created
                };
            } else {
                conversation = {
                    id: null,
                    image: ($scope.contact.photo == 'img/person.png') ? null : $scope.contact.photo,
                    displayName: $scope.contact.displayName,
                    type: type,
                    receivers: receivers
                }
            }

            messageService.setConversation(conversation);
            $state.go('conversation');
        });
    }
});
