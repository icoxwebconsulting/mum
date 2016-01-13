angular.module('app.contacts', []).factory('Contacts', function ($cordovaContacts, SERVER_CONF) {

    function getAllContacts(callback) {

        //var chats = [{
        //    id: 0,
        //    name: 'Ben Sparrow',
        //    number: '04123600295',
        //    face: 'img/ben.png'
        //}, {
        //    id: 1,
        //    name: 'Max Lynx',
        //    number: '04123600295',
        //    face: 'img/max.png'
        //}, {
        //    id: 2,
        //    name: 'Adam Bradleyson',
        //    number: '04123600295',
        //    face: 'img/adam.jpg'
        //}, {
        //    id: 3,
        //    name: 'Perry Governor',
        //    number: '04123600295',
        //    face: 'img/perry.png'
        //}, {
        //    id: 4,
        //    name: 'Mike Harrington',
        //    number: '04123600295',
        //    face: 'img/mike.png'
        //}];

        //callback(chats);

        function onSuccess(contacts) {
            var c = [];
            for (var i = 0, length = contacts.length; i < length; i++) {
                if (contacts[i].displayName && contacts[i].phoneNumbers) {  // many contacts don't have displayName
                    for (var j = 0, innerLength = contacts[i].phoneNumbers.length; j < innerLength; j++) {
                        c.push({
                            name: contacts[i].displayName,
                            number: contacts[i].phoneNumbers[j]
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
