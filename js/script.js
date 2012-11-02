// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
 
// requestAnimationFrame polyfill by Erik MÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¶ller
// fixes from Paul Irish and Tino Zijdel
 
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

// stats
var stats = new Stats();
stats.setMode(0);
stats.domElement.style.position = 'absolute';
stats.domElement.style.left = '0px';
stats.domElement.style.top = '124px';
stats.domElement.style.zIndex = 1;
document.body.appendChild( stats.domElement );


var c, ctx, c2, ctx2, v, winWidth, winHeight, vHeight, c2Width, c2Height, ratio, animation;

var activeFilter = 'normal';

function go() {

	winWidth = window.innerWidth;
	winHeight = window.innerHeight;

	v = document.createElement('video');
	v.src = 'clouds.webm';
	v.autoplay = true;
	v.loop = true;

	v.addEventListener("loadedmetadata", vidLoaded, false);

	document.getElementById('controls').addEventListener('click', function(e) {
		var value = e.target.value;
		activeFilter = value ? value : activeFilter;
	}, false);

	document.getElementById('get-video').addEventListener('click', getVideo, false);
	document.getElementById('snapshot').addEventListener('click', snapshot, false);
	document.getElementById('fullscreen').addEventListener('click', fullscreen, false);

}

function vidLoaded() {
	ratio = v.videoHeight / v.videoWidth;
	vHeight = winWidth * ratio;
	v.width = winWidth;
	v.height = vHeight;

	createCanvas();
}

function createCanvas() {
	c = document.createElement('canvas');
	ctx = c.getContext('2d');
	c.width = winWidth;
	c.height = winHeight;
	c.style.position = 'absolute';
	c.style.top = 0;
	c.style.left = 0;
	c.style.zIndex = 0;

	document.body.appendChild(c);

	c2 = document.createElement('canvas');
	ctx2 = c2.getContext('2d');
	c2Width = Math.floor(winWidth / 4);
	c2Height = (winWidth / 4) * ratio;
	c2.width = c2Width;
	c2.height = c2Height;

	loop();
}

function loop() {
	animation = requestAnimationFrame( function(){ loop(); } );

	draw();

	stats.update();
}

function draw() {
	
    switch (activeFilter) {
        case 'normal':
            ctx.drawImage(v, 0, 0, winWidth, vHeight);
            break;
        case 'brighten':
			brighten(50);
			ctx.drawImage(c2, 0, 0, winWidth, vHeight);
            break;
        case 'threshold':
			threshold(50);
			ctx.drawImage(c2, 0, 0, winWidth, vHeight);
            break;
        case 'grey':
			grey();
			ctx.drawImage(c2, 0, 0, winWidth, vHeight);
            break;
        case 'invert':
			invert();
			ctx.drawImage(c2, 0, 0, winWidth, vHeight);
            break;
        case 'noise':
			noise();
			ctx.drawImage(c2, 0, 0, winWidth, vHeight);
            break;
        case 'blur':
			blur();
			ctx.drawImage(c2, 0, 0, winWidth, vHeight);
            break;
        case 'sharpen':
			sharpen();
			ctx.drawImage(c2, 0, 0, winWidth, vHeight);
            break;
        case 'edges':
			edges();
			ctx.drawImage(c2, 0, 0, winWidth, vHeight);
            break;
        case 'lumos':
			lumos();
			ctx.drawImage(c2, 0, 0, winWidth, vHeight);
            break;
        case 'redCyan':
			colorStuff(4);
			ctx.drawImage(c2, 0, 0, winWidth, vHeight);
            break;
        case 'lines':
			colorStuff(9);
			ctx.drawImage(c2, 0, 0, winWidth, vHeight);
            break;
        case 'dots':
			colorStuff(7);
			ctx.drawImage(c2, 0, 0, winWidth, vHeight);
            break;
        default:
            // ARGH
        break;
    }
}
// FROM http://www.iandevlin.com/html5/webcam-filters

// Brightens the canvas image
function brighten(adj) {
	// Get the picel data from the
	var pixelData = getPixelData();
	var pixelDataLen = pixelData.data.length;
	for (var i = 0; i < pixelDataLen; i += 4 ) {
		pixelData.data[i] += adj;
		pixelData.data[i+1] += adj;
		pixelData.data[i+2] += adj;
	}
	// Draw the data on the visible canvas
	ctx2.putImageData(pixelData, 0, 0);
}

// Thresholds the canvas image
function threshold(t) {
	var pixelData = getPixelData();
	var pixelDataLen = pixelData.data.length;
	for (var i = 0; i < pixelDataLen; i += 4 ) {
		// Get the RGB values for this pixel
		var r = pixelData.data[i];
		var g = pixelData.data[i+1];
		var b = pixelData.data[i+2];
		// Compare each pixel's greyscale value to the threshold value...
		var value = (0.2126 * r + 0.7152 * g + 0.0722 * b >= t) ? 255 : 0;
		// ...and set the colour based on the result
		pixelData.data[i] = pixelData.data[i+1] = pixelData.data[i+2] = value;
	}
	// Draw the data on the visible canvas
	ctx2.putImageData(pixelData, 0, 0);
}

function grey() {
	var pixelData = getPixelData();
	var pixelDataLen = pixelData.data.length;
	// Loop through each pixel and convert it to grey scale
	for (var i = 0; i < pixelDataLen; i += 4 ) {
		// Get the RGB values for this pixel
		var r = pixelData.data[i];
		var g = pixelData.data[i+1];
		var b = pixelData.data[i+2];
		// Get the weighted average colour across all 3 RGB values (based on standard Colour to GrayScale convertion methods)
		var averageColour = (r + g + b) / 3;
		pixelData.data[i] = averageColour;
		pixelData.data[i+1] = averageColour;
		pixelData.data[i+2] = averageColour;
	}
	// Draw the data on the visible canvas
	ctx2.putImageData(pixelData, 0, 0);
}

