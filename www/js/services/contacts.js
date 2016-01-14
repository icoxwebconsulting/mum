angular.module('app.contacts', []).factory('Contacts', function () {

    function getAllContacts(callback) {
        function onSuccess(contacts) {
            var c = [];
            for (var i = 0, length = contacts.length; i < length; i++) {
                if (contacts[i].displayName && contacts[i].phoneNumbers) {  // many contacts don't have displayName
                    for (var j = 0, innerLength = contacts[i].phoneNumbers.length; j < innerLength; j++) {
                        c.push({
                            name: contacts[i].displayName,
                            number: contacts[i].phoneNumbers[j].value
                        });
                    }
                }
            }
            callback(c);
        }

        function contactError(error) {
            console.log("Error: ", error);
        }

        var options = new ContactFindOptions();
        options.filter = "";
        options.multiple = true;
        options.hasPhoneNumber = true;
        var filter = ["displayName", "phoneNumbers"];

        navigator.contacts.find(filter, onSuccess, contactError, options);
    }

    return {
        getAllContacts: getAllContacts
    };
});
