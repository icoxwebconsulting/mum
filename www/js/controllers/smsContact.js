angular.module('app').controller('SMSContactCtrl', function ($scope, $state, $ionicLoading, Contacts, messageSrv) {

    var mum = messageSrv.getMum();
    console.log(mum);

    $ionicLoading.show();
    $scope.contacts = [];

    function showContacts(contacts) {
        $scope.$apply(function () {
            $scope.contacts = contacts;
            $ionicLoading.hide();
        });
    }

    Contacts.getContactsWithPhoneNumber(function (contacts) {
        showContacts(contacts);
    });

    $scope.pickContact = function (contact) {
        var mum = messageSrv.getMum();
        mum.number = contact.number;
        messageSrv.setMum(mum);

        $state.go('message');
    }
});
