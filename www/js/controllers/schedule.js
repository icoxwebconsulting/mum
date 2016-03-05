angular.module('app').controller('ScheduleCtrl', function ($scope, $state, $ionicPopup, messageService) {

    //fechas
    $scope.fecha = moment().add(1, 'hours');
    $scope.selectedTime = $scope.fecha.format('hh:mm a');

    $scope.newSchedule = function (type) {
        var now = moment();
        if ($scope.fecha.diff(now, 'seconds') < 3500) {
            $ionicPopup.alert({
                title: 'Fecha inválida',
                template: '<p>¡Ups! No podemos enviar mensajes al pasado. Envíe mensajes con una hora o más de retardo.</p>'
            });
        } else {
            messageService.setMum({
                subject: "",
                body: "",
                from: "",
                type: type,
                date: $scope.fecha
            });

            switch (type) {
                case 'email':
                {
                    $state.go('email_contacts');
                    break;
                }
                case 'sms':
                {
                    $state.go('sms_contacts');
                    break;
                }
                case 'mum':
                {
                    $state.go('mum_contacts');
                    break;
                }
            }
        }
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
