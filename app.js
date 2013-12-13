var http = require('http'),
	url  = require('url'),  //路由
	fs   = require('fs'),   //读取静态文件
	path = require('path'); //路径处理

var mime = require("./mime").types; //mime类型

var PORT = 3000;

var server = http.createServer(function (req, res) {
	var pathname = url.parse(req.url).pathname;
	var realPath = 'assets' + pathname;
	var ext = path.extname(realPath); //返回文件后缀名
	
	ext = ext ? ext.slice(1) : 'unknown';
	var contentType = mime[ext] || 'text/plain';

	path.exists(realPath, function (exists) {
		if (!exists) {
			res.writeHead(404, {'Content-type': 'text/plain'});
			res.write('This request URL ' + pathname + ' was not found on this server.');
			res.end();
		} else {
			fs.readFile(realPath, 'binary', function (err, data) {
				if (err) {
					res.writeHead(500, {'Content-Type': 'text/plain'});
					res.end();
				} else {
					res.writeHead(200, {'Content-Type': contentType});
					res.write(data, "binary");
					res.end();
				}
			});
		}
	});
});

server.listen(PORT);