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
         * Format phone numbers to prepare for db match
         *
         * @param contact
         * @returns {*}
         */
        function sanitizeContact(contact) {
            var chars = [' ', '-', '+', '(', ')'];

            // if the phone number don't starts with (+) or (00) elsewhere is international
            if (contact.substring(0, 1) !== '+' && contact.substring(0, 2) !== '00') {
                // if ti has (0) as first digit remove it
                if (contact.substring(0, 1) === '0') {
                    contact = contact.substring(1);
                }

                // add customer international code to it
                contact = userDatastore.getCountryCode() + contact;
            } else {
                // if ti has (+) as first digit remove it
                if (contact.substring(0, 1) === '+') {
                    contact = contact.substring(1);
                }

                // if ti has (00) as first digit remove it
                if (contact.substring(0, 2) === '00') {
                    contact = contact.substring(2);
                }
            }

            for (var j = 0, charsLength = chars.length; j < charsLength; j++) {
                var char = chars[j];
                contact = contact.replace(char, '');
            }

            return contact;
        }

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
                        // only those hwo has display name and phone number
                        if (loadedContact.displayName && loadedContact.phoneNumbers) {
                            // create new contact
                            var contact = new Contact(loadedContact.displayName,
                                (loadedContact.photos) ? loadedContact.photos[0].value : 'img/person.png');

                            if (loadedContact.emails) {
                                contact.email = loadedContact.emails[0].value;
                            } else {
                                contact.email = null;
                            }

                            if (loadedContact.phoneNumbers) {
                                contact.phoneNumber = sanitizeContact(loadedContact.phoneNumbers[0].value);
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
         * Insert new contact
         *
         * @param data
         * @returns {*}
         */
        function insertContact(data) {
            var query = 'INSERT OR IGNORE INTO contacts (phone_number, display_name, photo, email, mum_id) ' +
                'VALUES(?, ?, ?, ?, ?)';

            return sqliteDatastore.execute(query, data)
                .then(function (response) {
                    return response;
                });
        }

        /**
         * Update a contact on database
         *
         * @param key
         * @param mumId
         * @returns {*}
         */
        function updateContact(key, mumId) {
            var query = 'UPDATE contacts SET mum_id = ? WHERE phone_number = ?';

            var data = [mumId, key];

            return sqliteDatastore.execute(query, data)
                .then(function (response) {
                    return response;
                });
        }

        /**
         * Delete a contact from database
         *
         * @param key
         * @returns {*}
         */
        function deleteMUMContact(key) {
            var query = 'UPDATE contacts SET mum_id = NULL WHERE phone_number = ?';

            var data = [key];

            return sqliteDatastore.execute(query, data)
                .then(function (response) {
                    return response;
                });
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

            async.each(contacts, function (contact, callback) {
                var values = [
                    contact.phoneNumber,
                    contact.displayName,
                    contact.photo,
                    contact.email,
                    null
                ];

                insertContact(values)
                    .then(function () {
                        contactObjects.push(contact);
                        callback();
                    })
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
         * Update contacts on database
         *
         * @param contacts
         * @returns {*|promise}
         */
        function updateContacts(contacts) {
            var deferred = $q.defer();

            async.waterfall([
                    function (callback) {
                        async.each(contacts.created, function (contact, eachCallback) {
                            updateContact(contact.username, contact.id)
                                .then(function () {
                                    eachCallback();
                                })
                        }, function (error) {
                            if (!error) {
                                callback();
                            } else {
                                deferred.reject(error);
                            }
                        });
                    },
                    function (callback) {
                        async.each(contacts.unmodified, function (contact, eachCallback) {
                            updateContact(contact.username, contact.id)
                                .then(function () {
                                    eachCallback();
                                })
                        }, function (error) {
                            if (!error) {
                                callback();
                            } else {
                                deferred.reject(error);
                            }
                        });
                    },
                    function (callback) {
                        async.each(contacts.deleted, function (contact, eachCallback) {
                            deleteMUMContact(contact.username)
                                .then(function () {
                                    eachCallback();
                                })
                        }, function (error) {
                            if (!error) {
                                callback();
                            } else {
                                deferred.reject(error);
                            }
                        });
                    }],
                function (error) {
                    if (!error) {
                        deferred.resolve();
                    } else {
                        deferred.reject();
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
            return contact(userDatastore.getTokens().accessToken).save(data).$promise
                .then(function (response) {
                    updateContacts(response);
                });
        }

        /**
         * Load the contacts from the local address book save them to mum database
         * and sync them with the mum api
         *
         * @returns {*}
         */
        function loadContacts() {
            if (window.localStorage.getItem('verified') == 2) {
                return loadFromAddressBook()
                    .then(function (contacts) {
                        return saveContacts(contacts);
                    })
                    .then(function (contacts) {
                        return apiSync(contacts);
                    });
            }
        }

        function getContacts() {
            var query = 'SELECT * FROM contacts';

            return sqliteDatastore.execute(query)
                .then(function (response) {
                    return response.rows;
                });
        }

        function getMUMContacts() {
            var query = 'SELECT * FROM contacts WHERE mum_id IS NOT NULL';

            return sqliteDatastore.execute(query)
                .then(function (response) {
                    return response.rows;
                });
        }

        function getContact(phone) {
            var query = 'SELECT * FROM contacts WHERE phone_number = ' + phone;

            return sqliteDatastore.execute(query)
                .then(function (response) {
                    if (results.rows.length) {
                        return results.rows[0];
                    } else {
                        return null;
                    }
                    return response.rows;
                });
        }

        return {
            loadContacts: loadContacts,
            getContacts: getContacts,
            getMUMContacts: getMUMContacts,
            setSingleContact: setSingleContact,
            getSingleContact: getSingleContact,
            getContact: getContact
        };
    });
