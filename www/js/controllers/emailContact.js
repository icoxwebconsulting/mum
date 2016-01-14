angular.module('app').controller('EmailContactCtrl', function ($scope, $state, $ionicLoading, Contacts, messageSrv) {

    $ionicLoading.show();
    $scope.contacts = [];

    function showContacts(contacts) {
        $scope.$apply(function () {
            $scope.contacts = contacts;
            $ionicLoading.hide();
        });
    }

    Contacts.getContactsWithEmail(function (contacts) {
        showContacts(contacts);
    });

    $scope.pickContact = function (contact) {
        var mum = messageSrv.getMum();
        mum.email = contact.email;
        messageSrv.setMum(mum);

        $state.go('message');
    }
});
