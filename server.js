const http = require('http');
const app = require('./app');

app.set('port', process.env.PORT || 3002);
const server = http.createServer(app);
const PORT = process.env.PORT || 3002;
server.listen(
  PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
  },
);
module.exports = server;
