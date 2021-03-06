'use strict';
angular.module('vactApp')
    /**
     * @ngdoc service
     * @name vactApp.service:iguanaModel
     * @description
     * iguanaModel for VactApp Web Socket Service
     */
    .factory('iguanaModel', ['$q', '$rootScope', function ($q, $rootScope) {
        var IguanaModel = {};
        // Keep all pending requests here until they get responses
        var callbacks = {};
        // Create a unique callback ID to map requests to responses
        var currentCallbackId = 0;
        // Create our websocket object with the address to the websocket
        var ws = new WebSocket("ws://localhost:8000/socket/");

      /**
       * @ngdoc method
       * @name iguanaModel.onopen
       * @methodOf vactApp.service:iguanaModel
       * @description - open socket
       */
        ws.onopen = function () {
            console.log("Socket has been opened!");
        };

      /**
       * @ngdoc method
       * @name iguanaModel.onmessage
       * @methodOf vactApp.service:iguanaModel
       * @description - fetch data - real or mock
       * @param {string} message - the message
       */
        ws.onmessage = function (message) {
            listener(JSON.parse(message.data));
        };

        function sendRequest(request) {
            var defer = $q.defer();
            var callbackId = getCallbackId();
            callbacks[callbackId] = {
                time: new Date(),
                cb: defer
            };
            request.callback_id = callbackId;
            console.log('Sending request', request);
            ws.send(JSON.stringify(request));
            return defer.promise;
        }

        function listener(data) {
            var messageObj = data;
            console.log("Received data from websocket: ", messageObj);
            // If an object exists with callback_id in our callbacks object, resolve it
            if (callbacks.hasOwnProperty(messageObj.callback_id)) {
                console.log(callbacks[messageObj.callback_id]);
                $rootScope.$apply(callbacks[messageObj.callback_id].cb.resolve(messageObj.data));
                delete callbacks[messageObj.callbackID];
            }
        }

        // This creates a new callback ID for a request
        function getCallbackId() {
            currentCallbackId += 1;
            if (currentCallbackId > 10000) {
                currentCallbackId = 0;
            }
            return currentCallbackId;
        }

      /**
       * @ngdoc method
       * @name iguanaModel.getCustomers
       * @methodOf vactApp.service:iguanaModel
       * @description - Define a "getter" for getting customer data
       * @returns {object} IguanaModel
       */
        IguanaModel.getCustomers = function () {
            var request = {
                type: "get_customers"
            };
            // Storing in a variable for clarity on what sendRequest returns
            var promise = sendRequest(request);
            return promise;
        };

        return IguanaModel;
    }]);
