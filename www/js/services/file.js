angular.module('app').service('fileService', function ($q) {

    function fileExist(fileName) {
        var deferred = $q.defer();
        
        window.resolveLocalFileSystemURL("file:///storage/emulated/0/Pictures/" + fileName, function (d) {
            console.log(d);
            deferred.resolve(true);
        }, function (e) {
            console.log(e);
            deferred.resolve(false);
        });

        return deferred.promise;
    }

    function saveImageToPhone(url, fileName, success, error) {
        var canvas, context, imageDataUrl, imageData;
        var img = new Image();
        img.onload = function () {
            canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            context = canvas.getContext('2d');
            context.drawImage(img, 0, 0);
            try {
                imageDataUrl = canvas.toDataURL('image/jpeg', 1.0);
                imageData = imageDataUrl.replace(/data:image\/jpeg;base64,/, '');
                cordova.exec(
                    success,
                    error,
                    'Canvas2ImagePlugin',
                    'saveImageDataToLibrary',
                    [imageData, fileName]
                );
            }
            catch (e) {
                error(e.message);
            }
        };
        try {
            img.src = url;
        }
        catch (e) {
            error(e.message);
        }
    }

    function openFile(imageURI, fileMimeType, success, error) {
        cordova.plugins.fileOpener2.open(
            imageURI,
            fileMimeType,
            {
                error: function (e) {
                    error(e);
                },
                success: function (m) {
                    success(m);
                }
            }
        );
    }

    return {
        fileExist: fileExist,
        saveImageToPhone: saveImageToPhone,
        openFile: openFile
    }
});