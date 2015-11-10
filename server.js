var express = require('express');
var bodyParser = require('body-parser');
var multer  = require('multer');
var css = require('css');
var fs = require('fs');

var app = express();
var router = express.Router();
var upload = multer({ dest: 'uploads/' })
app.use(bodyParser.urlencoded({'extended':'true'})); 			// parse application/x-www-form-urlencoded
app.use(bodyParser.json()); 									// parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as jsonSSS

app.use(express.static(__dirname+'/'));

app.get('/', function(req, res){
    res.sendFile(__dirname +'/index.html');
});

app.post('/api/upload', upload.single('file'), function (req, res, next) {

	var filepath = req.file.destination+'\\'+req.file.filename;

	fs.readFile(filepath, {encoding: 'utf-8'}, function(err,data){
	    if (!err){

	    	var cssObj = css.parse(data, { source: req.file.filename });
			console.log(cssObj.stylesheet.rules);
			fs.readFile('data/data.json', function(err,bw){
				var browserObj = JSON.parse(bw);
				var helperObj = {};
				var resBwObj = [];

				fs.readFile('data/helper.json', function(err,helper){
					helperObj = JSON.parse(helper);
					cssObj.stylesheet.rules.forEach(function(cssObjRule){
						if(cssObjRule.declarations){
							cssObjRule.declarations.forEach(function(cssObjDec){
								if(cssObjDec.type === 'declaration'){
									helperObj.forEach(function(hobj){
										if(hobj.property){
											hobj.property.forEach(function(property){
												if((cssObjDec.property == property)||(cssObjDec.value == property)){
													resBwObj.push(browserObj.data[hobj.title]);
												}
											});
										}
									});
								}
							});
						}
					});

					var cleanArray = function(a, k){
						var newarr = [];
						var unique = {};

						a.forEach(function(item) {
							if (!unique[item[k]]) {
								newarr.push(item);
								unique[item[k]] = item;
							}
						});

						return newarr;
					}

					var cBo = cleanArray(resBwObj, 'title');

					res.json({"status":"success","stylesheet":cssObj,"browsers":browserObj,"helper":helperObj,"op":cBo}).end();
				});


			});

	    }else{
	        res.json({"status":"success","data":err}).end();
	    }

	});


})

app.listen(80);
