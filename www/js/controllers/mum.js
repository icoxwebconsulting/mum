angular.module('app').controller('MumCtrl', function ($scope, $state, messageSrv) {

    //fechas
    $scope.fecha = moment();
    $scope.selectedTime = $scope.fecha.format('hh:mm a');

    $scope.newMum = function (type) {
        messageSrv.setMum({
            type: type,
            date: $scope.fecha
        });
        $state.go('message');
    };

    $scope.changeDay = function ($index) {
        $scope.fecha.date($index + 1);
    };

    $scope.getTime = function () {
        return $scope.fecha.format('hh:m a');
    };

    $scope.monthUp = function () {
        $scope.fecha.add(1, 'M');
    };

    $scope.monthDown = function () {
        $scope.fecha.subtract(1, 'M');
    };

    $scope.timeUp = function () {
        $scope.fecha.add(1, 'm');
        $scope.selectedTime = $scope.fecha.format('hh:mm a');
    };

    $scope.timeDown = function () {
        $scope.fecha.subtract(1, 'm');
        $scope.selectedTime = $scope.fecha.format('hh:mm a');
    };

    $scope.getMaxDay = function () {
        return new Array($scope.fecha.daysInMonth());
    };

    $scope.calculateWeekDay = function (day) {
        var clon = $scope.fecha.clone();
        clon.date(day);
        return clon.format('ddd');
    };

    $scope.changeTime = function ($event) {
        $event.target
    };

    function timePickerCallback(val) {
        if (typeof (val) === 'undefined') {
            console.log('Time not selected');
        } else {
            var selectedTime = new Date(val * 1000);
            console.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), ':', selectedTime.getUTCMinutes(), 'in UTC');
            $scope.fecha.hour(selectedTime.getUTCHours());
            $scope.fecha.minute(selectedTime.getUTCMinutes());
            $scope.selectedTime = $scope.fecha.format('hh:mm a');
        }
    }

    $scope.timePickerObject = {
        inputEpochTime: ($scope.fecha.unix() + ($scope.fecha.utcOffset() * 60)),  //Optional
        step: 1,  //Optional
        format: 12,  //Optional
        titleLabel: 'Seleccione una hora',  //Optional
        setLabel: 'Aceptar',  //Optional
        closeLabel: 'Cancelar',  //Optional
        //setButtonType: 'button-positive',  //Optional
        //closeButtonType: 'button-stable',  //Optional
        callback: function (val) {    //Mandatory
            timePickerCallback(val);
        }
    };
});
