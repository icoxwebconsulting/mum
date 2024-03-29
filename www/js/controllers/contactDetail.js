angular.module('app').controller('ContactDetailCtrl', function ($scope, $state, $ionicPopup, $ionicLoading, messageService, Contacts) {

    $scope.contact;

    $scope.$on('$ionicView.enter', function (e) {
        $scope.contact = Contacts.getSingleContact();
    });

    $scope.startConversation = function (type) {

        messageService.setMessage({
            type: type,
            body: "",
            date: null,
            from: null,
            subject: null,
            phoneNumber: (type != 'email') ? $scope.contact.phone_number : null,
            email: (type == 'email') ? $scope.contact.email : null,
            displayName: $scope.contact.display_name,
            created: null,
        });

        var receivers = [];
        if (type == 'email') {
            receivers.push($scope.contact.email);
        } else {
            receivers.push($scope.contact.phone_number);
        }

        messageService.findConversation(type, receivers).then(function (response) {
            var conversation;

            if (response) {
                conversation = {
                    id: response.id,
                    image: response.image,
                    displayName: response.display_name,
                    type: response.type,
                    receivers: JSON.parse(response.receivers),
                    lastMessage: response.last_message,
                    created: response.created,
                    updated: response.updated
                };
            } else {
                conversation = {
                    id: null,
                    image: ($scope.contact.photo == 'img/person.png') ? null : $scope.contact.photo,
                    displayName: $scope.contact.display_name,
                    type: type,
                    receivers: receivers,
                    lastMessage: "",
                    created: null,
                    updated: null
                }
            }

            messageService.setConversation(conversation);
            $state.go('conversation');
        });
    }
});
