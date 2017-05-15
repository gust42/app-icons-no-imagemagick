# app-icons-no-imagemagick

A library to generate app icons and splash, mainly designed for use with cordova.

Uses https://github.com/oliver-moran/jimp for image manupilation so it requieres no external dependencies.

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
	progressCB : null,
	errorCB : null
};
```
