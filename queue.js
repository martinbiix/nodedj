var uuid = require('uuid');
var playlist = [];
var globalCallback = null;
var globalCatalogue = {};
var now_playing = null;
var io = null;
function init(server){
	var scanner = require('./scanner');
	scanner.scanner('songs', function(catalogue){
		io = require('socket.io').listen(server);
		io.sockets.on('connection', function(socket){
			globalCatalogue = catalogue;
			socket.emit('init', {'catalogue':catalogue, 'playlist': playlist});
			socket.emit('now_playing', now_playing);
			socket.on('add_song', function(song_id){
				var id = uuid.v1();
				var playlist_item = {};
				playlist_item.playlist_key = id;
				playlist_item.catalogue_key = song_id;
				
				if(globalCallback != null){
					now_playing = playlist_item.catalogue_key;
					io.sockets.emit('now_playing', now_playing);
					globalCallback(catalogue[playlist_item.catalogue_key]);
					globalCallback = null;
				}
				else{
					playlist.push(playlist_item);
					io.sockets.emit('add_to_playlist', playlist_item);
				}
			});
			socket.on('remove_song', function(playlist_id){
				for(key in playlist){
					if(playlist[key].playlist_key == playlist_id){
						io.sockets.emit('remove_from_playlist', playlist[key].playlist_key);
						playlist.splice(key, 1);
					}
				}
			});
		});
	});
}

function getNextSong(callback){
	if(playlist.length > 0){
		var nextSong = playlist.shift();
		io.sockets.emit('remove_from_playlist', nextSong.playlist_key);
		now_playing = nextSong.catalogue_key;
		io.sockets.emit('now_playing', now_playing);
		callback(globalCatalogue[nextSong.catalogue_key]);
	}
	else{
		globalCallback = callback;
	}
}

exports.init = init;
exports.getNextSong = getNextSong;