angular.module('app').controller('MumContactCtrl', function ($scope, $state, $ionicLoading, Contacts, messageService) {

    var message = messageService.getMessage();

    $scope.contacts = [];
    $scope.contactsType = message.type;

    $ionicLoading.show();
    Contacts.getMUMContacts()
        .then(function (dbContacts) {
            $scope.contacts = [];
            for (var i = 0, length = dbContacts.length; i < length; i++) {
                $scope.contacts.push(dbContacts[i]);
            }
            $ionicLoading.hide();
        });

    $scope.filterContacts = function () {
        return true;
    };

    $scope.pickContact = function (contact) {
        message.phoneNumber = contact.phoneNumber;
        message.displayName = contact.displayName;

        messageService.setMessage(message);

        $state.go('message');
    }
});