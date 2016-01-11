angular.module('app').controller('MumCtrl', function ($scope) {

    $scope.months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    $scope.weekDays = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
    $scope.monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    $scope.f = new Date();
    var d = $scope.f;

    //fecha seleccionada TODO
    $scope.selectedDay;
    $scope.selectedMonth;
    $scope.selectedYear;
    $scope.selectedTime = "10:00 AM";

    function maxDay() {
        $scope.maxDay = $scope.monthDays[$scope.month];
        if ($scope.month == 1 && ((($scope.year % 4 == 0) && ($scope.year % 100 != 0)) || ($scope.year % 400 == 0))) {
            $scope.maxDay = 29;
        }
    }

    $scope.$on('$ionicView.enter', function (e) {
        $scope.month = $scope.f.getMonth();
        $scope.year = $scope.f.getFullYear();
        maxDay();
    });

    $scope.monthUp = function () {
        if ($scope.month == 11) {
            $scope.month = 0;
            $scope.year += 1;
        } else {
            $scope.month += 1;
        }
        maxDay();
    };

    $scope.monthDown = function () {
        if ($scope.month == 0) {
            $scope.month = 11;
            $scope.year -= 1;
        } else {
            $scope.month -= 1;
        }
        maxDay();
    };

    $scope.hourUp = function () {

    };

    $scope.hourDown = function () {

    };

    $scope.getMaxDay = function () {
        return new Array($scope.maxDay);
    };

    $scope.calculateWeekDay = function (day) {
        d.setYear($scope.year)
        d.setMonth($scope.month);
        d.setDate(day);
        return $scope.weekDays[d.getDay()];
    };

    $scope.changeTime = function ($event) {
        $event.target
    };

    function timePickerCallback(val) {
        if (typeof (val) === 'undefined') {
            console.log('Time not selected');
        } else {
            var selectedTime = new Date(val * 1000);
            console.log(val);
            console.log('Selected epoch is : ', val, 'and the time is ', selectedTime.getUTCHours(), ':', selectedTime.getUTCMinutes(), 'in UTC');
        }
    }

    $scope.timePickerObject = {
        inputEpochTime: ((new Date()).getHours() * 60 * 60),  //Optional
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
