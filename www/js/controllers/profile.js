angular.module('app').controller('ProfileCtrl', function ($scope, $ionicModal, $ionicActionSheet, $cordovaCamera,
                                                          $cordovaFile, $ionicLoading, user) {
    function refreshProfileInfo() {
        $scope.displayName = user.getProfile().displayName;
        $scope.avatarURL = user.getProfile().avatarURL;

        // workaround of modal edition
        $scope.profile = {
            displayName: user.getProfile().displayName
        };
    }

    refreshProfileInfo();

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
                refreshProfileInfo();
                $scope.modal.hide();
                $ionicLoading.hide();
            });
    };

    $scope.cancelChange = function () {
        $scope.modal.hide();
    };

    $scope.$on('$destroy', function () {
        $scope.modal.remove();
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
                        return user.setProfile(user.getProfile().displayName,
                            response.path,
                            response.data.substring(23),
                            "jpeg");
                    })
                    .then(function () {
                        refreshProfileInfo();
                        $ionicLoading.hide();
                    })
                    .catch(function (error) {
                        $ionicLoading.hide();
                    });

                return true;
            }
        });
    };

});
