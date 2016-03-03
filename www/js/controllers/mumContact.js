angular.module('app').controller('MumContactCtrl', function ($scope, $state, $ionicLoading, Contacts, messageService) {

    var mum = messageService.getMum();
    $scope.contacts = [];
    $scope.contactsType = mum.type;

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
        mum.phoneNumber = contact.phoneNumber;
        mum.displayName = contact.displayName;
        messageService.setMum(mum);

        $state.go('message');
    }
});
