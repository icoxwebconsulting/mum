angular.module('app').controller('ContactCtrl', function ($scope, Contacts) {
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    Contacts.getAllContacts(function(contacts){
        $scope.contacts = contacts;
    });

});
