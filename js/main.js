
function initExample() {

    var webcam		= document.getElementById("_webcam");		// our webcam video
    var imageData	= document.getElementById("_imageData");	// image data for BRFv4
    var faceData	= document.getElementById("_faceData");

    var brfManager	= null;
    var resolution	= null;
    var brfv4		= null;

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
        faceData.width		= webcam.videoWidth;
        faceData.height	    = webcam.videoHeight;

        resolution	= new brfv4.Rectangle(0, 0, imageData.width, imageData.height);

        brfManager	= new brfv4.BRFManager();
        brfManager.init(resolution, resolution, "com.tastenkunst.brfv4.js.examples.minimal.webcam");
        brfManager.setMode(brfv4.BRFMode.FACE_DETECTION);

        setInterval(trackFaces, 1000/30);
    }

    function trackFaces() {

        if (waitingPromse.state() == 'pending') { return; }

        var imageDataCtx = imageData.getContext("2d");
        var faceDataCtx = faceData.getContext("2d");

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

            console.log('face tracked');

            dh = resolution.height
            dw = face.width * (resolution.height/face.height)
            dy = 0
            dx = (resolution.width - face.width) / 2

            faceDataCtx.drawImage(webcam, face.x, face.y, face.width, face.height, dx, dy, dw, dh);

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
