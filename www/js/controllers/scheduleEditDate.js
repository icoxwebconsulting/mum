angular.module('app').controller('ScheduleEditDateCtrl', function ($scope, $state, $ionicPopup, messageService, $ionicScrollDelegate, $ionicPosition, $ionicLoading, $timeout, userDatastore, DATETIME_FORMAT_CONF, messageStorage) {

    function _removeTime(date) {
        return date.day(1).hour(1).minute(1).second(1).millisecond(1);
    }

    function _buildMonth($scope, start, month) {
        messageStorage.getScheduledMessagesCountByRange(start.clone().subtract(1, "week"), start.clone().add(2, "month"))
            .then(function (scheduledMessages) {
                $scope.weeks = [];
                var done = false, date = start.clone(), monthIndex = date.month(), count = 0;
                while (!done) {
                    $scope.weeks.push({days: _buildWeek(date.clone(), month, scheduledMessages)});
                    date.add(1, "w");
                    done = count++ > 2 && monthIndex !== date.month();
                    monthIndex = date.month();
                }
            });
    }

    function _buildWeek(date, month, scheduledMessages) {
        var days = [];
        for (var i = 0; i < 7; i++) {
            var hasEvents = false;

            for (var j = 0, length = scheduledMessages.length; j < length; j++) {
                if (scheduledMessages[j].at.substring(0, 10) == date.format('YYYY-MM-DD')) {
                    hasEvents = true;
                    break;
                }
            }

            var day = {
                name: date.format("dd").substring(0, 1),
                number: date.date(),
                isCurrentMonth: date.month() === month.month(),
                isToday: date.isSame(new Date(), "day"),
                date: date,
                hasEvents: hasEvents
            };
            days.push(day);
            date = date.clone();
            date.add(1, "d");
        }
        return days;
    }

    function getAllScheduledMessages(start) {
        messageStorage.getScheduledMessagesCountByRange(start.clone().subtract(1, "week"), start.clone().add(12, "month"))
            .then(function (scheduledMessages) {
                userDatastore.setScheduleMessages(scheduledMessages.length);
            });
    }

    var dateSchedule = userDatastore.getScheduleDay();
    if(dateSchedule){
        $scope.selected = _removeTime( moment(dateSchedule));
    }else {
        $scope.selected = _removeTime(moment());
    }
    $scope.month = $scope.selected.clone();

    var start = $scope.selected.clone();
    start.date(1);
    _removeTime(start.day(0));

    _buildMonth($scope, start, $scope.month);
    getAllScheduledMessages(start);
    $scope.totalScheduleMessages = userDatastore.getScheduleMessages();
    console.log('$scope->>', $scope);
    console.log('start->>', start);
    console.log('$scope.month->>', $scope.month);

    $scope.next = function () {
        var next = $scope.month.clone();
        $scope.fecha = next;
        _removeTime(next.month(next.month() + 1).date(1));
        $scope.month.month($scope.month.month() + 1);
        _buildMonth($scope, next, $scope.month);
    };

    $scope.previous = function () {
        var previous = $scope.month.clone();
        $scope.fecha = previous;
        _removeTime(previous.month(previous.month() - 1).date(1));
        $scope.month.month($scope.month.month() - 1);
        _buildMonth($scope, previous, $scope.month);
    };

    if (dateSchedule){
        $scope.fecha = moment(dateSchedule);
        $scope.selectedTime = $scope.fecha.format('HH:mm');
    } else {
        $scope.fecha = moment().add(10, 'minutes');
        $scope.selectedTime = $scope.fecha.format('HH:mm');
    }

    $scope.$on('$ionicView.beforeEnter', function (e) {

        if(userDatastore.getStateCurrentName() == 'layout.inbox') {
            $scope.fecha = moment().add(10, 'minutes');
        }
        userDatastore.setStateCurrentName($state.current.name);
    });

    $scope.$on('$ionicView.enter', function () {
        //fechas
//        $scope.fecha = moment().add(10, 'minutes');
//        $scope.selectedTime = $scope.fecha.format('HH:mm');
//        dateSchedule();

        var dateSchedule = userDatastore.getScheduleDay();
        if (dateSchedule){
            $scope.fecha = moment(dateSchedule);
            $scope.selectedTime = $scope.fecha.format('HH:mm');
        } else {
            $scope.fecha = moment().add(10, 'minutes');
            $scope.selectedTime = $scope.fecha.format('HH:mm');
        }
        $scope.scrollToDay();
    });

    $scope.scrollToDay = function () {
        var element = $ionicPosition.position(angular.element(document.getElementsByClassName('calendar-day clear-btn flex-xs active')[0]));
//        console.log('scroll to day', $ionicPosition.position(angular.element(document.getElementsByClassName('calendar-day clear-btn flex-xs active'))));
        console.info('element --> ', angular.element(document.getElementsByClassName('calendar-day clear-btn flex-xs active')[0]));
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

    $scope.select = function (day) {
        $scope.selected = day.date;
        var dateParam = moment((day.date._d).toString()).format('YYYY-MM-DD');
        userDatastore.setScheduleDay(dateParam);
        var selectedDate = moment($scope.selected).format(DATETIME_FORMAT_CONF.dateTimeFormat);
        var selected = moment($scope.selected).format('D');

        if (moment(selectedDate).format('YYYY-MM-DD') < moment().format('YYYY-MM-DD') ){
            showPopup();
        }else {
            $scope.fecha.date(selected);
        }
    };

    $scope.changeDay = function ($index) {
        var selected = $index + 1;
        var selectedDate = moment($scope.fecha.date(selected)).format(DATETIME_FORMAT_CONF.dateTimeFormat);

        console.info('selectedDate', selectedDate);

        if (selectedDate < moment().format(DATETIME_FORMAT_CONF.dateTimeFormat)) {
            showPopup();
        } else {
            $scope.fecha.date(selected);
            console.info('$scope.fecha.date(selected)', $scope.fecha.date(selected));
        }
    };

    $scope.getTime = function () {
        return $scope.fecha.format('HH:m');
    };

    $scope.monthUp = function () {
        $scope.fecha.add(1, 'M');
    };

    $scope.monthDown = function () {
        $scope.fecha.subtract(1, 'M');
    };

    $scope.timeUp = function () {
        $scope.fecha.add(1, 'm');
        $scope.selectedTime = $scope.fecha.format('HH:mm');
    };

    $scope.timeDown = function () {
        $scope.fecha.subtract(1, 'm');
        $scope.selectedTime = $scope.fecha.format('HH:mm');
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
            $scope.selectedTime = $scope.fecha.format('HH:mm');
        }
    }

    $scope.backNavigation = function () {
        navigator.app.backHistory();
    };

    $scope.updateMessage = function () {
        var objectMessage = JSON.parse(userDatastore.getObjectMessage());
        console.log('objectMessage', objectMessage);
        objectMessage.date = moment($scope.fecha,'YYYY-MM-DD HH:mm:ss');
        objectMessage.at = moment($scope.fecha).format('YYYY-MM-DD HH:mm:ss');
        console.log('objectMessage.date ', objectMessage.date);

        userDatastore.setObjectMessage(JSON.stringify(objectMessage));
        console.log('objectMessage change', objectMessage);

        $ionicLoading.show({
            content: 'Loading',
            animation: 'fade-in',
            showBackdrop: true,
            maxWidth: 200,
            showDelay: 10
        });

        $timeout(function () {
            $ionicLoading.hide();
            navigator.app.backHistory();
        }, 2000);



    };

    $scope.timePickerObject = {
        inputEpochTime: ($scope.fecha.unix() + ($scope.fecha.utcOffset() * 60)),  //Optional
        step: 1,  //Optional
        format: 24,  //Optional
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
