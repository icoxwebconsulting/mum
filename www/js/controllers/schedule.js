angular.module('app').controller('ScheduleCtrl', function ($scope, $state, $ionicPopup, messageService, $ionicScrollDelegate, $ionicPosition) {

    $scope.fecha = moment().add(10, 'minutes');
    $scope.selectedTime = $scope.fecha.format('hh:mm a');

    $scope.$on('$ionicView.enter', function () {
        //fechas
        $scope.fecha = moment().add(10, 'minutes');
        $scope.selectedTime = $scope.fecha.format('hh:mm a');
        $scope.scrollToDay();
    });

    $scope.scrollToDay = function () {
        var element = $ionicPosition.position(angular.element(document.getElementsByClassName('calendar-day clear-btn flex-xs active')[0]));
        $ionicScrollDelegate.$getByHandle('vscroll').scrollTo(element.left, element.top, true);
    };

    function showPopup() {
        $ionicPopup.alert({
            title: 'Fecha inválida',
            template: '<p>¡Ups! No podemos enviar mensajes al pasado. Envíe mensajes con 10 minutos o más de retardo.</p>'
        });
    }

    $scope.newSchedule = function (type) {
        var now = moment();
        if ($scope.fecha.diff(now, 'seconds') < 540) {
            showPopup();
        } else {
            var message = messageService.factory().createMessage();
            message.type = type;
            message.date = $scope.fecha;
            messageService.setMessage(message);
            $state.go('pick_contact');
        }
    };

    $scope.changeDay = function ($index) {
        var selected = $index + 1;
        if (selected < moment().date() && $scope.fecha.month() <= moment().month()) {
            showPopup();
        } else {
            $scope.fecha.date(selected);
        }
    };

    $scope.getTime = function () {
        return $scope.fecha.format('hh:m a');
    };

    $scope.monthUp = function () {
        $scope.fecha.add(1, 'M');
    };

    $scope.monthDown = function () {
        if ($scope.fecha.month() <= moment().month()) {
            showPopup();
        } else {
            $scope.fecha.subtract(1, 'M');
        }
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
        } else {
            var selectedTime = new Date(val * 1000);
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
