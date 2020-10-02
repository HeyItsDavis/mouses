//check README.md for more information

/// <reference path="TSDef/p5.global-mode.d.ts" />

//create a socket connection
var socket;
var activePointer;
var pointer1;
var pointer2;
var pointer3;

var pointers;
//I send updates at the same rate as the server update
var UPDATE_TIME = 1000 / 10;


//setup is called when all the assets have been loaded
function preload() {
    //load the image and store it in pointer
    pointer1 = loadImage('assets/Furret.png');
    pointer2 = loadImage('assets/Probopass.png');
    pointer3 = loadImage('assets/Tropius.png');
    pointer4 = loadImage('assets/Slowbro.png');
    pointer5 = loadImage('assets/Exploud.png');
    pointer6 = loadImage('assets/Snorunt.png');
    
}

function setup() {
    pointers = [pointer1,pointer2,pointer3,pointer4,pointer5,pointer6];
    activePointer = 0;
    //create a canvas
    createCanvas(800, 600);
    //paint it white
    background(255, 255, 255);

    //I create socket but I wait to assign all the functions before opening a connection
    socket = io({
        autoConnect: false
    });

    //detects a server connection 
    socket.on('connect', onConnect);
    //handles the messages from the server, the parameter is a string
    socket.on('message', onMessage);
    //handles the user action broadcast by the server, the parameter is an object
    socket.on('state', updateState);




    socket.open();

    //every x time I update the server on my position
    setInterval(function () {
        socket.emit('clientUpdate', { x: mouseX, y: mouseY, pointer: activePointer});
    }, UPDATE_TIME);
}

//this p5 function is called continuously 60 times per second by default
//we are not using it yet, we update the canvas only when we receive new updates, see below
function draw() {
}

function mousePressed() {
    let rnd = activePointer;
    while (rnd == activePointer) {
        rnd = Math.floor(Math.random()*pointers.length);
    }
    activePointer = rnd;

    socket.emit('attack', {x: mouseX, y: mouseY});
}

//called by the server every 30 fps
function updateState(state) {

    //draw a white background
    background(255, 255, 255);
    //iterate through the players
    for (var playerId in state.activePlayers) {
        if (state.activePlayers.hasOwnProperty(playerId)) {

            //in this case I don't have to draw the pointer at my own position

            var playerState = state.activePlayers[playerId];

            //draw a pointer image for each player except for myself
            if (playerState.isAlive === true) {
                image(pointers[playerState.pointer], playerState.x, playerState.y);
            }
            
        }
    }

    

}

//connected to the server
function onConnect() {
    if (socket.id) {
        console.log("Connected to the server");
        socket.emit('newPlayer', { x: mouseX, y: mouseY });
    }
}

//a message from the server
function onMessage(msg) {
    if (socket.id) {
        console.log("Message from server: " + msg);
    }
}

