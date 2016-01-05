angular.module('app.contacts', []).factory('Contacts', function ($cordovaContacts, SERVER_CONF) {

    function getAllContacts(callback) {

        function onSuccess(contacts) {
            var c = [];
            for (var i = 0; i < contacts.length; i++) {
                if (contacts[i].displayName) {  // many contacts don't have displayName
                    for (var j = 0; j < contacts[i].phoneNumbers.length; j++) {
                        c.push({
                            name: contacts[i].displayName,
                            phone: contacts[i].phoneNumbers[j]
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
    };

    return {
        getAllContacts: getAllContacts
    };
});
