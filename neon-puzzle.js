const responses = [];

function startPuzzle() {
    let socket = new WebSocket("wss://neonhealth.software/agent-puzzle/challenge");
    socket.onopen = () => { console.log("Connected") };
    socket.onmessage = (event) => { handleMessage(socket, event.data) };
    socket.onerror = (err) => { console.error("WebSocket error:", err) };
    socket.onclose = (event) => { console.log("Closed:", event.code, event.reason) };
}

/**
 * Handle a message from NEON
 * @param {WebSocket} socket The web socket
 * @param {string} message Expected to be a stringified JSON object
 */
async function handleMessage(socket, message) {
    const parsedMessage = JSON.parse(message)
    console.debug("Parsed message", parsedMessage);

    switch (parsedMessage['type']) {
        case "challenge":
            await handleChallenge(socket, parsedMessage['message']);
            return;
        case "success":
            console.log(`Access granted!`);
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
async function handleChallenge(socket, fragments) {
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
        case "Life support recalibration":
        case "Navigational parameter required":
        case "Orbital decay detected":
            const computationRegex = /transmit the result, followed by the pound key: (.*)/;
            const computation = prompt.match(trajRegex)?.[1]
            if (!computation) throw new Error("Unable to parse trajectory");
            const result = Number(eval(computation));
            return sendResponse(socket, "enter_digits", result.toString() + '#');

        // c) Knowledge Archive Query
        case "Cross-reference the knowledge archive":
            const wordIdRegex = /speak the (?<word_Idx>\d+)\w+ word in the entry summary for '(?<title>\w+)'/
            const wordIdMatch = prompt.match(wordIdRegex)?.groups || {};
            const word_Idx = Number.parseInt(wordIdMatch.word_Idx) - 1;
            const { title } = wordIdMatch;
            if (isNaN(word_Idx) || !title) throw new Error("Unable to parse knowledge request");
            const endpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`
            const res = await fetch(endpoint);
            if (res.status !== 200) throw new Error(`Could not fetch page ${endpoint}`)
            const json = await res.json();
            const word = json['extract'].split(' ')[word_Idx];
            return sendResponse(socket, "speak_text", word);

        // d) Crew Manifest Transmissions
        case "Crew manifest continued":
            const charLimitRegex = /less than (\d+) total characters/
            const charLimit = Number.parseInt(prompt.match(charLimitRegex)?.[1]);
            if (!charLimit) throw new Error("Unable to parse character limit");
            const accessJustification = "This rising pilot has spent 3 years delivering urgent repairs and mission-critical upgrades for distributed systems, expertly navigating complex problem space, and keeping response times low as a fleet grows. Whatever the issue, he keeps the ship sailing."
            return sendResponse(socket, "speak_text", accessJustification)

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
    responses.push(message);
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