angular.module('app').controller('ContactDetailCtrl', function ($scope, $state, $ionicPopup, $ionicLoading, messageService, Contacts) {

    $scope.contact;

    $scope.$on('$ionicView.enter', function (e) {
        $scope.contact = Contacts.getSingleContact();
        console.log($scope.contact);
    });

    $scope.startConversation = function () {

        messageService.setMum({
            type: "sms",
            date: moment.utc().format("DD-MM-YYYY HH:mm:ss"),
            phoneNumber: $scope.contact.phoneNumber,
            email: $scope.contact.email,
            displayName: $scope.contact.displayName
        });

        var receivers = [];
        receivers.push($scope.contact.phoneNumber);
        messageService.setConversation({
            id: null,
            image: ($scope.contact.photo == 'img/person.png')? null : $scope.contact.photo,
            displayName: $scope.contact.displayName,
            type: "sms",
            receivers: JSON.stringify(receivers)
        });

        $state.go('conversation');
    }
});