function invert() {
	var pixelData = getPixelData();
	var pixelDataLen = pixelData.data.length;

	for (var i = 0; i < pixelDataLen; i += 4 ) {
		// Get the RGB values for this pixel
		var r = pixelData.data[i];
		var g = pixelData.data[i+1];
		var b = pixelData.data[i+2];

		pixelData.data[i] = 255 - r;
		pixelData.data[i+1] = 255 - g;
		pixelData.data[i+2] = 255 - b;
	}
	// Draw the data on the visible canvas
	ctx2.putImageData(pixelData, 0, 0);
}

function noise() {
	var pixelData = getPixelData();
	var pixelDataLen = pixelData.data.length;

	for (var i = 0; i < pixelDataLen; i += 4 ) {
		var rand =  (0.5 - Math.random()) * 70;
		
		var r = pixelData.data[i];
		var g = pixelData.data[i+1];
		var b = pixelData.data[i+2];

		pixelData.data[i] = r + rand;
		pixelData.data[i+1] = g + rand;
		pixelData.data[i+2] = b + rand;
	}
	// Draw the data on the visible canvas
	ctx2.putImageData(pixelData, 0, 0);
}

// Blurs the canvas image
function blur() {
	var weights = [
		1/9, 1/9, 1/9,
		1/9, 1/9, 1/9,
		1/9, 1/9, 1/9];
	convolute(weights);
}

// Sharpens the canvas image by applying a 3x3 sharpen filter
function sharpen() {
	var weights = [
		0, -1,  0,
		-1,  5, -1,
		0, -1,  0 ];
	convolute(weights);
}

// various places, inc here http://www.phpied.com/canvas-pixels-2-convolution-matrix/
function edges() {
	var weights = [
		1, 1, 1,
		1, -7, 1,
		1, 1, 1 ];
	convolute(weights);
}

function lumos() {
	var weights = [
		1, 0, 0,
		0, 1, 0,
		0, 0, 1 ];
	convolute(weights);
}

// Applies a convolution filter
//(for more information see: http://www.html5rocks.com/en/tutorials/canvas/imagefilters/#toc-convolution)
function convolute(weights, opaque) {
	var side = Math.round(Math.sqrt(weights.length));
	var halfSide = Math.floor(side / 2);
	var pixels = getPixelData();
	var src = pixels.data;
	var sw = pixels.width;
	var sh = pixels.height;
	var pixelData = ctx2.createImageData(c2Width, c2Height);
	var dst = pixelData.data;
	// Iterate through the destination image pixels
	var alphaFac = opaque ? 1 : 0;
	for (var y = 0; y < c2Height; y++) {
		for (var x = 0; x < c2Width; x++) {
			var sy = y;
			var sx = x;
			var dstOff = (y * c2Width + x) * 4;
			// Calculate the weighed sum of the source image pixels that fall under the convolution matrix
			var r = 0, g = 0, b = 0, a = 0;
			for (var cy = 0; cy < side; cy++) {
				for (var cx = 0; cx < side; cx++) {
					var scy = sy + cy - halfSide;
					var scx = sx + cx - halfSide;
					if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
						var srcOff = (scy * sw + scx) * 4;
						var wt = weights[cy * side + cx];
						r += src[srcOff] * wt;
						g += src[srcOff+1] * wt;
						b += src[srcOff+2] * wt;
						a += src[srcOff+3] * wt;
					}
				}
			}
			dst[dstOff] = r;
			dst[dstOff+1] = g;
			dst[dstOff+2] = b;
			dst[dstOff+3] = a + alphaFac * (255 - a);
		}
	}
	// Draw the data on the visible canvas
	ctx2.putImageData(pixelData, 0, 0);
}

// Draws the contents of the video element onto the background canvas and returns the image data
function getPixelData() {
	// Draw the video onto the backing canvas
	ctx2.drawImage(v, 0, 0, c2Width, c2Height);
	// Grab the pixel data and work on that directly
	return ctx2.getImageData(0, 0, c2Width, c2Height);
}

function colorStuff(number) {
	var pixelData = getPixelData();
	var data = pixelData.data;
	var pixelDataLen = data.length;
	// Loop through each pixel and convert it to grey scale
	for (var i = 0; i < pixelDataLen; i += number ) {
		
		// Loop through the subpixels, convoluting each using an edge-detection matrix.
        if( i % 4 == 3 ) continue;
        data[i] = 127 + 2 * data[i] - data[i + 4] - data[i + c2Width * 4];

	}
	// Draw the data on the visible canvas
	ctx2.putImageData(pixelData, 0, 0);
}

function getVideo() {
	navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
	window.URL = window.URL || window.webkitURL;

	navigator.getUserMedia({video: true}, function(localMediaStream) {
		v.src = window.URL.createObjectURL(localMediaStream);

	}, function(error) {
		console.log(error);
	});
}

function snapshot() {
	window.open(c.toDataURL());
}

function fullscreen() {
	document.body.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
	document.body.mozRequestFullScreen();
	document.body.requestFullscreen();
}

window.onload = go();

window.onresize = function () {

	winWidth = window.innerWidth;
	winHeight = window.innerHeight;

	vHeight = winWidth * ratio;
	v.width = winWidth;
	v.height = vHeight;

	c.width = winWidth;
	c.height = winHeight;

};