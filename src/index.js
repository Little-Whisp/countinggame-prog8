let model
let videoWidth, videoHeight
let ctx, canvas
const log = document.querySelector("#array")
const VIDEO_WIDTH = 720
const VIDEO_HEIGHT = 405


//List of buttons
const buttonOne = document.querySelector("#one");
const buttonTwo = document.querySelector("#two");
const buttonThree = document.querySelector("#three");
const trainButton = document.querySelector("#train");
const classify = document.querySelector("#classify");

//List of even listeners
buttonOne.addEventListener("click", () => learnOne());
buttonTwo.addEventListener("click", () => learnTwo());
buttonThree.addEventListener("click", () => learnThree());
trainButton.addEventListener("click", () =>  learnOne && console.log("Training"));
classify.addEventListener("click", () =>  predict() && console.log("predict"));

let webcamdata = []

// video fallback
navigator.getUserMedia = navigator.getUserMedia ||navigator.webkitGetUserMedia || navigator.mozGetUserMedia

let fingerLookupIndices = {
    thumb: [0, 1, 2, 3, 4],
    indexFinger: [0, 5, 6, 7, 8],
    middleFinger: [0, 9, 10, 11, 12],
    ringFinger: [0, 13, 14, 15, 16],
    pinky: [0, 17, 18, 19, 20]
}

async function main() {
    model = await handpose.load()
    const video = await setupCamera()
    video.play()
    startLandmarkDetection(video)
}

//
// start up camera
//
async function setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
            "Webcam not available"
        )
    }

    const video = document.getElementById("video")
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            facingMode: "user",
            width: VIDEO_WIDTH,
            height: VIDEO_HEIGHT
        }
    })
    video.srcObject = stream

    return new Promise(resolve => {
        video.onloadedmetadata = () => {
            resolve(video)
        }
    })
}

//
// predict the finger position in the webcam
//
async function startLandmarkDetection(video) {

    videoWidth = video.videoWidth
    videoHeight = video.videoHeight

    canvas = document.getElementById("output")

    canvas.width = videoWidth
    canvas.height = videoHeight

    ctx = canvas.getContext("2d")

    video.width = videoWidth
    video.height = videoHeight

    ctx.clearRect(0, 0, videoWidth, videoHeight)
    ctx.strokeStyle = "red"
    ctx.fillStyle = "red"

    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1) // Mirror video

    predictLandmarks()
}

//
// predict the location of the fingers with the model
//
async function predictLandmarks() {
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight, 0, 0, canvas.width, canvas.height)
    const predictions = await model.estimateHands(video) // ,true voor flip
    if (predictions.length > 0) {
        const result = predictions[0].landmarks
        drawHand(ctx, result, predictions[0].annotations)
        logData(predictions)
    }
    requestAnimationFrame(predictLandmarks)
    // setTimeout(()=>predictLandmarks(), 1000)
}

function logData(predictions) {
    let str = ""
    // console.log(predictions[0].landmarks)
    for (let i = 0; i < 20; i++) {
        str += predictions[0].landmarks[i][0] + ", " + predictions[0].landmarks[i][1] + ", " + predictions[0].landmarks[i][2] + ", "
    }
}


//
// Draw hands and finger
//
function drawHand(ctx, keypoints, annotations) {
    // Show all x,y,z punten from your intire hand
    const keypointsArray = keypoints;
    webcamdata = []

    for (let i = 0; i < keypointsArray.length; i++) {
        const y = keypointsArray[i][0]
        const x = keypointsArray[i][1]
        drawPoint(ctx, x - 2, y - 2, 3)
        // add data to new array
        webcamdata.push(x)
        webcamdata.push(y)
        console.log(webcamdata)
    }

    const fingers = Object.keys(fingerLookupIndices)
    for (let i = 0; i < fingers.length; i++) {
        const finger = fingers[i]
        const points = fingerLookupIndices[finger].map(idx => keypoints[idx])
        drawPath(ctx, points, false)

    }
}

//
// Draw a point
//
function drawPoint(ctx, y, x, r) {
    ctx.beginPath()
    ctx.arc(x, y, r, 0, 2 * Math.PI)
    ctx.fill()
}
//
// Draw a line
//
function drawPath(ctx, points, closePath) {
    const region = new Path2D()
    region.moveTo(points[0][0], points[0][1])
    for (let i = 1; i < points.length; i++) {
        const point = points[i]
        region.lineTo(point[0], point[1])
    }

    if (closePath) {
        region.closePath()
    }
    ctx.stroke(region)
}
//
// start
//
main()