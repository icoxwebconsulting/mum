angular.module('app').service('cameraService', function ($q, $cordovaCamera, $cordovaFile) {

    function capture(fromGallery) {
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

        if (fromGallery) {
            prefix = 'file://';
            options = {
                quality: 50,
                destinationType: Camera.DestinationType.FILE_URI,
                sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
                mediaType: Camera.MediaType.ALLMEDIA,
                saveToPhotoAlbum: true
            };
        }

        var deferred = $q.defer();

        $cordovaCamera.getPicture(options).then(function (imageURI) {
            imageURI = prefix + imageURI;
            var re = /(?:\.([^.]+))?$/;
            var fileExtension = re.exec(name)[1];
            fileExtension = fileExtension.toLowerCase();
            if (['jpg', 'jpeg'].indexOf(fileExtension)) {
                deferred.reject("badFileType");
            }
            deferred.resolve(imageURI);
        });

        return deferred.promise;
    }

    function sendImage(imageURI) {
        var indexOfSlash = imageURI.lastIndexOf('/') + 1;
        var name = imageURI.substr(indexOfSlash);
        var re = /(?:\.([^.]+))?$/;
        var fileExtension = re.exec(name)[1];
        fileExtension = fileExtension.toLowerCase();
        var namePath = imageURI.substr(0, indexOfSlash);
        if (['jpg', 'jpeg'].indexOf(fileExtension)) {

            throw new Error("fileType");
        }
        return $cordovaFile.copyFile(namePath, name, cordova.file.dataDirectory, name).then(function (info) {
            return $cordovaFile.readAsDataURL(cordova.file.dataDirectory, info.fullPath.substring(1)).then(function (dataURL) {
                return {
                    path: info.nativeURL,
                    data: dataURL,
                    fileExtension: fileExtension
                };
            });
        })
    }

    return {
        capture: capture,
        sendImage: sendImage
    };

});