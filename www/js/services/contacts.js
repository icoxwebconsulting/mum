angular.module('app.contacts', []).factory('Contacts', function () {

    var fields = [
        navigator.contacts.fieldType.displayName,
        navigator.contacts.fieldType.name,
        navigator.contacts.fieldType.emails,
        navigator.contacts.fieldType.phoneNumbers,
        navigator.contacts.fieldType.photos
    ];

    function getContactsWithPhoneNumber(callback) {
        function onSuccess(contacts) {
            var c = [];
            for (var i = 0, length = contacts.length; i < length; i++) {
                if (contacts[i].displayName && contacts[i].phoneNumbers) {
                    for (var j = 0, innerLength = contacts[i].phoneNumbers.length; j < innerLength; j++) {
                        c.push({
                            photo: (contacts[i].photos) ? contacts[i].photos[0].value : 'img/account.png',
                            name: contacts[i].displayName,
                            number: contacts[i].phoneNumbers[j].value
                        });
                    }
                }
            }
            callback(c);
        }

        function onError(error) {
            console.log("Error: ", error);
        }

        var options = new ContactFindOptions();
        options.multiple = true;
        options.hasPhoneNumber = true;
        navigator.contacts.find(fields, onSuccess, onError, options);
    }

    function getContactsWithEmail(callback) {
        function onSuccess(contacts) {
            var c = [];
            for (var i = 0, length = contacts.length; i < length; i++) {
                if (contacts[i].displayName && contacts[i].emails) {
                    for (var j = 0, innerLength = contacts[i].emails.length; j < innerLength; j++) {
                        c.push({
                            name: contacts[i].displayName,
                            email: contacts[i].emails[j].value
                        });
                    }
                }
            }
            callback(c);
        }

        function onError(error) {
            console.log("Error: ", error);
        }

        var options = new ContactFindOptions();
        options.multiple = true;
        options.hasPhoneNumber = false;
        navigator.contacts.find(fields, onSuccess, onError, options);
    }

    return {
        getContactsWithPhoneNumber: getContactsWithPhoneNumber,
        getContactsWithEmail: getContactsWithEmail
    };
});
