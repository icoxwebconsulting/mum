angular.module('app').controller('ProfileCtrl', function ($scope, $ionicModal, $ionicActionSheet, $cordovaCamera,
                                                          $cordovaFile, $ionicLoading, user) {
    $scope.profile = user.getProfile();

    $ionicModal.fromTemplateUrl('templates/name-modal.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function (modal) {
        $scope.modal = modal;
    });

    $scope.openModal = function () {
        $scope.modal.show();
    };

    $scope.acceptChange = function () {
        $ionicLoading.show();
        user.setProfile($scope.profile.displayName)
            .then(function () {
                $scope.profile = user.getProfile();
                $scope.modal.hide();
                $ionicLoading.hide();
            });
    };

    $scope.cancelChange = function () {
        $scope.modal.hide();
    };

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function () {
        $scope.modal.remove();
    });

    // Execute action on hide modal
    $scope.$on('modal.hidden', function () {
        // Execute action
    });

    // Execute action on remove modal
    $scope.$on('modal.removed', function () {
        // Execute action
    });

    $scope.actionSheet = function () {
        $ionicActionSheet.show({
            buttons: [
                {text: '<i class="icon ion-camera"></i> Hacer Foto'},
                {text: '<i class="icon ion-folder"></i> Seleccionar Foto'}
            ],
            titleText: 'Foto de Perfil',
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
                } else {
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
                    //.then(function (imageURI) {
                    //    $ionicLoading.show();
                    //
                    //    imageURI = prefix + imageURI;
                    //
                    //    var canvas = document.createElement('canvas');
                    //    var ctx = canvas.getContext("2d");
                    //    var image = new Image();
                    //    image.onload = function () {
                    //        canvas.width = this.width;
                    //        canvas.height = this.height;
                    //        ctx.drawImage(image, 0, 0);
                    //    };
                    //    image.src = imageURI;
                    //    var dataURL = canvas.toDataURL("image/jpeg");
                    //    dataURL = dataURL.substring(23);
                    //    return user.setProfile(user.getProfile().displayName, dataURL, "jpeg");
                    //})
                    .then(function (imageURI) {
                        imageURI = prefix + imageURI;
                        var indexOfLash = imageURI.lastIndexOf('/') + 1;
                        var name = imageURI.substr(indexOfLash);
                        var namePath = imageURI.substr(0, indexOfLash);

                        return $cordovaFile.copyFile(namePath, name, cordova.file.dataDirectory, name);
                    })
                    .then(function (info) {
                        console.log('copied', info);
                        return $cordovaFile.readAsDataURL(cordova.file.dataDirectory, info.nativeURL);
                    })
                    .then(function (success) {
                        // success
                        console.log("image data", success);
                    })
                    .then(function () {
                        $scope.profile = user.getProfile();
                        $ionicLoading.hide();
                    })
                    .catch(function (error) {
                        console.log('Failed because', error);
                        $ionicLoading.hide();
                    });

                return true;
            }
        });
    };

});
