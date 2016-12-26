angular.module('app').controller('ContactsCtrl', function ($scope, $state, $ionicLoading, Contacts, $ionicViewService) {
    $scope.contacts = [];
    $scope.$on('$ionicView.enter', function (e) {
        $ionicViewService.clearHistory();
        Contacts.getContactsProfile()
            .then(function(contactsMum){

              angular.forEach(contactsMum, function(value1, key1){
                  angular.forEach($scope.contacts, function(value2, key2){
                 if(value1.customer.username === value2.phone_number && value1.avatar_u_r_l != value2.photo){
                   var data = {
                      photo: value1.avatar_u_r_l,
                      phone_number: value2.phone_number
                   };
                   Contacts.uploadProfileContacts(data);
                   console.log('upload photo in ', value1.customer.username);
                 }
              });
            });
          })
          .then(function(){
            Contacts.getContacts()
              .then(function (dbContacts) {
                $scope.contacts = [];
                for (var i = 0, length = dbContacts.length; i < length; i++) {
                  $scope.contacts.push(dbContacts.item(i));
                }
              });
          });
    });

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
