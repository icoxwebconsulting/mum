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
            }, onDirectorySuccess, onDirectoryFail); // creating folder in sdcard
            var rootdir = fileSystem.root;
            var fp = fileSystem.root.nativeURL//rootdir.fullPath; // Returns Fulpath of local directory
            // reemplazar por rootdir.toUrl()? 

            fp = fp + "/" + Folder_Name + "/" + File_Name; // fullpath and name of the file which we want to give
            
            // download function
            var fileTransfer = new FileTransfer();
            // File download function with URL and local path
            fileTransfer.download(download_link, fp,
                function (entry) {
                    alert("download complete: " + entry.fullPath);
                },
                function (error) {
                    //Download abort errors or download failed errors
                    alert("download error source " + error.source);
                    //alert("download error target " + error.target);
                    //alert("upload error code" + error.code);
                }
            );
            
        }, fileSystemFail);
        

        function onDirectorySuccess(parent) {
            // Directory created successfuly
        }

        function onDirectoryFail(error) {
            //Error while creating directory
            alert("Unable to create new directory: " + error.code);
        }

        function fileSystemFail(evt) {
            //Unable to access file system
            alert(evt.target.error.code);
        }
    }

    return {
        download:download
    }
});