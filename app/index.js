// Dependencies
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

// Instantiating the HTTP server
var httpServer = http.createServer(function (req, res) {
    // Get the url and parse it
    var parsedUrl = url.parse(req.url, true);

    // Get the path from the url
    var path = parsedUrl.pathname;
    var trimmedPath = path.replace(/^\/+|\/+$/g, '');

    // Get method
    var method = req.method.toLowerCase();

    // Get the query string as an object
    var queryString = parsedUrl.query;

    // Get the headers as an object
    var headers = req.headers;

    // Get the payload if any
    var decoder = new StringDecoder('utf8');
    var buffer = '';
    req.on('data', function (data) {
        buffer += decoder.write(data);
    });
    req.on('end', function () {
        buffer += decoder.end();

        // Choose the handler this request should go to
        // If one is not found use the not found handler
        var chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : router.notFound;

        // Construct the data object to send to the handler
        var data = {
            'path': trimmedPath,
            'queryString': queryString,
            'method': method,
            'headers': headers,
            'payload': buffer,
        };

        // Route the request to the handler specified in the router
        chosenHandler(data, function (statusCode, payload) {
            // Use the status code called back by the handler, or default to 200
            statusCode = typeof (statusCode) === 'number' ? statusCode : 200;

            // Use the payload called back by the handler, or default to empty object
            payload = typeof (payload) === 'object' ? payload : {};

            // Convert the payload to a string
            var payloadString = JSON.stringify(payload);

            // Return the response
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(statusCode);
            res.end(payloadString);
        });
    });
});

var PORT = 3000;

// Start the HTTP server
httpServer.listen(PORT, function () {
    console.log('This server is listening on port ' + PORT);
});

// Define the handlers
var router = {
    '': function(data, callback) {
        callback(200, {
            message: 'Hi! Welcome to assignment #1. Please go to http://{url}:' + PORT + '/hello',
            success: true,
        });
    },
    'hello': function(data, callback) {
        callback(200, {
            message: 'Hello to you too! Please find the information of your request in request_information',
            success: true,
            request_information: data,
        });
    },
    notFound: function(data, callback) {
        callback(404, {
            message: 'Oops! I don\'t have anything prepared for your in this path. Try /hello',
            success: false,
        });
    },
};
