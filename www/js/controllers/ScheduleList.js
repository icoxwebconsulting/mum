angular.module('app').controller('ScheduleListCtrl', function ($scope, $state, $ionicLoading, $stateParams, $ionicPopup, messageService, userDatastore, messageRes, DATETIME_FORMAT_CONF) {

    $scope.dateParam = $stateParams;
    var popup;
    $ionicLoading.show();
    messageService.getSchedulesByDate($scope.dateParam.date).then(function (messages) {
        for (var i = 0; i < messages.length; i++) {
            messages[i].at = moment(moment.utc(messages[i].at).toDate()).format('YYYY-MM-DD HH:mm:ss');
            console.log('msjs[i].at', messages[i].at);
        }
        $scope.messages = messages;
        $ionicLoading.hide();
         console.log('messages:', $scope.messages);
    });
    init();

    $scope.open = function (scheduleMessage) {
        messageService.setMessage(scheduleMessage);

        if (popup) {
            popup.close();
        }
        $state.go('scheduleDetails');
    };

    function toDelete() {
        /*messageService.deleteSpecificMessage($scope.message).then(function () {
            $scope.messages.splice($scope.messages.indexOf($scope.message), 1);
            console.log('mum eliminado');
        }).catch(function (error) {
        });*/

        var messageId = $scope.message.id;
        messageRes(userDatastore.getTokens().accessToken).deleteMessageRes({messageId: messageId}, {}).$promise.then(
            function (response) {
                console.log('mum eliminado desde al servidor', response);
            }).then(function () {
            messageService.deleteSpecificMessage($scope.message).then(function () {
                $scope.messages.splice($scope.messages.indexOf($scope.message), 1);
                if($scope.messages.length == 0){
                    $state.go('layout.home');
                }
            }).catch(function (error) {
                console.log(error);
            });
        }).catch(function (error) {
            console.log('error de messageRes', error);
        });
    }


    function init(){
        userDatastore.setRefreshingAccessToken(0);
    }

    $scope.deleteMessage = function (message) {
        $scope.message = message;
        popup = $ionicPopup.alert({
            title: 'Eliminar MUM',
            subTitle: '¿Desea eliminar el MUM programado?',
            scope: $scope,
            buttons: [
                {
                    text: '<b>Aceptar</b>',
                    type: 'button-mum',
                    onTap: function (e) {
                        toDelete();
                    }
                },
                {text: 'Cancelar'}
            ]
        });
    };

});
