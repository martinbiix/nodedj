var stream = require('./stream'),
	express = require('express'),
	cons = require('consolidate'),
	queue = require('./queue'),
	app = express(),
	server = require('http').createServer(app);

var port = process.argv[2] ||  8000;

app.configure(function() {
	app.engine('htm', cons.just);
	app.set('view engine', 'htm');
	app.set('views', __dirname + '/public');
	app.use(express.static("public"));
});

app.get("/", function(req, res) {
	res.render("page", {});
});

queue.init(server);
server.listen(port);
console.log("Web Server Now Running...");
stream.start(app);
