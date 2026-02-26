function recieveNext() {
    let socket = new WebSocket("wss://neonhealth.software/agent-puzzle/challenge");
    socket.onopen = () => { console.log("Connected") };
    socket.onmessage = (event) => { handleMessage(event.data) };
    socket.onerror = (err) => { console.error("WebSocket error:", err) };
    socket.onclose = (event) => { console.log("Closed:", event.code, event.reason) };
}

function handleMessage(message) {
    const parsedMessage = JSON.parse(message)
    console.log("Parsed message", parsedMessage);

    switch (parsedMessage['type']) {
        case "challenge":
            return handleChallenge(parsedMessage['message']);
        default: throw new EvalError(`Recieved unknown message type ${type}`);
    }
}

function handleChallenge(fragments) {

}