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
    const prompt = fragments.map(fragment => fragment['word']).join(' ');
    console.debug("Prompt:", prompt);

    switch (prompt.split(/[.:]/)[0]) {
        // a) Signal Handshake
        case "Incoming vessel detected":
            const freqRegex = /excellent software engineer, respond on frequency (\d)/;
            const frequency = prompt.match(freqRegex)?.[1];
            if (!frequency) throw new Error("Unable to parse frequency for excellence.");
            return sendResponse(socket, "enter_digits", frequency);

        // a) Vessel Identification
        case "Transmit your vessel authorization code, followed by the pound key":
            return sendResponse(socket, "enter_digits", "c97671c039ccaa80#");

        // b) Computational Assessments
        case "Orbital decay detected":
            const trajRegex = /Determine the trajectory offset and transmit the result, followed by the pound key: (.*)/;
            const trajectoryCalc = prompt.match(trajRegex)?.[1]
            if (!trajectoryCalc) throw new Error("Unable to parse trajectory");
            const trajectory = Number(eval(trajectoryCalc));
            return sendResponse(socket, "enter_digits", trajectory.toString() + '#');

        // c) Knowledge Archive Query
        case "Cross-reference the knowledge archive":
            throw new Error("not implemented");

        // d) Crew Manifest Transmissions
        case "Crew manifest continued":
            const charLimitRegex = /less than (\d+) total characters/
            const charLimit = Number.parseInt(prompt.match(charLimitRegex)?.[1]);
            if (!charLimit) throw new Error("Unable to parse character limit");
            const manifest = `This pilot should be granted access because he is nice`
            return sendResponse(socket, "speak_text", manifest);

        // e) Transmission Verification
        case "unknown":
            throw new Error("not implemented");

        default:
            socket.close();
            throw new Error("Encountered unexpected prompt");
    }
}

/**
 * A robust messenger, accomodating NEON's archaic logic
 * @param {WebSocket} socket The web socket
 * @param {string} type The message type
 * @param {string} message The message to send
 */
function sendResponse(socket, type, message) {
    const send = (o) => socket.send(JSON.stringify(o));
    switch (type) {
        case "enter_digits":
            let digits = message;
            send({ type, digits });
            return;
        case "speak_text":
            // TODO: verify text length?
            let text = message;
            send({ type, text });
            return;
        default:
            throw new Error(`Unknown response type ${type}`);
    }
}

startPuzzle();