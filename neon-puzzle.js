function receiveNext() {
    let socket = new WebSocket("wss://neonhealth.software/agent-puzzle/challenge");
    socket.onopen = () => { console.log("Connected") };
    socket.onmessage = (event) => { handleMessage(event.data) };
    socket.onerror = (err) => { console.error("WebSocket error:", err) };
    socket.onclose = (event) => { console.log("Closed:", event.code, event.reason) };
}

/**
 * Handle a message from NEON
 * @param {string} message Expected to be a stringified JSON object
 */
function handleMessage(message) {
    const parsedMessage = JSON.parse(message)
    console.log("Parsed message", parsedMessage);

    switch (parsedMessage['type']) {
        case "challenge":
            return handleChallenge(parsedMessage['message']);
        default: throw new EvalError(`Recieved unknown message type ${type}`);
    }
}

/**
 * Handle a challenge from NEON
 * @param {Object[]} fragments a scrambled list of timestamped words
 */
function handleChallenge(fragments) {
    fragments.sort((a, b) => a['timestamp'] - b['timestamp']);
    const unscrambled = fragments.map(fragment => fragment['word']).join(' ');
    console.log("Unscrambled:", unscrambled);
}