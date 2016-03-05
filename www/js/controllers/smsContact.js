angular.module('app').controller('SMSContactCtrl', function ($scope, $state, $ionicLoading, Contacts, messageService) {

    var mum = messageService.getMum();
    $scope.contacts = [];
    $scope.contactsType = mum.type;

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
        return contact.phone_number !== null;
    };

    $scope.pickContact = function (contact) {
        mum.phoneNumber = contact.phoneNumber;
        mum.displayName = contact.displayName;
        messageService.setMum(mum);

        $state.go('message');
    }
});
