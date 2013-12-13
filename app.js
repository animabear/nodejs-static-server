var http = require('http'),
	url  = require('url'),  //路由
	fs   = require('fs'),   //读取静态文件
	path = require('path'); //路径处理

var mime   = require('./mime').types, //mime类型
	config = require('./config');

var PORT = 3000;

var server = http.createServer(function (req, res) {
	var pathname = url.parse(req.url).pathname;
	var realPath = 'assets' + pathname;

	path.exists(realPath, function (exists) {
		if (!exists) {
			res.writeHead(404, {'Content-type': 'text/plain'});
			res.write('This request URL ' + pathname + ' was not found on this server.');
			res.end();
		} else {
			var ext = path.extname(realPath); //返回文件后缀名
			ext = ext ? ext.slice(1) : 'unknown';
			var contentType = mime[ext] || 'text/plain';
			res.setHeader('Content-Type', contentType);

			fs.stat(realPath, function (err, stat) {
				var lastModified = stat.mtime.toUTCString(),
					ifModifiedSince = 'If-Modified-Since'.toLowerCase();
				res.setHeader('Last-Modified', lastModified);

				if (ext.match(config.Expires.fileMatch)) { //支持缓存的文件
					var expires = new Date();
					expires.setTime(expires.getTime() + config.Expires.maxAge * 1000);
					res.setHeader('Expires', expires.toUTCString());
					res.setHeader('Cache-Control', 'max-age=' + config.Expires.maxAge);
				}
				//服务器端文件未变动
				if (req.headers[ifModifiedSince] && lastModified == req.headers[ifModifiedSince]) {
					res.writeHead(304, "Not Modified");
					res.end();
				} else {
					fs.readFile(realPath, 'binary', function (err, data) {
						if (err) {
							res.writeHead(500, 'Internal Server Error', {'Content-Type': 'text/plain'});
							res.end();
						} else {
							res.writeHead(200, "ok");
							res.write(data, 'binary');
							res.end();
						}
					});
				}

			});
		}
	});
});

server.listen(PORT);