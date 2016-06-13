angular.module('app').controller('ConversationCtrl', function ($scope, $rootScope, $state, $ionicScrollDelegate, messageService, focus, $timeout,
                                                               $ionicActionSheet, $ionicLoading, $ionicPopup, $ionicModal, cameraService, fileService) {

    var message;

    $scope.messages = [];
    $scope.conversation;
    $scope.body = "";
    $scope.subject = "";
    $scope.from = null;
    $scope.imageSrc = '';
    $scope.isVisor = false;

    //The view has fully entered and is now the active view. This event will fire, whether it was the first load or a cached view.
    $scope.$on('$ionicView.enter', function (e) {
        $scope.conversation = messageService.getConversation();
        $scope.conversation.isUnread = 0;
        message = messageService.getMessage();
        if ($scope.conversation.id) {
            messageService.getConversationMessages($scope.conversation.id).then(function (msjs) {
                for (var i = 0; i < msjs.length; i++) {
                    msjs[i].created = moment.utc(msjs[i].created).tz(moment.tz.guess()).format("D MMM hh:mm a");
                }
                $scope.messages = msjs;
                $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom();
            });
        }
    });

    //The view has finished leaving and is no longer the active view. This event will fire, whether it is cached or destroyed.

    $scope.$on('$ionicView.leave', function (e) {
        $scope.messages = [];
        messageService.updateConversation($scope.conversation).then(function () {
            $scope.conversation = messageService.factory().createConversation();
        });
    });

    $rootScope.$on('sentMessage', function (e, toUpdate) {
        if (toUpdate.idConversation = $scope.conversation.id) {
            $scope.messages[toUpdate.index].id_message = toUpdate.idMessage;
        }
    });

    $rootScope.$on('receivedMessage', function (e, data) {
        if ($rootScope.currentState == "conversation" && $scope.conversation.id == data.conversation.id) {
            var date = moment.utc().tz(moment.tz.guess()).format("D MMM hh:mm a");
            $scope.messages.push({
                about: (data.type = 'email') ? "" : null,
                at: null,
                from_address: (data.type = 'email') ? "" : null,
                id: data.idMessage, //TODO: revisar que se cambio de idConversation
                body: data.message.body,
                to_send: false,
                is_received: true,
                attachment: (data.message.body.indexOf("http://188.138.127.53/mum/framework/web/") != -1) ? data.message.body : null,
                created: date
            });

            $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom();
        }
    });

    $scope.sendMessage = function (isFile, obj) {
        //console.log(obj);

        if (isFile === undefined) {
            isFile = false;
            obj = {
                path: null,
                fileData: null,
                fileMimeType: null
            };
        }

        if (!isFile && ($scope.body == "" || $scope.body.length < 1 )) {
            return;
        }

        var type = $scope.conversation.type;
        var date = moment.utc();
        message.created = date.format("DD-MM-YYYY HH:mm:ss");
        if (isFile) {
            $scope.conversation.lastMessage = "Imagen";
        } else {
            $scope.conversation.lastMessage = $scope.body;
        }
        $scope.conversation.updated = date.format("DD-MM-YYYY HH:mm:ss");
        $scope.messages.push({
            about: (type = 'email') ? $scope.subject : null,
            at: null,
            from_address: (type = 'email') ? $scope.from : null,
            id: $scope.conversation.id,
            body: $scope.body,
            to_send: true,
            is_received: false,
            is_file: isFile,
            attachment: obj.path,
            //path: obj.path,
            //Agreaagr url de la imagen desde la vista
            created: date.tz(moment.tz.guess()).format("D MMM hh:mm a")
        });
        //$ionicScrollDelegate.$getByHandle('mainScroll').resize();
        $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom();

        var lastItem = $scope.messages.length - 1;

        function processSend() {
            message.body = $scope.body;
            message.toUpdate = lastItem;
            if (type == 'email') {
                message.from = $scope.from;
                message.subject = $scope.subject;
            }
            message.path = obj.path;
            message.fileData = obj.fileData;
            message.fileMimeType = obj.fileMimeType;
            $scope.body = "";
            focus('inputMsj');
            messageService.sendMessage(message, $scope.conversation).then(function () {
                //TODO:
            }).catch(function (error) {
            });
        }

        if (!$scope.conversation.id) {
            messageService.findConversation(type, $scope.conversation.receivers).then(function (response) {
                if (response) {
                    $scope.conversation.id = response.id;
                    $scope.conversation.image = response.image;
                    $scope.conversation.displayName = response.display_name;
                    $scope.conversation.type = response.type;
                    $scope.conversation.receivers = JSON.parse(response.receivers);
                    $scope.conversation.lastMessage = response.last_message;
                    $scope.conversation.created = response.created;
                    $scope.conversation.updated = response.updated;

                    processSend();
                } else {
                    $scope.conversation.created = date;
                    messageService.saveConversation($scope.conversation).then(function (insertId) {
                        $scope.conversation.id = insertId;
                        $rootScope.$emit('addConversation', {
                            conversation: $scope.conversation
                        });
                        processSend();
                    });
                }
            });
        } else {
            processSend();
        }
    };


    $scope.inputUp = function () {
        if (ionic.Platform.isIOS()) {
            $scope.data.keyboardHeight = 216;
        }
        $timeout(function () {
            $ionicScrollDelegate.scrollBottom(true);
        }, 300);

    };

    $scope.inputDown = function () {
        if (ionic.Platform.isIOS()) {
            $scope.data.keyboardHeight = 0;
        }
        $ionicScrollDelegate.resize();
    };

    function badFileType() {
        var alertPopup = $ionicPopup.alert({
            title: 'Información',
            template: 'Debe elegir archivos de tipo JPG.'
        });
    }

    $scope.actionUpload = function () {
        var hideSheet = $ionicActionSheet.show({
            buttons: [
                {text: '<i class="icon ion-camera"></i> Cámara'},
                {text: '<i class="icon ion-folder"></i> Galería'}
            ],
            titleText: 'Subir archivo',
            cancel: function () {
                return true;
            },
            buttonClicked: function (index) {
                $ionicLoading.show();
                cameraService.capture(index).then(function (response) {
                    $ionicLoading.hide();

                    $scope.imageSrc = response;
                    hideSheet();
                    $scope.isVisor = false;
                    $scope.openModal();
                    return true;
                }).catch(function (error) {
                    $ionicLoading.hide();
                    if (error == 'badFileType') {
                        badFileType();
                    }
                });
            }
        });
    };

    $scope.sendImage = function () {
        cameraService.sendImage($scope.imageSrc).then(function (response) {
            $scope.modal.hide();
            $scope.sendMessage(true, {
                path: response.path,
                fileData: response.data.substring(23),
                fileMimeType: response.fileExtension
            });
        }).catch(function (error) {
            if (error == 'badFileType') {
                badFileType();
            }
        });
    };

    $ionicModal.fromTemplateUrl('templates/image-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });

    $scope.openModal = function () {
        $scope.modal.show();
    };

    $scope.closeModal = function () {
        $scope.modal.hide();
    };

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.modal.remove();
    });

    $scope.openFile = function (url) {
        $scope.imageSrc = url;
        $scope.isVisor = true;
        $scope.openModal();
    };

    $scope.proccessImage = function () {

        var url = $scope.imageSrc;
        url = url.replace("_mini", "");

        var fileName = url.substr(url.lastIndexOf('/') + 1);
        //fileService.download(url, "mum", fileName);
        fileService.saveImageToPhone(url, fileName, function (imageURI) {
            //success
            console.log(imageURI);
            $scope.closeModal();
            fileService.openFile(imageURI, "image/jpeg", function (m) {
                //success
            }, function (e) {
                //error
                console.log(e);
            });
        }, function (msg) {
            //error
            console.log(msg);
        });

    }
});
