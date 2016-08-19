angular.module('app').controller('PickContactCtrl', function ($scope, $state, $ionicLoading, Contacts, messageService, $stateParams) {

    $scope.contacts = [];
    $scope.contactsType;
    var message;

    function processContacts(dbContacts){
        $scope.contacts = [];
        for (var i = 0, length = dbContacts.length; i < length; i++) {
            $scope.contacts.push(dbContacts.item(i));
        }
        $ionicLoading.hide();
    }

    $scope.$on('$ionicView.enter', function () {
        message = messageService.getMessage();
        $scope.contactsType = message.type;
        $ionicLoading.show();

        switch (message.type) {
            case 'email':
            {
                Contacts.getEmailContacts().then(processContacts);
                break;
            }
            case 'sms':
            {
                Contacts.getSMSContacts().then(processContacts);
                break;
            }
            case 'mum':
            {
                Contacts.getMUMContacts().then(processContacts);
                break;
            }
        }
    });

    $scope.$on('$ionicView.leave', function () {
        $scope.contacts = [];
    });

    $scope.pickContact = function (contact) {
        if (message.type == 'email') {
            message.email = contact.email;
        } else {
            message.phoneNumber = contact.phone_number;
        }
        message.displayName = contact.display_name;

        messageService.setMessage(message);

        $state.go('message');
    }
});
