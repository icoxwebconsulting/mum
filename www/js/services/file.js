angular.module('app').service('fileService', function ($q) {

    function download(URL, Folder_Name, File_Name) {
        //step to request a file system
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fileSystem) {
            var download_link = encodeURI(URL);
            var ext = download_link.substr(download_link.lastIndexOf('.') + 1); //Get extension of URL

            var directoryEntry = fileSystem.root; // to get root path of directory
            directoryEntry.getDirectory(Folder_Name, {
                create: true,
                exclusive: false
            }, function (m) {//success
                console.log("Directorio creado", m)
            }, function () {//fail
                alert("No se puede crear el directorio: " + error.code);
            }); // creating folder in sdcard

            var rootdir = fileSystem.root;
            var fp = rootdir.toURL();//fileSystem.root.nativeURL//rootdir.fullPath; // Returns Fulpath of local directory
            // reemplazar por rootdir.toUrl()? 

            fp = fp + "/" + Folder_Name + "/" + File_Name; // fullpath and name of the file which we want to give
            //fp = "cdvfile://localhost/persistent/" + File_Name;
            // download function
            var fileTransfer = new FileTransfer();
            console.log(fp);

            // File download function with URL and local path
            fileTransfer.download(download_link, fp,
                function (entry) {
                    //alert("download complete: " + entry.fullPath);
                    window.plugins.scanmedia.scanFile(fp, function (msg) {
                        alert("Success ScanMedia");
                    }, function (err) {
                        alert("Fail ScanMedia: " + err);
                    })
                },
                function (error) {
                    //Download abort errors or download failed errors
                    console.log(error);
                    alert(error.exception);
                    alert("download error source " + error.source);
                    //alert("download error target " + error.target);
                    //alert("upload error code" + error.code);
                }
            );

        }, function (e) {
            var msg = '';

            switch (e.code) {
                case FileError.QUOTA_EXCEEDED_ERR:
                    msg = 'QUOTA_EXCEEDED_ERR';
                    break;
                case FileError.NOT_FOUND_ERR:
                    msg = 'NOT_FOUND_ERR';
                    break;
                case FileError.SECURITY_ERR:
                    msg = 'SECURITY_ERR';
                    break;
                case FileError.INVALID_MODIFICATION_ERR:
                    msg = 'INVALID_MODIFICATION_ERR';
                    break;
                case FileError.INVALID_STATE_ERR:
                    msg = 'INVALID_STATE_ERR';
                    break;
                default:
                    msg = 'Unknown Error';
                    break;
            }
            ;

            alert('Error: ' + msg);
        });
    }

    function readFile(fileName) {

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
        download: download,
        readFile: readFile,
        saveImageToPhone: saveImageToPhone,
        openFile: openFile
    }
});