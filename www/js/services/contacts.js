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

        function contactProfile(){
            return contact(userDatastore.getTokens().accessToken).contactProfile(data).$promise
                .then(function (response){
                    console.log('contactProfile response--->', response);
                })
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

            var contacts = {};

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

            /**
             * Format phone numbers to prepare for db match
             *
             * @param contact
             * @returns {*}
             */
            function _sanitizeContact(contact) {
              contact = contact.replace(/[^0-9]/g, '');

              // if the phone number don't starts with (+) or (00) is local
                if (contact.substring(0, 1) !== '+' && contact.substring(0, 2) !== '00') {
                    // if it has (0) as first digit remove it
                    if (contact.substring(0, 1) === '0') {
                        contact = contact.substring(1);
                    }

                    // add customer international code to it
//                    var cc = userDatastore.getCountryCode();
                    if (contact.length < 11){
                        contact = userDatastore.getCountryCode() + contact;
                    }
//                    if (contact.substring(0, cc.length) != cc) {
//                        contact = userDatastore.getCountryCode() + contact;
//                    }
                } else {
                    // if it has (+) as first digit remove it
                    if (contact.substring(0, 1) === '+') {
                        contact = contact.substring(1);
                    }

                    // if it has (00) as first digit remove it
                    if (contact.substring(0, 2) === '00') {
                        contact = contact.substring(2);
                    }

                    if (contact.length < 11){
                        contact = userDatastore.getCountryCode() + contact;
                    }
                }

                contact = contact.replace(/[^\d]/g, '');

                return contact;
            }

            /**
             * Create new contact
             *
             * @param displayName
             * @param avatar
             * @param email
             * @param phoneNumber
             * @returns {Contact}
             * @private
             */
            function _createContact(displayName, avatar, email, phoneNumber) {
                var contact = new Contact(displayName,
                    (avatar) ? avatar : 'img/person.png');

                contact.email = email;
                contact.phoneNumber = (phoneNumber) ? _sanitizeContact(phoneNumber) : null;

                return contact;
            }

            /**
             * Sort it and remove duplicates
             *
             * @param contacts
             * @returns {*}
             * @private
             */
            function _sanitizeContacts(contacts) {
                contacts.sort();

                contacts = contacts.reduce(function (previous, current) {
                    var contact = {};
                    var index = current.phoneNumber;
                    if (index == null && current.email) {
                        index = current.email;
                    }
                    contact[index] = current;

                    if (Object.keys(previous).indexOf(index) === -1) {
                        previous[index] = current;
                    }

                    return previous;
                }, {});

                var sanitizedContacts = [];
                for (var index in contacts) {
                    sanitizedContacts.push(contacts[index]);
                }

                return sanitizedContacts;
            }

            /**
             * Execute on contact load success execution
             *
             * @param loadedContacts
             * @private
             */
            function _contactLoadSuccess(loadedContacts) {
                for (var i = 0, length = loadedContacts.length; i < length; i++) {
                    var loadedContact = loadedContacts[i];
                    var photo = (loadedContact.photos) ? loadedContact.photos[0].value : null;
                    var hasEmail = loadedContact.emails && loadedContact.emails.length;
                    var hasPhoneNumber = loadedContact.phoneNumbers && loadedContact.phoneNumbers.length;
                    // only those hwo has display name and phone number or email
                    if ((loadedContact.name.formatted && loadedContact.name.formatted != "") && (hasPhoneNumber || hasEmail)) {
                        var j = 0;
                        var contact = null;
                        if (hasEmail) {
                            for (j = 0, emailsLength = loadedContact.emails.length; j < emailsLength; j++) {
                                var email = loadedContact.emails[j].value;
                                contact = _createContact(loadedContact.name.formatted, photo, email);
                                contacts[email] = contact;
                            }
                        }
                        if (hasPhoneNumber) {
                            for (j = 0, phoneNumbersLength = loadedContact.phoneNumbers.length; j < phoneNumbersLength; j++) {
                                var phoneNumber = loadedContact.phoneNumbers[j].value;
                                contact = _createContact(loadedContact.name.formatted, photo, null, phoneNumber);
                                contacts[phoneNumber] = contact;
                            }
                        }
                    }
                }
                contacts = Object.keys(contacts).reduce(function (previous, key) {
                    previous.push(contacts[key]);
                    return previous;
                }, []);
                contacts = _sanitizeContacts(contacts);
                deferred.resolve(contacts);
            }

            /**
             * Execute on contact load fail execution
             *
             * @param error
             * @private
             */
            function _contactLoadError(error) {
                deferred.reject(error);
            }

            navigator.contacts.find(fields, _contactLoadSuccess, _contactLoadError, options);

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

        function getContactsProfile(){
          return contact(userDatastore.getTokens().accessToken).contactProfile().$promise
            .then(function (response) {
              return response
            });
        }

        function uploadProfileContacts(data) {
          var deferred = $q.defer();
          var query = 'UPDATE contacts SET photo = ? WHERE phone_number = ?';

          var values = [
            data.photo,
            data.phone_number
          ];

          sqliteDatastore.execute(query, values).then(function (result) {
            deferred.resolve();
            console.log('result update', result)
          }).catch(function (error) {
            deferred.reject(error);
          });
          return deferred.promise;
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

        function getSMSContacts() {
            var query = 'SELECT * FROM contacts WHERE phone_number IS NOT NULL';

            return sqliteDatastore.execute(query)
                .then(function (response) {
                    return response.rows;
                });
        }

        function getEmailContacts() {
            var query = 'SELECT * FROM contacts WHERE email IS NOT NULL';

            return sqliteDatastore.execute(query)
                .then(function (response) {
                    return response.rows;
                });
        }

        function getContact(phone) {
            var query = 'SELECT * FROM contacts WHERE phone_number = ' + phone;

            return sqliteDatastore.execute(query)
                .then(function (results) {
                    if (results.rows.length) {
                        return results.rows[0];
                    } else {
                        return null;
                    }
                });
        }

        return {
            loadContacts: loadContacts,
            getContactsProfile: getContactsProfile,
            uploadProfileContacts: uploadProfileContacts,
            getContacts: getContacts,
            getMUMContacts: getMUMContacts,
            getSMSContacts: getSMSContacts,
            getEmailContacts: getEmailContacts,
            setSingleContact: setSingleContact,
            getSingleContact: getSingleContact,
            getContact: getContact
        };
    });
