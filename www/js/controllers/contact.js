angular.module('app').controller('ContactCtrl', function ($scope, $state, Contacts, messageSrv) {

    Contacts.getAllContacts(function (contacts) {
        $scope.contacts = contacts;
    });

    $scope.pickContact = function (number) {
        var mum = messageSrv.getMum();
        mum.number = number;
        messageSrv.setMum(mum);

        $state.go('message');
    }
});
