var walk = require('walk'),
    probe = require('node-ffprobe'),
    uuid = require('uuid'),
    path = require('path');
function scanner(directory, callback){
    var files = {};

    // Walker options
    var walker = walk.walk(directory, {followLinks: false});

    walker.on('file', function(root, file, next) {
        var song = {};
        song.filename = file.name;
        song.fullpath = root + "/" + song.filename;
        probe(song.fullpath, function(err, probeData) {
            if(path.extname(song.filename) == ".mp3"){
                song.duration = probeData.format.duration;
                song.bit_rate = probeData.format.bit_rate;
                if (probeData.metadata) {
                    song.metadata = {};
                    song.metadata.title = probeData.metadata.title || song.filename;
                    song.metadata.artist = probeData.metadata.artist || "Artist Unavailable";
                    song.metadata.album = probeData.metadata.album || "Album Unavailable";
                }
                files[uuid.v1()] = song;
            }
            next();
        });
    });

    walker.on('end', function() {
        callback(files);
    });
}
exports.scanner = scanner;