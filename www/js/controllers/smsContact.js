angular.module('app').controller('SMSContactCtrl', function ($scope, $state, $ionicLoading, Contacts, messageService) {

    var message = messageService.getMessage();

    $scope.contacts = [];
    $scope.contactsType = message.type;

    function showContacts(contacts) {
        $scope.contacts = contacts;
        $ionicLoading.hide();
    }

    $ionicLoading.show();
    Contacts.getContacts()
        .then(function (contacts) {
            showContacts(contacts);
        });

    $scope.filterContacts = function (contact) {
        return contact.phoneNumber !== null;
    };

    $scope.pickContact = function (contact) {
        message.phoneNumber = contact.phoneNumber;
        message.displayName = contact.displayName;
        messageService.setMessage(message);

        $state.go('message');
    }
});
