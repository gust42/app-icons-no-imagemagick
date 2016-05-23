var Jimp = require("jimp"),
	fs = require('fs');
	config = require("./config.json"),
	extend = require('util')._extend;

var mall = null;
var doneCB = null;
var progressCB = null;
var errorCB = null;
var targetPath = null;

function positionAndComposite(err, logo) {
	if (err) throw err;
	
	var pos = getCenter(mall.bitmap,logo.bitmap);
	
	pos.y = pos.y-mall.bitmap.height/10;
	resize(mall.composite(logo,pos.x,pos.y));
}

function resize(image) {
	for(var i in config.splash) {
		var splash = config.splash[i];
		new Jimp(splash.width, splash.height, 0xFFFFFFFF, function (err, bg) {
			
			if (err) handeError(err);
			var pos = getCenter(bg.bitmap,image.bitmap);
			bg.composite(image,pos.x,pos.y).write(targetPath+"/splash/"+splash.name+".png",function(err){
				if (err) handeError(err);
			});
			if(progressCB)
				progressCB(splash.name);
			//console.log(splash.name+" created!");
		});
	}
	
	for(var i in config.misc) {
		var misc = config.misc[i];
		new Jimp(misc.width, misc.height, 0xFFFFFFFF, function (err, bg) {
			if (err) handeError(err);
			var pos = getCenter(bg.bitmap,image.bitmap);
			bg.composite(image,pos.x,pos.y).write(targetPath+"/"+misc.name+".png",function(err){
				if (err) handeError(err);
			});
			if(progressCB)
				progressCB(misc.name);
			//console.log(misc.name+" created!");
		});
	}
	
	for(var i in config.icons) {
		var icon = config.icons[i];
		var tmpImg = image.clone();
		tmpImg.resize(icon.width,icon.height).write(targetPath+"/icons/"+icon.name+".png",function(err){
				if (err) handeError(err);
			});
		if(progressCB)
			progressCB(icon.name);
		//console.log(icon.name+" created!");
	}
	
	if(doneCB)
		doneCB();
}

function getCenter(bitmap1,bitmap2) {
	var pos = {
		x : bitmap1.width/2-bitmap2.width/2,
		y : bitmap1.height/2-bitmap2.height/2
	}
	return pos;
}

function handleError(error) {
	if(!error)
		return;
	if(errorCB)
		errorCB()
	else
		throw err
}

var defaultOptions = {
	progressCB : null,
	errorCB : null,
	useMall : true
};

module.exports = function (path,tPath,options,dCB){
	if(!path)
		path = __dirname+"/logo.png";
	
	targetPath = tPath;

	if(options && typeof options == "object")
		options = extend(defaultOptions,options);
	else
		options = defaultOptions;
		
	if(!targetPath)
		targetPath = __dirname;
	
	useMall = options.useMall;
		
	if (!fs.existsSync(targetPath+"/icons")){
		fs.mkdirSync(targetPath+"/icons");
	}
	
	if (!fs.existsSync(targetPath+"/splash")){
		fs.mkdirSync(targetPath+"/splash");
	}
		
	progressCB = options.progressCB;
	errorCB = options.errorCB;
	doneCB = dCB;

	if(useMall) {
		Jimp.read(__dirname+"/mall.png", function (err, m) {
			if (err) handleError(err);

			mall = m;

			Jimp.read(path, function (err, logo) {
				if (err) handeError(err);
				if(logo.bitmap.width > 480 || logo.bitmap.height > 400){
					logo.scaleToFit(480,300,positionAndComposite);
				} else if(logo.bitmap.width < 400 || logo.bitmap.height < 200)
					logo.scaleToFit(400,200,positionAndComposite);
				else {
					positionAndComposite(err,logo)
				}
			});
		});
	}
	else {
		Jimp.read(path, function (err, logo) {
			if (err) handleError(err);
			
			resize(logo);
		});
	}
}