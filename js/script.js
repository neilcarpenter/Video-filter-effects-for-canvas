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
stats.domElement.style.top = '62px';
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
        case 'blur':
			blur();
			ctx.drawImage(c2, 0, 0, winWidth, vHeight);
            break;
        case 'sharpen':
			sharpen();
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
	for (var i = 0; i < pixelData.data.length; i += 4 ) {
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
	for (var i = 0; i < pixelData.data.length; i += 4 ) {
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
	// Loop through each pixel and convert it to grey scale
	for (var i = 0; i < pixelData.data.length; i += 4 ) {
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

// Blurs the canvas image
function blur() {
	var weights = [1/9, 1/9, 1/9,
				   1/9, 1/9, 1/9,
				   1/9, 1/9, 1/9];
	convolute(weights);
}

// Sharpens the canvas image by applying a 3x3 sharpen filter
function sharpen() {
	var weights = [  0, -1,  0,
    -1,  5, -1,
     0, -1,  0 ];
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

window.onload = go();

window.onresize = function () {

	// add resizey stuff here. Or don't

};