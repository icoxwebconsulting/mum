angular.module('app').controller('ContactDetailCtrl', function ($scope, $state, $ionicPopup, $ionicLoading, messageService, Contacts) {

    $scope.contact;

    $scope.$on('$ionicView.enter', function (e) {
        $scope.contact = Contacts.getSingleContact();
    });

    $scope.startConversation = function (type) {

        messageService.setMessage({
            type: type,
            body: "",
            date: null,
            from: null,
            subject: null,
            phoneNumber: (type != 'email') ? $scope.contact.phone_number : null,
            email: (type == 'email') ? $scope.contact.email : null,
            displayName: $scope.contact.display_name,
            created: null,
        });

        var receivers = [];
        if (type == 'email') {
            receivers.push($scope.contact.email);
        } else {
            receivers.push($scope.contact.phone_number);
        }

        messageService.findConversation(type, receivers).then(function (response) {
            var conversation;

            if (response) {
                conversation = {
                    id: response.id,
                    image: response.image,
                    displayName: response.display_name,
                    type: response.type,
                    receivers: JSON.parse(response.receivers),
                    lastMessage: response.last_message,
                    created: response.created,
                    updated: response.updated
                };
            } else {
                conversation = {
                    id: null,
                    image: ($scope.contact.photo == 'img/person.png') ? null : $scope.contact.photo,
                    displayName: $scope.contact.display_name,
                    type: type,
                    receivers: receivers,
                    lastMessage: "",
                    created: null,
                    updated: null
                }
            }

            messageService.setConversation(conversation);
            $state.go('conversation');
        });
    };

    $scope.sendInvitation = function (number, name) {
        var popup = $ionicPopup.confirm({
            title: 'Mum Invitación',
            subTitle: 'Se enviará una invitación a MUM a ' + name + ', pulse Aceptar para continuar.',
            cancelText: 'Cancelar', // String (default: 'Cancel'). The text of the Cancel button.
            //cancelType: '', // String (default: 'button-default'). The type of the Cancel button.
            okText: 'Aceptar', // String (default: 'OK'). The text of the OK button.
            okType: 'button-mum', // String (default: 'button-positive'). The type of the OK button.
        });

        popup.then(function (res) {
            if (res) {
                var message = 'Estoy usando Mum, puedes entrar a tu tienda de aplicaciones y buscarlo para estar en contacto!';
                number = '04123600295';
                SMS.sendSMS(number, message, function () {
                    //enviado
                    $ionicPopup.alert({
                        title: 'Mum Invitación',
                        subTitle: 'Se ha enviado el mensaje satisfactoriamente.',
                        okText: 'Aceptar', // String (default: 'OK'). The text of the OK button.
                        okType: 'button-mum', // String (default: 'button-positive'). The type of the OK button.
                    });
                }, function (e) {
                    //no enviado
                    $ionicPopup.alert({
                        title: 'Mum Invitación',
                        subTitle: 'Ha ocurrido un error a la hora de enviar el SMS: ' + e,
                        okText: 'Aceptar', // String (default: 'OK'). The text of the OK button.
                        okType: 'button-mum', // String (default: 'button-positive'). The type of the OK button.
                    });
                });
            }
        });
    }
});
