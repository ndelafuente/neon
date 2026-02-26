function recieveNext() {
    // From ChatGPT
    let socket = new WebSocket("wss://neonhealth.software/agent-puzzle/challenge");
    socket.onopen = () => { console.log("Connected") };
    socket.onmessage = (event) => { handleMessage(event.data) };
    socket.onerror = (err) => { console.error("WebSocket error:", err) };
    socket.onclose = (event) => { console.log("Closed:", event.code, event.reason) };
}

function handleMessage(message) {s
    const parsedMessage = JSON.parse(message)
    console.log("Recieved", parsedMessage);
}