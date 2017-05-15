# app-icons-no-imagemagick

A library to generate app icons and splash, mainly designed for use with cordova.

Also creates icons for appstore and google play.

Uses https://github.com/oliver-moran/jimp for image manupilation so it requires no external dependencies.

## Usage

```javascript
var appIcons = require('app-icons-no-imagemagick');

appIcons({
	// options
},function(){
	// done callback
});
```

## Options

```javascript
var defaultOptions = {
	iconImage : __dirname+"/icon.png",
	splashImage : __dirname+"/splash.png",
	targetPath : __dirname+"/resources/",
	progressCB : null, /* Called after every image is created */
	createStoreIcons : true,
	errorCB : null
};
```
