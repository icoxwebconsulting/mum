angular.module('app').controller('EmailContactCtrl', function ($scope, $state, $ionicLoading, Contacts, messageSrv) {

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
        return contact.email !== null;
    };

    $scope.pickContact = function (contact) {
        mum.email = contact.email;
        messageSrv.setMum(mum);

        $state.go('message');
    }
});
