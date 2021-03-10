const http = require('http');

const server = http.createServer((req, res) => {
    res.status = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World Again');
});

server.listen(3000, () => {
    console.log('Serve on port 3000');
})