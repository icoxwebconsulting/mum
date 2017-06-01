angular.module('app.filters', []).filter('parseDate', function () {
    var changeDate = function (text) {

        var timeArray = text.split(' ');


        var dateFull =  timeArray[0];
        var time =  timeArray[1];
        var dateArray = dateFull.split('-');


        var year = dateArray[2];
        var month = dateArray[1];
        var day = dateArray[0];

        var dateFormat = year + '-' + month + '-' + day + 'T' + time;

        var dateUtc = moment.utc(dateFormat).toDate();

        var dateNewFormat = dateUtc.toString().split(' ');

        var dateLastMessages = dateNewFormat[4];

        return dateLastMessages;
    };

    return changeDate;
});
