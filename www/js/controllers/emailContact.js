angular.module('app').controller('EmailContactCtrl', function ($scope, $state, $ionicLoading, Contacts, messageService) {

    var message = messageService.getMessage();

    $scope.contacts = [];
    $scope.contactsType = message.type;

    $ionicLoading.show();
    Contacts.getContacts()
        .then(function (dbContacts) {
            $scope.contacts = [];
            for (var i = 0, length = dbContacts.length; i < length; i++) {
                $scope.contacts.push(dbContacts[i]);
            }
            $ionicLoading.hide();
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
