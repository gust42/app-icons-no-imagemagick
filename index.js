var Jimp = require("jimp"),
	fs = require('fs');
config = require("./config.json"),
	path = require('path');
extend = require('util')._extend;

function createIcons(image, doneResolve, options) {

	if (config.icons.length == 0) {
		doneResolve();
		return;
	}

	var icon = config.icons.pop();
	var tmpImg = image.clone();
	tmpImg.resize(icon.width, icon.height).write(options.targetPath + "/" + icon.platform + "/icon/" + icon.name + ".png", function (err) {
		if (err) {
			handleError(err, options);
		} else {
			if (options.progressCB)
				options.progressCB(icon.name);
			createIcons(image, doneResolve, options);
		}
	});
	//console.log(icon.name+" created!");
}

function createSplash(image, doneResolve, options) {
	// console.log('Creating splash');
	if (config.splash.length == 0) {
		doneResolve(image);
		return;
	}

	var splash = config.splash.pop();

	new Jimp(splash.width, splash.height, 0xFFFFFFFF, function (err, bg) {
		if (err) handeError(err);

		var platform = "ios";
		if (splash.platform)
			platform = splash.platform;

		var pos = getCenter(bg.bitmap, image.bitmap);
		// console.log(options.targetPath + "/" + splash.platform + "/splash/" + splash.name + ".png");
		bg.composite(image, pos.x, pos.y).write(options.targetPath + "/" + splash.platform + "/splash/" + splash.name + ".png", function (err) {
			if (err) {
				handleError(err, options);
			} else {
				if (options.progressCB)
					options.progressCB(splash.name);
				createSplash(image, doneResolve, options);
			}

		});
	});
	//console.log(splash.name+" created!");
}

function createMisc(image, doneResolve, options) {
	if (config.misc.length == 0) {
		doneResolve();
		return;
	}

	var misc = config.misc.pop();

	new Jimp(misc.width, misc.height, 0xFFFFFFFF, function (err, bg) {

		if (err) handeError(err);
		var pos = getCenter(bg.bitmap, image.bitmap);
		bg.composite(image, pos.x, pos.y).write(options.targetPath + "/misc/" + misc.name + ".png", function (err) {
			if (err) {
				handleError(err, options);
			} else {
				if (options.progressCB)
					options.progressCB(misc.name);
				createMisc(image, doneResolve, options);
			}
		});

		if (options.progressCB)
			options.progressCB(misc.name);
		//console.log(splash.name+" created!");
	});
}

// function createScreenshots(list, options) {
// 	if (list.length > 0) {
// 		const shot = list.pop();

// 		console.log(shot + ' ' + list.length);
// 		Jimp.read(__dirname + '/' + shot, function (err, screenshotImg) {
// 			if (err) handleError(err, options);

// 			var promises = [];
// 			for (var i in config.screenshotiphone) {
// 				var screenshot = config.screenshotiphone[i];
// 				var tmpImg = screenshotImg.clone();
// 				promises.push(new Promise(function (resolve, reject) {
// 					tmpImg.resize(screenshot.width, screenshot.height).write(options.targetPath + "/screenshots/" + screenshot.name + '-' + list.length + ".png", function (err) {
// 						if (err) {
// 							handleError(err, options);
// 						}
// 						console.log('Screenshot created');
// 						resolve();
// 					});
// 				}));

// 			}
// 			Promise.all(promises).then(function () {
// 				console.log('Next screenshot');
// 				createScreenshots(list, options);
// 			});
// 			// for(var i in type) {
// 			// 	var screenshot = type[i];

// 			// 	console.log('Creating screenshot: ' + name +' '  +screenshot.width + ', ' + screenshot.height);
// 			// 	var tmpImg = image.clone();
// 			// 	tmpImg.resize(screenshot.width,screenshot.height).write(options.targetPath+"/screenshots/"+ name + ".png",function(err){
// 			// 			if (err) {
// 			// 				handleError(err, options);
// 			// 				reject();
// 			// 			}
// 			// 		});
// 			// 	if(options.progressCB)
// 			// 		options.progressCB(screenshot.name);

// 			// }
// 		});
// 	}
// 	else {
// 		console.log('All screenshots created');
// 	}
// }

function getCenter(bitmap1, bitmap2) {
	var pos = {
		x: bitmap1.width / 2 - bitmap2.width / 2,
		y: bitmap1.height / 2 - bitmap2.height / 2
	}
	return pos;
}

function handleError(error, options) {
	if (!error)
		return;
	if (options.errorCB)
		options.errorCB()
	else
		throw error;
}

var defaultOptions = {
	iconImage: __dirname + "/icon.png",
	splashImage: __dirname + "/splash.png",
	targetPath: __dirname + "/resources/",
	progressCB: null,
	createStoreIcons: true,
	errorCB: null
};

module.exports = function (options, doneCallback) {

	if (options && typeof options == "object")
		options = extend(defaultOptions, options);
	else
		options = defaultOptions;

	var targetDir = options.targetPath;
	targetDir.split('/').forEach(function (dir, index, splits) {
		var parent = splits.slice(0, index).join('/');
		var dirPath = path.resolve(parent, dir);
		if (!fs.existsSync(dirPath)) {
			fs.mkdirSync(dirPath);
		}
	});

	if (!fs.existsSync(options.targetPath + "/misc")) {
		fs.mkdirSync(options.targetPath + "/misc");
	}

	if (!fs.existsSync(options.targetPath + "/android")) {
		fs.mkdirSync(options.targetPath + "/android");
	}

	if (!fs.existsSync(options.targetPath + "/android/icon")) {
		fs.mkdirSync(options.targetPath + "/android/icon");
	}

	if (!fs.existsSync(options.targetPath + "/android/splash")) {
		fs.mkdirSync(options.targetPath + "/android/splash");
	}

	if (!fs.existsSync(options.targetPath + "/ios")) {
		fs.mkdirSync(options.targetPath + "/ios");
	}

	if (!fs.existsSync(options.targetPath + "/ios/icon")) {
		fs.mkdirSync(options.targetPath + "/ios/icon");
	}

	if (!fs.existsSync(options.targetPath + "/ios/splash")) {
		fs.mkdirSync(options.targetPath + "/ios/splash");
	}

	// if (!fs.existsSync(options.targetPath + "/screenshots")) {
	// 	fs.mkdirSync(options.targetPath + "/screenshots");
	// }

	Jimp.read(options.iconImage).then(function (icon) {
		return new Promise((resolve, reject) => {
			createIcons(icon, resolve, options);
		})
	}).then(function () {
		console.log('icons done');
		return Jimp.read(options.splashImage);
	}).then(function (splash) {
		return new Promise((resolve, reject) => {
			createSplash(splash, resolve, options);
		});
	}).then(function (splash) {
		console.log('splash done');
		if (options.createStoreIcons) {
			new Promise((resolve, reject) => {
				createMisc(splash, resolve, options)
			}).then(function () {
				console.log('misc done');
				done(options, doneCallback);
			});
		} else
			done(options, doneCallback);
	}).catch(function (err) {
		if (err) handleError(err, options);
	});
}


function done(options, doneCallback) {
	if (doneCallback)
		doneCallback();

	// var iphone = options.iphoneScreenshots;
	// createScreenshots(iphone, options);
}