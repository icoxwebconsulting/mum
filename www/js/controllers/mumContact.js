angular.module('app').controller('MumContactCtrl', function ($scope, $state, $ionicLoading, Contacts, messageService) {

    var mum = messageService.getMum();
    $scope.contacts = [];
    $scope.contactsType = mum.type;

    $ionicLoading.show();
    Contacts.getMUMContacts()
        .then(function (dbContacts) {
            $scope.contacts = [];
            for (var i = 0, length = dbContacts.length; i < length; i++) {
                $scope.contacts.push(dbContacts[i]);
            }
            $ionicLoading.hide();
        });

    $scope.filterContacts = function () {
        return true;
    };

    $scope.pickContact = function (contact) {
        mum.phoneNumber = contact.phoneNumber;
        mum.displayName = contact.displayName;
        messageService.setMum(mum);

        $state.go('message');
    }
});
