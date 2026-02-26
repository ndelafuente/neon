const responses = [];
const crewManifest = {};

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
        case "Fusion reactor diagnostics":
        case "Life support recalibration":
        case "Navigational parameter required":
        case "Orbital decay detected":
        case "Shield frequency calibration needed":
            const computationRegex = /transmit the result, followed by the pound key: (.*)/;
            const computation = prompt.match(computationRegex)?.[1]
            if (!computation) throw new Error("Unable to parse trajectory");
            const result = Number(eval(computation));
            return sendResponse(socket, "enter_digits", result.toString() + '#');

        // c) Knowledge Archive Query
        case "Cross-reference the knowledge archive":
            const wordIdRegex = /speak the (?<word_Idx>\d+)\w+ word in the entry summary for '(?<title>.+)'/
            const wordIdMatch = prompt.match(wordIdRegex)?.groups || {};
            const word_Idx = Number.parseInt(wordIdMatch.word_Idx) - 1;
            const { title } = wordIdMatch;
            if (isNaN(word_Idx) || !title) throw new Error("Unable to parse knowledge request");
            const endpoint = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
            const res = await fetch(endpoint);
            if (res.status !== 200) throw new Error(`Could not fetch page ${endpoint}`)
            const json = await res.json();
            const word = json['extract'].split(' ')[word_Idx];
            return sendResponse(socket, "speak_text", word);

        // d) Crew Manifest Transmissions
        case "Crew manifest continued":
        case "Crew manifest required":
            switch (prompt) {
                case "Crew manifest continued. Speak the reason your crew member should be granted access to NEON based on the information in their resume, in less than 256 total characters. Convince us they're a good fit for the mission.":
                    const accessJustification = "This rising pilot has spent 3 years delivering urgent repairs and mission-critical upgrades for distributed systems, expertly navigating complex problem space, and keeping response times low as a fleet grows. Whatever the issue, he keeps the ship sailing."
                    return sendResponse(socket, "speak_text", accessJustification)

                case "Crew manifest continued. Speak a summary of your crew member's skills based on the information in their resume, between 64 and 256 total characters.":
                    const skills = "Full-stack software engineer skilled in Python, C#, JavaScript, and Azure, with experience in instrument monitoring, data pipelines, REST APIs, database optimization, and automated testing.";
                    crewManifest["skills"] = skills;
                    return sendResponse(socket, "speak_text", skills);

                case "Crew manifest continued. Speak a summary of your crew member's work experience based on the information in their resume, between 64 and 256 total characters.":
                    const workExperience = "Deployed to Bionano Genomics and Element Biosciences, building real-time run monitoring, data visualization, HPC pipelines, remote system health management, and automated QA systems.";
                    crewManifest["work experience"] = workExperience;
                    return sendResponse(socket, "speak_text", workExperience);

                case "Crew manifest continued. Speak a summary of your crew member's best project (work or personal) based on the information in their resume, between 64 and 256 total characters.":
                    const projectSummary = "Led Bionano Assure data migration: moved 500+ GB of legacy instrument data, upgraded cloud systems for a no-update transition, analyzed usage patterns to reduce customer downtime, and implemented robust test and rollback strategy.";
                    crewManifest["best project"] = projectSummary;
                    return sendResponse(socket, "speak_text", projectSummary);

                case "Crew manifest required. Speak a summary of your crew member's education based on the information in their resume, between 64 and 256 total characters.":
                    const educationSummary = "Trained at the University of San Diego, earning a BS in Computer Science with a Spanish minor, mastering algorithms, systems, embedded software, and user-centered design. Approaches every opportunity with a growth-oriented mindset."
                    crewManifest["education"] = educationSummary;
                    return sendResponse(socket, "speak_text", educationSummary);

                default:
                    throw new Error("Unknown crew manifest prompt.");
            }

        // e) Transmission Verification
        case "Transmission verification":
            const verificationRegex = /Earlier you transmitted your crew member's (?<type>.*)\. Speak the (?<word_Idx>\d+)\w+ word/;
            const verificationMatch = prompt.match(verificationRegex)?.groups || {};
            const magicWord_Idx = Number.parseInt(verificationMatch.word_Idx) - 1;
            const manifestKey = verificationMatch.type;
            if (isNaN(magicWord_Idx) || !manifestKey) throw new Error("Unable to parse knowledge request");
            const magicWord = crewManifest[manifestKey]?.split(' ')[magicWord_Idx];
            return sendResponse(socket, "speak_text", magicWord);

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
            let text = message;
            send({ type, text });
            return;
        default:
            throw new Error(`Unknown response type ${type}`);
    }
}

startPuzzle();