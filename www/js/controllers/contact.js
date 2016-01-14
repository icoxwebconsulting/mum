angular.module('app').controller('ContactCtrl', function ($scope, $state, $ionicLoading, Contacts, messageSrv) {

    $ionicLoading.show();
    $scope.contacts = [];

    Contacts.getAllContacts(function (contacts) {
        $scope.$apply(function () {
            $scope.contacts = contacts;
            $ionicLoading.hide();
        });
    });

    $scope.pickContact = function (number) {
        var mum = messageSrv.getMum();
        mum.number = number;
        messageSrv.setMum(mum);

        $state.go('message');
    }
});
