angular.module('app').controller('ContactCtrl', function ($scope, Contacts) {
    Contacts.getAllContacts(function (contacts) {
        $scope.contacts = contacts;
    });
});
