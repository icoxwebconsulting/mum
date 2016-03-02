angular.module('app.contacts', []).factory('Contacts', function ($q, $rootScope, contact) {

    var contacts = null;
    var loading = false;
    var singleContact;

    var Contact = function (displayNameArg, photoArg, emailArg, phoneNumberArg, mumIdArg) {
        var displayName = displayNameArg;
        var photo = photoArg;
        var email = emailArg || null;
        var phoneNumber = phoneNumberArg || null;
        var mumId = mumIdArg || null;

        function toString() {
            return displayName;
        }

        return {
            displayName: displayName,
            photo: photo,
            email: email,
            phoneNumber: phoneNumber,
            mumId: mumId,
            toString: toString
        }
    };

    function loadContacts() {
        var deferred = $q.defer();

        var loading = true;
        var temContacts = [];

        // TODO: remove this dummy case
        if (!ionic.Platform.isAndroid()) {
            //dummy data
            var dummyName = ['David', 'Jesus', 'Ricardo'];
            var dummyEmail = ['davidjdr@gmail.com', 'davidjdr+1@gmail.com', 'davidjdr+2@gmail.com'];
            var dummyPhone = ['+584123600295', '+584123600295', '+584123600295'];
            for (var i = 0, length = 3; i < length; i++) {
                // create new contact
                var contact = new Contact(dummyName[i], 'img/person.png');
                contact.email = dummyEmail[i];
                contact.phoneNumber = dummyPhone[i];
                temContacts.push(contact);
            }

            temContacts.sort();
            contacts = temContacts;
            loading = false;
            $rootScope.$emit('notifying-contact-loaded');
            deferred.resolve(contacts);

        } else {

            var fields = [
                navigator.contacts.fieldType.displayName,
                navigator.contacts.fieldType.name,
                navigator.contacts.fieldType.emails,
                navigator.contacts.fieldType.phoneNumbers,
                navigator.contacts.fieldType.photos
            ];

            var options = new ContactFindOptions();
            options.multiple = true;
            options.hasPhoneNumber = false;

            navigator.contacts.find(fields,
                function onSuccess(loadedContacts) {
                    for (var i = 0, length = loadedContacts.length; i < length; i++) {
                        var loadedContact = loadedContacts[i];
                        // only those hwo has display name
                        if (loadedContact.displayName) {
                            // create new contact
                            var contact = new Contact(loadedContact.displayName,
                                (loadedContact.photos) ? loadedContact.photos[0].value : 'img/person.png');

                            if (loadedContact.emails) {
                                contact.email = loadedContact.emails[0].value;
                            } else {
                                contact.email = null;
                            }

                            if (loadedContact.phoneNumbers) {
                                contact.phoneNumber = loadedContact.phoneNumbers[0].value;
                            } else {
                                contact.phoneNumber = null;
                            }

                            temContacts.push(contact);
                        }
                    }
                    temContacts.sort();
                    contacts = temContacts;
                    loading = false;
                    $rootScope.$emit('notifying-contact-loaded');
                    deferred.resolve(contacts);
                }, function onError(error) {
                    deferred.reject(error);
                }, options);

        }

        return deferred.promise;
    }

    function getContacts() {
        var deferred = $q.defer();

        if (!ionic.Platform.isAndroid() && !ionic.Platform.isIOS()) {
            return loadContacts();
        } else {

            if (contacts !== null && loading === false) {
                deferred.resolve(contacts);
            } else if (contacts === false && loading === false) {
                return loadContacts();
            } else {
                $rootScope.$on('notifying-contact-loaded', function () {
                    deferred.resolve(contacts);
                });
            }

            return deferred.promise;

        }
    }

    function setSingleContact(contact) {
        singleContact = contact;
    }

    function getSingleContact() {
        return singleContact;
    }

    function apiSync() {
        var contactsPhoneNumber = [];
        for (var i = 0, length = contacts.length; i < length; i++) {
            if (contacts[i].phoneNumber !== null && contacts[i].phoneNumber !== undefined) {
                contactsPhoneNumber.push(contacts[i].phoneNumber);
            }
        }
        var data = {contacts: contactsPhoneNumber};
        return contact.save(data).$promise;
    }

    $rootScope.$on('notifying-contact-loaded', function () {
        apiSync();
    });

    return {
        loadContacts: loadContacts,
        getContacts: getContacts,
        setSingleContact: setSingleContact,
        getSingleContact: getSingleContact
    };
});
