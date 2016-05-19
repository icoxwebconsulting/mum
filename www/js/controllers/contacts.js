angular.module('app').controller('ContactsCtrl', function ($scope, $state, $ionicLoading, Contacts) {
    $scope.contacts = [];

    $ionicLoading.show();
    Contacts.getContacts()
        .then(function (dbContacts) {
            $scope.contacts = [];
            for (var i = 0, length = dbContacts.length; i < length; i++) {
                $scope.contacts.push(dbContacts.item(i));
            }
            $ionicLoading.hide();
        });

    $scope.contactDetail = function (contact) {
        Contacts.setSingleContact(contact);
        $state.go('layout.contactDetail');
    };

    $scope.clearSearch = function() {
        $scope.search = '';
    };

});
