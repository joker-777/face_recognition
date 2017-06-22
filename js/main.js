
function initExample() {

    var webcam		= document.getElementById("_webcam");		// our webcam video
    var imageData	= document.getElementById("_imageData");	// image data for BRFv4
    var canvas	    = document.getElementById("_faceData");
    var canvas2	    = document.getElementById("_faceData2");

    // var height      = $(canvas).height();
    // var width       = $(canvas).width();
    var height      = canvas.height;
    var width       = canvas.width;

    var brfManager	= null;
    var resolution	= null;
    var brfv4		= null;

	var imageDataCtx = imageData.getContext("2d");
	var context = canvas.getContext("2d");
	context.fillStyle = '#000000';
	context.fillRect(0, 0, width, height)
	var context2 = canvas2.getContext("2d");
	context2.fillStyle = '#000000';
	context2.fillRect(0, 0, width, height)

	// variables para cross-fade
	var len = 4 * width * height;
	var offset = new Array(len);
	var delta = new Array(len);
 
    startCamera();

    waitingPromse = $.Deferred().resolve()

    function startCamera() {

        // Start video playback once the camera was fetched.
        function onStreamFetched (mediaStream) {

            webcam.srcObject = mediaStream;
            webcam.play();

            // Check whether we know the video dimensions yet, if so, start BRFv4.
            function onStreamDimensionsAvailable () {

                if (webcam.videoWidth === 0) {
                    setTimeout(onStreamDimensionsAvailable, 100);
                } else {
                    waitForSDK();
                }
            }

            onStreamDimensionsAvailable();
        }

        window.navigator.mediaDevices.getUserMedia({video: {width: 640, height: 480, frameRate: 30}})
            .then(onStreamFetched).catch(function () { alert("No camera available."); });
    }

    function waitForSDK() {

        if(brfv4 === null) {
            brfv4 = {locateFile: function() { return "js/libs/brf/BRFv4_JS_trial.js.mem" }};
            initializeBRF(brfv4);
        }

        if(brfv4.sdkReady) {
            initSDK();
        } else {
            setTimeout(waitForSDK, 100);
        }
    }

    function initSDK() {

        // Resize the canvas to match the webcam video size.
        imageData.width		= webcam.videoWidth;
        imageData.height	= webcam.videoHeight;
        // canvas.width		= webcam.videoWidth;
        // canvas.height	= webcam.videoHeight;

        resolution	= new brfv4.Rectangle(0, 0, imageData.width, imageData.height);

        brfManager	= new brfv4.BRFManager();
        brfManager.init(resolution, resolution, "com.tastenkunst.brfv4.js.examples.minimal.webcam");
        brfManager.setMode(brfv4.BRFMode.FACE_DETECTION);

        setInterval(trackFaces, 1000/30);
    }


    // https://github.com/ariya/X2/blob/master/javascript/crossfading/crossfading.js
    function tween( result, factor) {
        var i, r;
        r = result.data;
        for (i = 0; i < len; i += 4) {
            r[i] = offset[i] + delta[i] * factor;
            r[i + 1] = offset[i + 1] + delta[i + 1] * factor;
            r[i + 2] = offset[i + 2] + delta[i + 2] * factor;
        }
        context.putImageData(result, 0, 0);
    }

    function startFading(result) {
        value = 1;
        ticker = window.setInterval(function () {
            value -= 0.01;
            tween(result, value);
            if (value <= 0) { window.clearInterval(ticker); }
        }, 1000 / 60);
    }

    function trackFaces() {

        if (waitingPromse.state() == 'pending') { return; }


        // imageDataCtx.setTransform(-1.0, 0, 0, 1, resolution.width, 0); // mirrored for draw of video
        imageDataCtx.drawImage(webcam, 0, 0, resolution.width, resolution.height);
        // imageDataCtx.setTransform( 1.0, 0, 0, 1, 0, 0); // unmirrored for draw of results

        brfManager.update(imageDataCtx.getImageData(0, 0, resolution.width, resolution.height).data);

        var faces = brfManager.getMergedDetectedFaces();
        // if (faces.length) {
        //   debugger
        // };

        if (!faces.length) { return; }

        // for(var i = 0; i < faces.length; i++) {

            var face = faces[0];

            dh = height
            dw = face.width * (height/face.height)
            dy = 0
            dx = Math.abs(width - dw) / 2

            debugger

            // canvas.style.opacity = 0;

            source = context.getImageData(0, 0, width, height);
            context2.drawImage(webcam, face.x, face.y, face.width, face.height, dx, dy, dw, dh);
            target = context2.getImageData(0, 0, width, height);
            result = context.createImageData(width, height)

            for (i = 0; i < len; i += 1) {
                offset[i] = target.data[i];
                delta[i] = source.data[i] - target.data[i];
                result.data[i] = 255;
            }

            // context.fillStyle = '#fff'
            // context.fillRect(0, 0, resolution.width, resolution.height);

            // canvas.style.opacity = 1;

			startFading(result);

            waitingPromse = $.Deferred();
            setTimeout(function() { waitingPromse.resolve() }, 2000)


            // if(face.state === brfv4.BRFState.FACE_TRACKING_START ||
            //     face.state === brfv4.BRFState.FACE_TRACKING) {
            //
            //     imageDataCtx.strokeStyle="#00a0ff";
            //
            //     for(var k = 0; k < face.vertices.length; k += 2) {
            //         imageDataCtx.beginPath();
            //         imageDataCtx.arc(face.vertices[k], face.vertices[k + 1], 2, 0, 2 * Math.PI);
            //         imageDataCtx.stroke();
            //     }
            // }
        // }
    }
}

$(function() {
    initExample();
});
