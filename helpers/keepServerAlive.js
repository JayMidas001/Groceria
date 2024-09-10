const http = require('http');
const https = require('https'); // Include the https module

const keepServerAlive = () => {
    const url = 'https://testapi-c8ay.onrender.com/';

    const protocol = url.startsWith('https') ? https : http; // Detect the correct protocol

    setInterval(() => {
        protocol.get(url, (res) => {
            console.log(`Pinging the server: ${url} - Status Code: ${res.statusCode}`);
        }).on('error', (err) => {
            console.error(`Error pinging the server: ${err.message}`);
        });
    }, 300000); // Ping every 5 minutes (300,000 milliseconds)
};

module.exports = keepServerAlive;
