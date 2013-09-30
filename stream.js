var probe = require('node-ffprobe'),
        fs = require('fs'),
        url = require('url'),
        lame = require('lame'),
        Throttle = require('throttle'),
        http = require('http'),
        queue = require('./queue');
var directory = "songs";
function start(app) {
    var clients = [];
    var encoder = new lame.Encoder({
        channels: 2, // 2 channels (left and right)
        bitDepth: 16, // 16-bit samples
        sampleRate: 44100   // 44,100 Hz sample rate
    });

    encoder.on('data', function(data) {
        clients.forEach(function(val, idx) {
            val.write(data);
        });
    });

    function playNextFile() {
        queue.getNextSong(function(nextSong){
            var length = nextSong.duration;
            var bit_rate = nextSong.bit_rate;
            var throttle = new Throttle(bit_rate / 8);
            var decoder = new lame.Decoder();
            decoder.on('data', function(data) {
                encoder.write(data);
            });
            throttle.on('end', function() {
                playNextFile();
            });
            fs.createReadStream(nextSong.fullpath).pipe(throttle);
            throttle.pipe(decoder);
        });
    }

    app.get("/stream", function(request, response) {
        var host = request.headers;
        response.writeHead(200, {"Content-Type": "audio/mpeg"});
        console.log("Client " + host['user-agent'] + " connected from: " + host.host);
        clients.push(response);
        request.on('close', function() {
            var index = clients.indexOf(response);
            clients.splice(index, 1);
            console.log("Client " + host['user-agent'] + " disconnected");
        });
    });
    console.log("Stream Server Now Running...");
    playNextFile();
}
exports.start = start;