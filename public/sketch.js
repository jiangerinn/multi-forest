let socket;
let forest = {};
let gridSize = 60;
let pressTimer = 0;
let targetTime = 600; // 10 seconds (60 fps * 10)
let myColorSeed;

function setup() {
    createCanvas(windowWidth, windowHeight);
    socket = io();
    
socket.on('wither-tree', (res) => {
    // 当服务器说某棵树枯萎了，本地也把它删掉
    delete forest[res.gridId];
});
    // Assign a unique color seed for this session
    myColorSeed = random(0, 100);

    // Sync with existing trees
    socket.on('init-forest', (data) => {
        forest = data;
    });

    // Listen for new trees from others
    socket.on('new-tree', (res) => {
        forest[res.gridId] = res.tree;
    });
}

function draw() {
    background(0); 
    
    drawUI();

    let cols = floor(width / gridSize);
    let rows = floor(height / gridSize);

    // Draw the grid system
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let id = i + "_" + j;
            let x = i * gridSize;
            let y = j * gridSize;

            stroke(230);
            noFill();
            rect(x, y, gridSize, gridSize);

            // Render tree if it exists in this cell
            if (forest[id]) {
                drawTree(x, y, forest[id].colorSeed);
            }
        }
    }

    // Handle Long Press & Vertical Growth Logic
    if (mouseIsPressed) {
        pressTimer++;
        let gx = floor(mouseX / gridSize);
        let gy = floor(mouseY / gridSize);
        
        // Visual feedback for growth (vertical rising bar)
        if (gx >= 0 && gx < cols && gy >= 0 && gy < rows) {
            let growHeight = map(pressTimer, 0, targetTime, 0, gridSize);
            fill(100, 150, 100, 180);
            noStroke();
            // Growing upwards from the bottom of the cell
            rect(gx * gridSize + 10, (gy + 1) * gridSize, gridSize - 20, -growHeight);
        }

        // Planting trigger
        if (pressTimer >= targetTime) {
            let gx = floor(mouseX / gridSize);
            let gy = floor(mouseY / gridSize);
            let id = gx + "_" + gy;

            // Only send if the cell is empty
            if (!forest[id]) {
                socket.emit('plant-tree', { 
                    gridId: id, 
                    colorSeed: myColorSeed 
                });
            }
            pressTimer = 0; // Reset timer after planting
        }
    } else {
        pressTimer = 0;
    }
}

function drawUI() {
    fill(150,255,100);
    noStroke();
    textFont('Luckiest Guy'); // Use a clean font
    textSize(20);
    textAlign(LEFT, TOP);
    
    // Artistic Prompts
    text("PLEASE HOLD DOWN TO PLANT TOGETHER", 20, 20);
    text("NETWORK NODES: " + Object.keys(forest).length, 20, 40);
    
    fill(120);
    textSize(12);
}

function drawTree(x, y, seed) {
    push();
    translate(x + gridSize / 2, y + gridSize);
    
    // Deterministic random based on seed
    randomSeed(seed * 1000);
    
    // Mix of Organic Colors (Greens to Earthy Browns)
    let r = random(60, 140);
    let g = random(100, 180);
    let b = random(30, 70);
    
    fill(r, g, b);
    noStroke();
    
    // Minimalist Tree Aesthetic
    // Trunk
    rect(-4, -gridSize * 0.7, 8, gridSize * 0.7); 
    // Canopy
    ellipse(0, -gridSize * 0.6, 25, 35); 
    pop();
}

// Ensure the canvas resizes with the window
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}