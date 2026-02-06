const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 让服务器知道网页文件在 public 文件夹里
app.use(express.static('public'));

// 存储森林里树的位置
let forest = {}; 

io.on('connection', (socket) => {
    // 玩家加入时发送现有的森林
    socket.emit('init-forest', forest);

    // 收到种树请求
    socket.on('plant-tree', (gridId) => {
        if (!forest[gridId]) {
            forest[gridId] = true; 
            io.emit('new-tree', gridId); // 广播给所有人
        }
    });
});

server.listen(3000, '0.0.0.0', () => {
    console.log('服务器已启动！地址: http://localhost:3000');
});