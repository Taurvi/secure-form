serverMsg = function(msg) {
    console.log('|| SERVER || ' + msg);
};

serverMsg('node.js is initializing');

// Initialization
var app = require('express')();
serverMsg(' Loaded express.');
var http = require('http').Server(app);
serverMsg(' Loaded http.');
var io = require('socket.io')(http);
serverMsg(' Loaded socket.io.');
var crypto = require('crypto');
serverMsg(' Loaded crypto.');
var Firebase = require('firebase');
serverMsg(' Loaded Firebase.');

serverMsg('node.js is initialized.');

// SocketIO listens on port 3000
http.listen(3000, function(){
    serverMsg('Server is now listening on *:3000');
});

// Creates the Firebase references
var fbRoot = new Firebase('https://securitytest23.firebaseio.com/');
var fbForm = new Firebase('https://securitytest23.firebaseio.com/secure_form');
var fbTokens = new Firebase('https://securitytest23.firebaseio.com/auth_tokens/');

// Locally stores tokens on server
serverMsg('Destroying old server tokens.')
var serverTokens = {};
serverMsg('Destroyed old server tokens.')


serverMsg('Destroying old database tokens.')
fbTokens.remove();
serverMsg('Destroyed old database tokens.')


// Authenticates backend user
serverMsg('Authenticating backend user.');
fbRoot.authWithPassword({
    email    : "srimbakusumo@gmail.com",
    password : "testing123"
}, function(error, authData) {
    if (error)
        serverMsg("Login Failed!");
    else
        serverMsg("Authenticated successfully!");
});

// Generates the auth token and stores in DB
var generateToken = function(id) {
    serverMsg('    generateToken: Token is being generated.');
    var sha = crypto.createHash('sha256');
    sha.update(Math.random().toString());
    var key = sha.digest('hex');
    serverMsg('    generateToken: Token has been generated: ' + key);
    var fbNewToken = new Firebase('https://securitytest23.firebaseio.com/auth_tokens/' + id);
    var keyObj = {
            token: key
        };
    fbNewToken.set(keyObj);
    serverMsg('    generateToken: Token has been stored on database.');
    serverTokens[id] = {
        token: key
        };
    serverMsg('    generateToken: Token has been stored on server.')
};

// Checks the token stored in the database against the token in the server
var checkToken = function(id) {
    serverMsg('    checkToken: Checking token.')
    if(!serverTokens.hasOwnProperty(id))
        return false;

    var serverToken = serverTokens.id.token;
    var databaseToken;

    var fbGetToken = new Firebase('https://securitytest23.firebaseio.com/auth_tokens/' + id);
    fbGetToken.on("value", function(snapshot) {
        databaseToken = snapshot.val().token;
    }, function (errorObject) {
        serverMsg("The read failed.");
    });

    return serverToken === databaseToken;
};

// Destroys the auth token in the DB
var destroyToken = function(id) {
    var fbDelToken = new Firebase('https://securitytest23.firebaseio.com/auth_tokens/' + id);
    serverMsg('    destroyToken: Destroying token on database.');
    fbDelToken.remove();
    serverMsg('    destroyToken: Token destroyed on database.');
    if(!serverTokens.hasOwnProperty(id))
        serverMsg('    destroyToken: Token not found');
    else {
        serverTokens.id = null;
        serverMsg('    destroyToken: Token destroyed on server.')
    }

};

// User connects to socketIO
io.sockets.on('connection', function(socket){
    serverMsg('  io.sockets.on: User has connected: ' + socket.id);
    serverMsg('  io.sockets.on: Initiating token generation');
    generateToken(socket.id);

    socket.on('formData', function(data){
        serverMsg('  io.sockets.on: Form data received.');

        serverMsg('  io.sockets.on: Initiating token verification');
        var verifyStatus = checkToken(socket.id);

        if (verifyStatus) {
            // execute function
        } else {
            socket.emit('')
        }

    });

    checkToken('dsfsdfasafdadfsadfss');

    socket.on('disconnect',function() {
        serverMsg('  io.sockets.on disconnect: User has disconnected: ' + socket.id);
        serverMsg('  io.sockets.on: Initiating token destruction');
        destroyToken(socket.id);
    });
});



