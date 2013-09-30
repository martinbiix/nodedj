var fs = require('fs');
var probe = require('node-ffprobe');
var async = require('async');

var directory = 'songs';
var files = [];
var parallel_functions = [];

fs.readdir(directory, function(err, files){
	if(err){
		console.log(err);
	}
	else{
		files.forEach(function(val, idx){
			function parallel_function(callback){
				var song = {};
				probe(directory + "/" + val, function(err, probeData) {
					song.filename = probeData.filename;
					song.duration = probeData.format.duration;
					song.bit_rate = probeData.format.bit_rate;
					if (probeData.metadata) {
						song.metadata = {};
						song.metadata.title = probeData.metadata.title || "Title Unavailable";
						song.metadata.artist = probeData.metadata.artist || "Artist Unavailable";
						song.metadata.album = probeData.metadata.album || "Album Unavailable";
					}
					callback(null, song);
				});
			}
			parallel_functions.push(parallel_function);
		});
		async.parallel(parallel_functions, function(err, results){
			console.log(results);
		});
	}
});