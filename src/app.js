const k = 3
const machine = new kNear(k)

function learnOne() {
    machine.learn(webcamdata, 'One')
    log.innerText = `Learning one`
}

function learnTwo() {
    machine.learn(webcamdata, 'Two')
    log.innerText = `Learning two`

}
function learnThree() {
    machine.learn(webcamdata, 'Three')
    log.innerText = `Learning three`
}

function predict() {
    let prediction = machine.classify(webcamdata)
    console.log(`It's ${prediction}`)
    log.innerText = `It's ${prediction}`
}