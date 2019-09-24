const http = require('http');
const app = require('./config/app');

/**#.env */
const dotenv = require('dotenv');
dotenv.config();

const server = http.createServer(app);
app.io.attach(server)
app.io.origins(["*:*"])

server.listen(process.env.PORT, () => {
    console.log(`Server Listening on port ${process.env.PORT}`)
});