const express = require('express');
const WebSocket = require('ws');
const fs = require('fs');
const http = require ('http');

const app = express();

const PORT = 5000;

const LOG_FILE = 'log.txt';

// server 
const server  = http.createServer(app);
const wss = new WebSocket.Server({server});


// for last 10 lines

const getLastLines = () => {
    const data = fs.readFileSync(LOG_FILE, 'utf8');
    const lines = data.trim().split('\n');
    return lines.slice(-10).join('\n');
};

// broadcast data to client
const broadcast = (message) => {
    wss.clients.forEach((client) => {
        if(client.readyState === WebSocket.OPEN){
            client.send(message);
        }
    });
};

// watch log file

fs.watch(LOG_FILE, (eventType) =>{
    if(eventType === 'change'){
        const newData = getLastLines();
        broadcast(newData);
    }
});

// web socket connection.

wss.on('connection', (ws) => {
    console.log('connected');
    ws.send(getLastLines());

    ws.on('close', () => {
        console.log('disconnected');
    })
});

// server to html 

app.get('/log', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

server.listen(PORT, () => console.log(`server is running on http://localhost:${5000}`));

