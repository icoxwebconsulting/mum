angular.module('app.contacts', [])
    .factory('Contacts', function ($q, $rootScope, contact, userDatastore, sqliteDatastore) {
        // TODO: move it to dedicated services
        var singleContact = null;

        // TODO: move it to dedicated services
        function setSingleContact(contact) {
            singleContact = contact;
        }

        // TODO: move it to dedicated services
        function getSingleContact() {
            return singleContact;
        }

        /**
         * Contact class
         *
         * @param displayNameArg
         * @param photoArg
         * @param emailArg
         * @param phoneNumberArg
         * @param mumIdArg
         * @returns {{displayName: *, photo: *, email: (*|null), phoneNumber: (*|null), mumId: (*|null), toString: toString}}
         * @constructor
         */
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

        /**
         * Load from User Phone Address Book
         *
         * @returns {*|promise}
         */
        function loadFromAddressBook() {
            var deferred = $q.defer();

            var contacts = [];

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

                            contacts.push(contact);
                        }
                    }
                    contacts.sort();
                    deferred.resolve(contacts);
                }, function onError(error) {
                    deferred.reject(error);
                }, options);

            return deferred.promise;
        }

        /**
         * Save a list of contacts to database
         *
         * @param contacts
         * @returns {*|promise}
         */
        function saveContacts(contacts) {
            var deferred = $q.defer();

            var contactObjects = [];
            var query = 'INSERT OR IGNORE INTO contacts (phone_number, display_name, photo, email, mum_id) ' +
                'VALUES(?, ?, ?, ?, ?)';

            async.each(contacts, function (contact, callback) {
                var values = [
                    contact.phoneNumber,
                    contact.displayName,
                    contact.photo,
                    contact.email,
                    null
                ];

                sqliteDatastore.execute(query, values)
                    .then(function () {
                        contactObjects.push(values);
                        callback();
                    })
                    .catch(function (error) {
                        callback(error);
                    });
            }, function (error) {
                if (!error) {
                    deferred.resolve(contactObjects);
                } else {
                    deferred.reject(error);
                }
            });

            return deferred.promise;
        }

        /**
         * Sync contacts with api database
         *
         * @param contacts
         * @returns {*|Function}
         */
        function apiSync(contacts) {
            var contactsPhoneNumber = [];
            for (var i = 0, length = contacts.length; i < length; i++) {
                if (contacts[i].phoneNumber !== null && contacts[i].phoneNumber !== undefined) {
                    contactsPhoneNumber.push(contacts[i].phoneNumber);
                }
            }
            var data = {contacts: contactsPhoneNumber};
            return contact(userDatastore.getTokens().accessToken).save(data).$promise;
        }

        /**
         * Load the contacts from the local address book save them to mum database
         * and sync them with the mum api
         *
         * @returns {*}
         */
        function loadContacts() {
            if (window.localStorage.getItem('verified')) {
                return loadFromAddressBook()
                    .then(function (contacts) {
                        return saveContacts(contacts);
                    })
                    .then(function (contacts) {
                        return apiSync(contacts);
                    });
            }
        }

        loadContacts();

        function getContacts() {
            var deferred = $q.defer();

            // read from table

            return deferred.promise;
        }

        return {
            getContacts: getContacts,
            setSingleContact: setSingleContact,
            getSingleContact: getSingleContact
        };
    });
