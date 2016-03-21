angular.module('app').controller('SMSContactCtrl', function ($scope, $state, $ionicLoading, Contacts, messageService) {

    var message = messageService.getMessage();

    $scope.contacts = [];
    $scope.contactsType = message.type;

    $ionicLoading.show();
    Contacts.getSMSContacts()
        .then(function (dbContacts) {
            $scope.contacts = [];
            for (var i = 0, length = dbContacts.length; i < length; i++) {
                $scope.contacts.push(dbContacts[i]);
            }
            $ionicLoading.hide();
        });

    $scope.pickContact = function (contact) {
        message.phoneNumber = contact.phone_number;
        message.displayName = contact.display_name;
        messageService.setMessage(message);

        $state.go('message');
    }
});
