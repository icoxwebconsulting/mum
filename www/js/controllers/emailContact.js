angular.module('app').controller('EmailContactCtrl', function ($scope, $state, $ionicLoading, Contacts, messageService) {

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
        return contact.email !== null;
    };

    $scope.pickContact = function (contact) {
        mum.email = contact.email;
        mum.displayName = contact.displayName;
        messageService.setMum(mum);

        $state.go('message');
    }
});
