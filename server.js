const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 1. 设置静态文件目录，让服务器能找到 public 文件夹里的 index.html 和 sketch.js
app.use(express.static('public'));

// 2. 存储“森林”数据：记录哪个格子种了哪棵树
// 数据格式示例: { "0_1": { owner: "socket_id", colorSeed: 45.2 } }
let forest = {}; 

io.on('connection', (socket) => {
    console.log('A user joined the network. ID:', socket.id);

    // 3. 当新玩家连接时，立刻把当前已有的森林发送给他们
    socket.emit('init-forest', forest);

    // 4. 监听来自玩家的“种树”请求
    socket.on('plant-tree', (data) => {
        // 安全检查：确保收到了 gridId，且该位置还没被占用
        if (data && data.gridId && !forest[data.gridId]) {
            
            // 将树的信息存入服务器内存
            forest[data.gridId] = { 
                owner: socket.id, 
                colorSeed: data.colorSeed 
            }; 
            
            // 5. 广播（Broadcast）：告诉所有在线的人，有个格子长出了新树
            io.emit('new-tree', { 
                gridId: data.gridId, 
                tree: forest[data.gridId] 
            });
            
            console.log(`Action: Tree planted at [${data.gridId}] by user [${socket.id}]`);
        }
    });

    // 6. 监听断开连接（可选，用于后台观察）
    socket.on('disconnect', () => {
        console.log('A user left the network.');
    });
});

// 7. 端口设置：优先使用环境端口（Render云端需要），本地默认 3000
const PORT = process.env.PORT || 3000;

server.listen(PORT, '0.0.0.0', () => {
    console.log('------------------------------------');
    console.log(`SERVER STATUS: ONLINE`);
    console.log(`Local Access: http://localhost:${PORT}`);
    console.log('------------------------------------');
});