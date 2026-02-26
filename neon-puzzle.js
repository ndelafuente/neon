function startPuzzle() {
    const vars = { CHECKPOINT: 0 };
    let socket = new WebSocket("wss://neonhealth.software/agent-puzzle/challenge");
    socket.onopen = () => { console.log("Connected") };
    socket.onmessage = (event) => { handleMessage(socket, event.data, vars) };
    socket.onerror = (err) => { console.error("WebSocket error:", err) };
    socket.onclose = (event) => { console.log("Closed:", event.code, event.reason) };
}

/**
 * Handle a message from NEON
 * @param {WebSocket} socket The web socket
 * @param {string} message Expected to be a stringified JSON object
 * @param {{CHECKPOINT: number}} vars Variables accessible across calls
 */
function handleMessage(socket, message, vars) {
    const parsedMessage = JSON.parse(message)
    console.debug("Parsed message", parsedMessage);

    switch (parsedMessage['type']) {
        case "challenge":
            handleChallenge(socket, parsedMessage['message']);
            return;
        case "success":
            console.log(`Checkpoint ${vars.CHECKPOINT} passed!`);
            vars.CHECKPOINT += 1;
            return;
        case "error":
            throw new Error("Submission rejected: " + parsedMessage['message']);
        default: throw new EvalError(`Recieved unknown message type ${type}`);
    }
}

/**
 * Handle a challenge from NEON
 * @param {WebSocket} socket The web socket
 * @param {Object[]} fragments a scrambled list of timestamped words
 */
function handleChallenge(socket, fragments) {
    fragments.sort((a, b) => a['timestamp'] - b['timestamp']);
    const unscrambled = fragments.map(fragment => fragment['word']).join(' ');
    console.debug("Unscrambled:", unscrambled);
}

/**
 * A robust messenger, accomodating NEON's archaic logic
 * @param {WebSocket} socket The web socket
 * @param {string|number} message The message to send
 * @param {{includePound: boolean}} options
 */
function sendResponse(socket, message, { includePound = false } = {}) {
    const send = (o) => socket.send(JSON.stringify(o));
    switch (typeof message) {
        case "number":
            let digits = message.toString();
            if (includePound) digits += '#';
            send({ "type": "enter_digits", digits });
            return;
        case "string":
            // TODO: verify text length?
            let text = message;
            send({ "type": "speak_text", text });
            return;
    }
}

startPuzzle();