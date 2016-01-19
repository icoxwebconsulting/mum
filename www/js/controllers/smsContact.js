angular.module('app').controller('SMSContactCtrl', function ($scope, $state, $ionicLoading, Contacts, messageSrv) {

    var mum = messageSrv.getMum();
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
        messageSrv.setMum(mum);

        $state.go('message');
    }
});
