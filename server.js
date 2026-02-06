const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// 设置静态文件目录
app.use(express.static('public'));

// 存储“森林”数据
let forest = {}; 

io.on('connection', (socket) => {
    console.log('User joined:', socket.id);

    // 1. 同步现有森林给新玩家
    socket.emit('init-forest', forest);

    // 2. 监听种树事件
    socket.on('plant-tree', (data) => {
        // 只有空格子才能种树
        if (data && data.gridId && !forest[data.gridId]) {
            
            // 将树的信息存入服务器
            forest[data.gridId] = { 
                owner: socket.id, 
                colorSeed: data.colorSeed 
            }; 
            
            // 广播新树生成
            io.emit('new-tree', { 
                gridId: data.gridId, 
                tree: forest[data.gridId] 
            });

            console.log(`Tree planted at ${data.gridId}.`);

            // --- 核心功能：自动枯萎逻辑 ---
            // 设置 10 分钟（600,000 毫秒）后触发
            setTimeout(() => {
                if (forest[data.gridId]) {
                    // 从服务器内存中删除该树
                    delete forest[data.gridId]; 
                    
                    // 广播“枯萎”事件给所有在线玩家
                    io.emit('wither-tree', { gridId: data.gridId });
                    
                    console.log(`Tree at ${data.gridId} has withered naturally.`);
                }
            }, 600000); // 如果测试时想看效果，可以把这个数字改成 10000 (10秒)
            // ----------------------------
        }
    });

    socket.on('disconnect', () => {
        console.log('User left.');
    });
});

// 端口自适应配置（本地 3000，云端由环境决定）
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log('------------------------------------');
    console.log(`SERVER STATUS: ONLINE (Auto-Wither: 10m)`);
    console.log(`URL: http://localhost:${PORT}`);
    console.log('------------------------------------');
});