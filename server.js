const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

app.use(express.static('public'));

let emptyGame = false;
let games = [];
let gameIndexs = {};
let game = function (gid1,womType1){
	this.gid1 = gid1;
	this.womType1 = womType1;
}


io.on('connection', socket => {
	socket.on('join',(wombat) => {
		if(emptyGame){
			if(!games[games.length-1]) return;
			games[games.length-1].gid2 = socket.id;
			games[games.length-1].womType2 = wombat;
			socket.emit('ready',games[games.length-1].womType1);
			let otherPlayer = io.sockets.sockets[games[games.length-1].gid1];
			if(otherPlayer) otherPlayer.emit('ready',wombat);
		} else {
			games.push(new game(socket.id,wombat));
			socket.emit('wait');
		}
		gameIndexs[socket.id] = games.length -1;
		emptyGame = !emptyGame;
		console.log(games);
	});
	socket.on('update',wombat =>{
		let game = games[gameIndexs[socket.id]];
		if(!game){
			return;
		}
		let gid = game.gid1 === socket.id?"gid2":"gid1";
		let otherPlayer = io.sockets.sockets[game[gid]];
		if(!otherPlayer) {
			console.log("cleaning up");
			let otherGid = game[gid];
			games.splice(gameIndexs[socket.id],1);
			for(x in gameIndexs){
				if(gameIndexs[x]>gameIndexs[socket.id]) gameIndexs[x]--;
			}
			delete gameIndexs[otherGid];
			delete gameIndexs[socket.id];
			//gameIndexs = gameIndexs.filter(i=>(i !=socket.id && i!=game[gid]));
			socket.emit('disconnected');
			return;
		}
		otherPlayer.emit('update',wombat);

	});
	socket.on('leaving',()=>{
		let game = games[gameIndexs[socket.id]];
		if(!game){
			return;
		}
		let gid = game.gid1 === socket.id?"gid2":"gid1";
		let otherPlayer = io.sockets.sockets[game[gid]];
		if(otherPlayer) otherPlayer.emit('disconnected');
		console.log("cleaning up");
		let otherGid = game[gid];
		games.splice(gameIndexs[socket.id],1);
		for(x in gameIndexs){
			if(gameIndexs[x]>gameIndexs[socket.id]) gameIndexs[x]--;
		}
		delete gameIndexs[otherGid];
		delete gameIndexs[socket.id];

	});
	socket.on('end',flip=>{
		let game = games[gameIndexs[socket.id]];
		console.log("your game",game);
		console.log("before",games);
		if(!game) return;
		game = games.splice(gameIndexs[socket.id],1)[0];
		console.log("after",games);
		console.log("before",gameIndexs);
		for(x in gameIndexs){
			if(gameIndexs[x]>gameIndexs[socket.id]) gameIndexs[x]--;
		}
		delete gameIndexs[game.gid1];
		delete gameIndexs[game.gid2];
		console.log("after",gameIndexs);
		if(flip) emptyGame = !emptyGame;
	});
	socket.on('disconnect',()=>{
		if(gameIndexs[socket.id] != undefined){
			if(games[gameIndexs[socket.id]]){
				if(!games[gameIndexs[socket.id]].gid2){
					games.splice(gameIndexs[socket.id],1);
					delete gameIndexs[socket.id];
					emptyGame = !emptyGame;
				}
			}
		}
	});
	setInterval(()=>{console.log(emptyGame,games,gameIndexs)},1000);
});
let port = 8000
server.listen(port);
