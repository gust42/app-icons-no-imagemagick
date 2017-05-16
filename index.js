var Jimp = require("jimp"),
	fs = require('fs');
	config = require("./config.json"),
	extend = require('util')._extend;

function createIcons(image, options) {
	return new Promise(function(resolve, reject){
		for(var i in config.icons) {
			var icon = config.icons[i];
			var tmpImg = image.clone();
			tmpImg.resize(icon.width,icon.height).write(options.targetPath+"/"+icon.platform+"/icon/"+icon.name+".png",function(err){
					if (err) {
						handleError(err, options);
						reject();
					}
				});
			if(options.progressCB)
				options.progressCB(icon.name);
			//console.log(icon.name+" created!");
		}
		resolve();
	});
}

function createSplash(image, options) {
	return new Promise(function(resolve, reject){
		for(var i in config.splash) {
			var splash = config.splash[i];

			new Jimp(splash.width, splash.height, 0xFFFFFFFF, function (err, bg) {
		
				if (err) handeError(err);
				var pos = getCenter(bg.bitmap,image.bitmap);
				bg.composite(image,pos.x,pos.y).write(options.targetPath+"/ios/splash/"+splash.name+".png",function(err){
					if (err) {
						handleError(err, options);
						reject();
					}
				});
				
				if(options.progressCB)
					options.progressCB(splash.name);
				//console.log(splash.name+" created!");
			});

		}
		resolve();
	});
}

function createMisc(image, options) {
	return new Promise(function(resolve, reject){
		for(var i in config.misc) {
			var misc = config.misc[i];

			new Jimp(misc.width, misc.height, 0xFFFFFFFF, function (err, bg) {
		
				if (err) handeError(err);
				var pos = getCenter(bg.bitmap,image.bitmap);
				bg.composite(image,pos.x,pos.y).write(options.targetPath+"/misc/"+misc.name+".png",function(err){
					if (err) {
						handleError(err, options);
						reject();
					}
				});
				
				if(options.progressCB)
					options.progressCB(misc.name);
				//console.log(splash.name+" created!");
			});

		}
		resolve();
	});
}

function getCenter(bitmap1,bitmap2) {
	var pos = {
		x : bitmap1.width/2-bitmap2.width/2,
		y : bitmap1.height/2-bitmap2.height/2
	}
	return pos;
}

function handleError(error, options) {
	if(!error)
		return;
	if(options.errorCB)
		options.errorCB()
	else
		throw error;
}

var defaultOptions = {
	iconImage : __dirname+"/icon.png",
	splashImage : __dirname+"/splash.png",
	targetPath : __dirname+"/resources/",
	progressCB : null,
	createStoreIcons : true,
	errorCB : null
};

module.exports = function (options,doneCallback){

	if(options && typeof options == "object")
		options = extend(defaultOptions,options);
	else
		options = defaultOptions;
	
	if (!fs.existsSync(options.targetPath)){
		fs.mkdirSync(options.targetPath);
	}

	if (!fs.existsSync(options.targetPath+"/misc")){
		fs.mkdirSync(options.targetPath+"/misc");
	}

	if (!fs.existsSync(options.targetPath+"/android")){
		fs.mkdirSync(options.targetPath+"/android");
	}

	if (!fs.existsSync(options.targetPath+"/android/icons")){
		fs.mkdirSync(options.targetPath+"/android/icons");
	}

	if (!fs.existsSync(options.targetPath+"/ios")){
		fs.mkdirSync(options.targetPath+"/ios");
	}

	if (!fs.existsSync(options.targetPath+"/ios/icon")){
		fs.mkdirSync(options.targetPath+"/ios/icon");
	}
	
	if (!fs.existsSync(options.targetPath+"/ios/splash")){
		fs.mkdirSync(options.targetPath+"/ios/splash");
	}

	Jimp.read(options.iconImage, function (err, icon) {
		if (err) handleError(err,options);
		
		createIcons(icon, options).then(function(){
			Jimp.read(options.splashImage, function (err, splash) {
				if (err) handleError(err,options);
				createSplash(splash,options).then(function(){
					if(options.createStoreIcons) {
						createMisc(splash,options).then(function(){
							if(doneCallback)
								doneCallback();
						});
					} else {
						if(doneCallback)
							doneCallback();
					}
				});
			});
		});
	});
}