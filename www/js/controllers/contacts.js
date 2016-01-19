angular.module('app')
    .controller('ContactsCtrl', function ($scope, $state, $ionicPopup, $ionicLoading, $ionicHistory, Contacts) {
        $scope.contacts = [];

        function showContacts(contacts) {
            $scope.contacts = contacts;
            $ionicLoading.hide();
        }

        $ionicLoading.show();
        Contacts.getContacts()
            .then(function (contacts) {
                showContacts(contacts);
            });
    });
