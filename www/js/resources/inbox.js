angular.module('app.inbox', [])
    .factory('inbox', function ($resource, SERVER_CONF, sqliteDatastore) {

        var chats;

        function getTopMessages() {
            //return [{
            //    id: 0,
            //    name: 'Ben Sparrow',
            //    lastText: 'You on your way?',
            //    face: 'img/ben.png'
            //}, {
            //    id: 1,
            //    name: 'Max Lynx',
            //    lastText: 'Hey, it\'s me',
            //    face: 'img/max.png'
            //}, {
            //    id: 2,
            //    name: 'Adam Bradleyson',
            //    lastText: 'I should buy a boat',
            //    face: 'img/adam.jpg'
            //}, {
            //    id: 3,
            //    name: 'Perry Governor',
            //    lastText: 'Look at my mukluks!',
            //    face: 'img/perry.png'
            //}, {
            //    id: 4,
            //    name: 'Mike Harrington',
            //    lastText: 'This is wicked good ice cream.',
            //    face: 'img/mike.png'
            //}];
            sqliteDatastore.getConversations().then(function(){

            }).catch(function (error) {
                // Tratar el error
                console.log("error en consulta en inbox", error);
            });
        }

        return {
            getTopMessages: getTopMessages
        };

    });
