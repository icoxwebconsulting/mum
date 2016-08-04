angular.module('app').directive("calendar", function (messageStorage) {
    return {
        restrict: "E",
        templateUrl: "templates/calendar.html",
        scope: {
            selected: "="
        },
        link: function (scope) {
            scope.selected = _removeTime(scope.selected || moment());
            scope.month = scope.selected.clone();

            var start = scope.selected.clone();
            start.date(1);
            _removeTime(start.day(0));

            _buildMonth(scope, start, scope.month);

            scope.select = function (day) {
                scope.selected = day.date;
            };

            scope.next = function () {
                var next = scope.month.clone();
                _removeTime(next.month(next.month() + 1).date(1));
                scope.month.month(scope.month.month() + 1);
                _buildMonth(scope, next, scope.month);
            };

            scope.previous = function () {
                var previous = scope.month.clone();
                _removeTime(previous.month(previous.month() - 1).date(1));
                scope.month.month(scope.month.month() - 1);
                _buildMonth(scope, previous, scope.month);
            };
        }
    };

    function _removeTime(date) {
        return date.day(1).hour(1).minute(1).second(1).millisecond(1);
    }

    function _buildMonth(scope, start, month) {
        messageStorage.getScheduledMessagesCountByRange(start.clone().subtract(1, "week"), start.clone().add(2, "month"))
            .then(function (scheduledMessages) {
                scope.weeks = [];
                var done = false, date = start.clone(), monthIndex = date.month(), count = 0;
                while (!done) {
                    scope.weeks.push({days: _buildWeek(date.clone(), month, scheduledMessages)});
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
});
