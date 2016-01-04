angular.module('app').controller('MainCtrl', function ($scope, $state, $ionicActionSheet, $cordovaContacts) {
    $scope.day = moment();

    $scope.showMenu = function () {

        // Show the action sheet
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                {text: 'Perfil'},
                {text: 'Nuevo grupo'},
                {text: 'Política de privacidad'}
            ],
            titleText: 'Opciones',
            cancelText: 'Cancelar',
            cancel: function () {
                // add cancel code..
            },
            buttonClicked: function (index) {
                switch (index) {
                    case 0:
                        $state.go('profile');
                        break;
                    case 2:
                        $state.go('terms');
                        break;
                }

                return true;
            }
        });

    };

    $scope.showContacts = function () {
        //navigator.contacts.pickContact(function(contact){
        //  alert('The following contact has been selected:' + JSON.stringify(contact));
        //},function(err){
        //  console.log('Error: ' + err);
        //});
//    var options      = new ContactFindOptions();
//    options.filter   = "David";
//    options.multiple = true;
//    options.desiredFields = [navigator.contacts.fieldType.id];
//    options.hasPhoneNumber = true;
//alert(options);
//    navigator.contacts.find([navigator.contacts.fieldType.displayName, navigator.contacts.fieldType.name], function(data){
//      //success
//      alert(JSON.stringify(data[0]));
//    }, function(data ){
//      //error
//      //alert(data);
//    }, options);
        $cordovaContacts.find({filter: 'David'}).then(function (result) {
            $scope.contacts = result;
        }, function (error) {
            console.log("ERROR: " + error);
        });

    };
});
