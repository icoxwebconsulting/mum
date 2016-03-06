angular.module('app').controller('EmailContactCtrl', function ($scope, $state, $ionicLoading, Contacts, messageService) {

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
        return contact.email !== null;
    };

    $scope.pickContact = function (contact) {
        message.email = contact.email;
        message.displayName = contact.displayName;
        messageService.setMessage(message);

        $state.go('message');
    }
});
