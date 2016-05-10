angular.module('app').controller('ConversationCtrl', function ($scope, $rootScope, $state, $ionicScrollDelegate, messageService, focus, $timeout,
                                                               $ionicActionSheet, $cordovaCamera,
                                                               $cordovaFile, $ionicLoading) {

    var message;

    $scope.messages = [];
    $scope.conversation;
    $scope.body = "";
    $scope.subject = "";
    $scope.from = null;

    //The view has fully entered and is now the active view. This event will fire, whether it was the first load or a cached view.
    $scope.$on('$ionicView.enter', function (e) {
        $scope.conversation = messageService.getConversation();
        $scope.conversation.isUnread = 0;
        message = messageService.getMessage();
        if ($scope.conversation.id) {
            messageService.getConversationMessages($scope.conversation.id).then(function (msjs) {
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
            var date = moment.utc().format("DD-MM-YYYY HH:mm:ss");
            $scope.messages.push({
                about: (data.type = 'email') ? "" : null,
                at: null,
                from_address: (data.type = 'email') ? "" : null,
                id: data.idMessage, //TODO: revisar que se cambio de idConversation
                body: data.message,
                to_send: false,
                is_received: true,
                created: date
            });

            $ionicScrollDelegate.$getByHandle('mainScroll').scrollBottom();
        }
    });

    $scope.sendMessage = function (isFile, obj) {
        //console.log(obj);

        if(isFile === undefined){
            isFile   = false;
            obj = {
                path: null,
                fileData: null,
                fileMimeType: null
            };
        }

        //console.log(obj);
        
        if (!isFile && ($scope.body == "" || $scope.body.length < 1 )) {
            return;
        }

        var type = $scope.conversation.type;
        var date = moment.utc().format("DD-MM-YYYY HH:mm:ss");
        message.created = date;
        if (isFile) {
            $scope.conversation.lastMessage = "Imagen";
        } else {
            $scope.conversation.lastMessage = $scope.body;
        }
        $scope.conversation.updated = date;
        $scope.messages.push({
            about: (type = 'email') ? $scope.subject : null,
            at: null,
            from_address: (type = 'email') ? $scope.from : null,
            id: $scope.conversation.id,
            body: $scope.body,
            to_send: true,
            is_received: false,
            is_file: isFile,
            attachSrc: obj.path,
            //Agreaagr url de la imagen desde la vista
            created: date
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
            if (isFile) {
                message.path  = obj.path;
                message.fileData = obj.fileData;
                message.fileMimeType = obj.fileMimeType;
            }
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

    $scope.actionUpload = function () {
        $ionicActionSheet.show({
            buttons: [
                {text: '<i class="icon ion-camera"></i> Hacer Foto'},
                {text: '<i class="icon ion-folder"></i> Seleccionar Foto'},
                {text: '<i class="icon ion-folder"></i> Seleccionar Archivo'}
            ],
            titleText: 'Subir archivo',
            cancel: function () {
                return true;
            },
            buttonClicked: function (index) {
                if (index == 0) {
                    var prefix = '';
                    var options = {
                        quality: 50,
                        destinationType: Camera.DestinationType.FILE_URI,
                        sourceType: Camera.PictureSourceType.CAMERA,
                        allowEdit: false,
                        correctOrientation: true,
                        encodingType: Camera.EncodingType.JPEG,
                        saveToPhotoAlbum: false
                    };
                } else if (index == 1) {
                    var prefix = 'file://';
                    var options = {
                        quality: 50,
                        destinationType: Camera.DestinationType.FILE_URI,
                        sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
                        mediaType: Camera.MediaType.ALLMEDIA,
                        saveToPhotoAlbum: true

                    };
                }

                $cordovaCamera.getPicture(options)
                    .then(function (imageURI) {
                        $ionicLoading.show();
                        imageURI = prefix + imageURI;
                        var indexOfSlash = imageURI.lastIndexOf('/') + 1;
                        var name = imageURI.substr(indexOfSlash);
                        var namePath = imageURI.substr(0, indexOfSlash);

                        return $cordovaFile.copyFile(namePath, name, cordova.file.dataDirectory, name);
                    })
                    .then(function (info) {
                        return $cordovaFile.readAsDataURL(cordova.file.dataDirectory, info.fullPath.substring(1))
                            .then(function (dataURL) {
                                return {
                                    path: info.nativeURL,
                                    data: dataURL
                                };
                            });
                    })
                    .then(function (response) {
                        $scope.sendMessage(true,
                            {
                                path: response.path,
                                fileData: response.data.substring(23),
                                fileMimeType: "jpeg"
                            });
                        $ionicLoading.hide();

                    })
                    //.then(function () {
                        //Preguntarle a David como guardar la Url en la base de datos del tlf y que se envie por el msj
                        //refreshProfileInfo();
                        //$ionicLoading.hide();
                    //})
                    .catch(function (error) {
                        $ionicLoading.hide();
                    });

                return true;
            }
        });
    };
});
