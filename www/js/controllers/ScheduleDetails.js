angular.module('app').controller('ScheduleDetailsCtrl', function ($scope, $state, $rootScope, $timeout, messageService, DATETIME_FORMAT_CONF, messageRes, userDatastore) {


    $scope.$on('$ionicView.beforeEnter', function (e) {
        if(userDatastore.getObjectMessage()){
            var messageObject = JSON.parse(userDatastore.getObjectMessage());
            $scope.message = messageObject;
            console.log('messageObject')
        }else {
            $scope.message = messageService.getMessage();
            console.log('$scope.message');
        }

        $scope.date = moment(($scope.message.at).toString()).format('YYYY-MM-DD');
        console.log('scope message', $scope.message);

        init();
    });

    $scope.$on('$ionicView.enter', function (e) {

    });

    function init(){
        userDatastore.setRefreshingAccessToken(0);
    }

    function requestMessage() {
        messageService.findSpecificMessage($scope.message.id).then(function (response) {
            console.log('result', response);
            if (response) {
                $scope.dateM = moment(($scope.message.at).toString()).format('YYYY-MM-DD')
                console.log('seteando mensaje y redireccion', $scope.dateM);
                messageService.updateSpecificMessage($scope.message);
                // $state.go('layout.scheduleList', {"date": $scope.date});
            } else {
                console.log('no existe el mensaje');
            }
        });
    }

    $scope.editDate = function (message) {
        // $state.go('layout.scheduleList',{"date":$scope.date});
        userDatastore.setObjectMessage(JSON.stringify(message));

        $state.go('scheduleEditDate');
    };

    function toDelete() {
        var messageObj = JSON.parse(userDatastore.getObjectMessage());

        var messageId = messageObj.id;
        messageRes(userDatastore.getTokens().accessToken).deleteMessageRes({messageId: messageId}, {}).$promise.then(
            function (response) {
                console.log('mum eliminado desde al servidor', response);
            }).then(function () {
            messageService.deleteSpecificMessage(messageObj).then(function () {
                /*messageObj.splice(messageObj.indexOf(messageObj), 1);
                if(messageObj.length == 0){
                    $state.go('layout.home');
                }*/
            }).catch(function (error) {
                console.log(error);
            });
        }).catch(function (error) {
            console.log('error de messageRes', error);
        });
    }

    $scope.updateMessage = function(){
        toDelete();
        console.log('datos enviados',$scope.message);

        var messageObject = JSON.parse(userDatastore.getObjectMessage());

        $timeout(function () {
            var message = messageService.factory().createMessage();
            var conversation = messageService.factory().createConversation();
            message.type = messageObject.type;
            if (messageObject.date){
                var dateChange = moment(messageObject.date).tz(DATETIME_FORMAT_CONF.dateTimeZone).format(DATETIME_FORMAT_CONF.dateTimeFormat);
                message.date = moment(dateChange, DATETIME_FORMAT_CONF.dateTimeFormat);
            }else{
                dateChange = moment(messageObject.at).tz(DATETIME_FORMAT_CONF.dateTimeZone).format(DATETIME_FORMAT_CONF.dateTimeFormat);

                message.date = moment(dateChange, DATETIME_FORMAT_CONF.dateTimeFormat);
            }
            message.displayName = messageObject.display_name;
            // message.receivers = messageObject.receivers;
            message.body = $scope.message.body;
            conversation.receivers.push((messageObject.type == 'email') ? messageObject.receivers : messageObject.receivers);
            messageService.setMessage(message);

            function processSend() {
                messageService.sendMessage(message, conversation).then(function () {
                    //$ionicLoading.hide();
                    message = messageService.factory().createMessage();
                    conversation = messageService.factory().createConversation();
                    userDatastore.setEditMessage(true);
                    $state.go('refresh');
                }).catch(function (error) {
                    //$ionicLoading.hide();
                });
            }

            messageService.findConversation(message.type, conversation.receivers).then(function (response) {
                if (response) {
                    conversation.id = response.id;
                    messageService.setConversation(conversation);
                    processSend();
                } else {
                    messageService.saveConversation(conversation).then(function (insertId) {
                        conversation.id = insertId;
                        messageService.setConversation(conversation);
                        $rootScope.$emit('addConversation', {
                            conversation: conversation
                        });
                        processSend();
                    });
                }
            });
        }, 1000);


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
