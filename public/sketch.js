let socket;
let forest = {};
let gridSize = 50;
let pressTimer = 0;
let targetTime = 60; // 约1秒，10秒请改为 600

function setup() {
    createCanvas(windowWidth, windowHeight);
    socket = io();
    socket.on('init-forest', (data) => forest = data);
    socket.on('new-tree', (gridId) => forest[gridId] = true);
}

function draw() {
    background(220);
    let cols = floor(width / gridSize);
    let rows = floor(height / gridSize);

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let id = i + "_" + j;
            stroke(200);
            noFill();
            rect(i * gridSize, j * gridSize, gridSize, gridSize);
            if (forest[id]) {
                fill(40, 150, 40);
                ellipse(i * gridSize + gridSize/2, j * gridSize + gridSize/2, 30);
            }
        }
    }

    if (mouseIsPressed) {
        pressTimer++;
        // 绘制进度条
        fill(0, 255, 0);
        rect(mouseX, mouseY - 20, map(pressTimer, 0, targetTime, 0, 100), 10);
        
        if (pressTimer >= targetTime) {
            let gx = floor(mouseX / gridSize);
            let gy = floor(mouseY / gridSize);
            socket.emit('plant-tree', gx + "_" + gy);
            pressTimer = 0;
        }
    } else {
        pressTimer = 0;
    }
}