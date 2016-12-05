angular.module('app').controller('ScheduleDetailsCtrl', function ($scope, $state, messageService, DATETIME_FORMAT_CONF, messageRes, userDatastore) {

    $scope.$on('$ionicView.enter', function (e) {
        $scope.message = messageService.getMessage();
        $scope.date = moment(($scope.message.at).toString()).format('YYYY-MM-DD');
        console.log('scope message', $scope.message);
        init();
    });

    function init(){
        userDatastore.setRefreshingAccessToken(0);
    }

    function requestMessage(){
        messageService.findSpecificMessage($scope.message.id).then(function(response){
            console.log('result', response);
            if(response){
                $scope.dateM = moment(($scope.message.at).toString()).format('YYYY-MM-DD')
                console.log('seteando mensaje y redireccion', $scope.dateM);
                messageService.updateSpecificMessage($scope.message);
                $state.go('layout.scheduleList',{"date":$scope.date});
            }else{
                console.log('no existe el mensaje');
            }
        });
    }

    $scope.updateMessage = function(){
        console.log('datos enviados',$scope.message);
        requestMessage();

        /*if ($scope.message.type == 'mum') {
            messageRes(userDatastore.getTokens().accessToken).patchMessageRes(
                {messageId: $scope.message.id},
                {'body': $scope.message.body}
            ).$promise
                .then(
                    function (response) {
                        requestMessage();
                        console.log('Update mum', response);
                    })
                .catch(function (error) {
                    console.log('error de messageRes', error);
                });
        }
        else {
            messageRes(userDatastore.getTokens().accessToken).patchEmailRes(
                {messageId: $scope.message.id},
                {'body': $scope.message.body}
            ).$promise
                .then(
                    function (response) {
                        requestMessage();
                        console.log('Update email', response);
                    })
                .catch(function (error) {
                    console.log('error de patchEmailRes', error);
                });
        }*/

    }

});
