angular.module('app').controller('EmailContactCtrl', function ($scope, $state, $ionicLoading, Contacts, messageService) {

    var message = messageService.getMessage();

    $scope.contacts = [];
    $scope.contactsType = message.type;

    $ionicLoading.show();
    Contacts.getEmailContacts()
        .then(function (dbContacts) {
            $scope.contacts = [];
            for (var i = 0, length = dbContacts.length; i < length; i++) {
                $scope.contacts.push(dbContacts[i]);
            }
            $ionicLoading.hide();
        });

    $scope.pickContact = function (contact) {
        message.email = contact.email;
        message.displayName = contact.display_name;
        messageService.setMessage(message);

        $state.go('message');
    }
});
