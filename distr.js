var VALUE_MAX = 19;
var VALUE_MIN = 0;
var POPULATION = 1000;

var GRID2D_SIZE = 25;
var SHOW2DOTS = [true, true, true];

var DST_CONFIG = 0;

var COLORS = true;

var canvas2;
var ctx2;

var MaxDistance = 0;

var FORCE_EDGES = false;

// Pseudorandom numbers
var m_w = 123456789;
var m_z = 987654321;
var mask = 0xffffffff;
var USE_PSEUDORANDOM = true;
var SEED = 12345678;

function usePseudorandom() {
    USE_PSEUDORANDOM = !USE_PSEUDORANDOM;
}

function newSeed() {
    SEED = Math.floor(Math.random() * 100000);
    draw();
    updateMap();
}

function enable2DA() {
    SHOW2DOTS[0] = !SHOW2DOTS[0];
    updateMap();
}

function enable2DB() {
    SHOW2DOTS[1] = !SHOW2DOTS[1];
    updateMap();
}

function enable2DC() {
    SHOW2DOTS[2] = !SHOW2DOTS[2];
    updateMap();
}

function dstSelect() {
    var x = document.getElementById("dstConfig").selectedIndex;
    var y = document.getElementById("dstConfig").options;
    DST_CONFIG = y[x].index;

    for (var i = 0; i < 16; i ++){
	for (var j = 0; j < 16; j ++) {
	    GRID_DATA[i][j] = false;
	    DISTANCE_FIELD[i][j] = 99999;
	}
    }

    for (var i = 0; i < 16; i ++){
	switch(DST_CONFIG) {
	case 0: GRID_DATA[0][i] = true;  break;
	case 1: GRID_DATA[7][i] = true; break;
	case 2: GRID_DATA[15][i] = true; break;
	case 3: GRID_DATA[i][0] = true; break;
	case 4: GRID_DATA[i][7] = true; break;
	case 5: GRID_DATA[i][15] = true; break;
	case 6: GRID_DATA[i][i] = true; break;
	case 7: {
	    GRID_DATA[i][i] = true;
	    GRID_DATA[15-i][i] = true;
	} break;
	case 8: for (var j = 0; j < 16; j ++) GRID_DATA[i][j] = true; break;
	case 9: for (var j = 0; j < 16; j ++) GRID_DATA[i][j] = false; break;
	}
    }
    updateMap();
}

// Takes any integer
function seed(i) {
    m_w = (123456789 + i) & mask;
    m_z = (987654321 - i) & mask;
}

// Returns number between 0 (inclusive) and 1.0 (exclusive),
// just like Math.random().
function random() {
    if (USE_PSEUDORANDOM) {
	m_z = (36969 * (m_z & 65535) + (m_z >> 16)) & mask;
	m_w = (18000 * (m_w & 65535) + (m_w >> 16)) & mask;
	var result = ((m_z << 16) + (m_w & 65535)) >>> 0;
	result /= 4294967296;
	return result;
    } else{
	return Math.random();
    }
}

function Uniform(min, max) {
    return Math.floor(random() * (max-min)) + min;
}

function gaussianRand() {
    var rand = 0;

    for (var i = 0; i < 6; i += 1) {
	rand += random();
    }

    return rand / 6.0;
}

function Normal(start, end) {
    return Math.floor(start + gaussianRand() * (end - start + 1));
}



var slider = document.getElementById("slider");
var currentDistance = slider.value/100.0;
var output = document.getElementById("sliderAmount");
output.innerHTML = currentDistance;

slider.oninput = function() {
    currentDistance = this.value/100.0;
    output.innerHTML = currentDistance;
    draw();
}

var sliderPop = document.getElementById("sliderPop");
var outputPop = document.getElementById("sliderAmountPop");
outputPop.innerHTML = POPULATION;
sliderPop.oninput = function() {
    POPULATION = this.value;
    outputPop.innerHTML = POPULATION;
    draw();
    updateMap();
}

slider.oninput = function() {
    currentDistance = this.value/100.0;
    output.innerHTML = currentDistance;
    draw();
}

draw(currentDistance);


var GRID_DATA = []
var DISTANCE_FIELD = []
for (var i = 0; i < 16; i ++){
    GRID_DATA[i] = []
    DISTANCE_FIELD[i] = [];
    for (var j = 0; j < 16; j ++) {
	GRID_DATA[i][j] = false;
	DISTANCE_FIELD[i][j] = 99999;
    }
}

dstSelect();

var outputW = document.getElementById("sliderWeightAmount");
var sliderW = document.getElementById("sliderWeight");
var currentWeight = sliderW.value/500.0; // w, if w \in [0,1]
currentWeight = currentWeight - 1;
outputW.innerHTML = currentWeight;


sliderW.oninput = function() {
    currentWeight = sliderW.value/500.0;
    currentWeight = currentWeight - 1;
    outputW.innerHTML = currentWeight;
    // if (currentWeight > 1) {
    // 	W = Math.pow(MaxDistance, (currentWeight - 1.0));
    // }
    updateMap();
}


var outputB = document.getElementById("sliderBlankAmount");
var sliderB = document.getElementById("sliderBlankDistance");
var blankDistance = 0;
sliderB.oninput = function() {
    blankDistance = sliderB.value / 1000.0;
    outputB.innerHTML = blankDistance;
    updateMap();
}

function forceEdges() {
    FORCE_EDGES = !FORCE_EDGES;
    updateMap();
}


updateMap();

function mouseToGrid(X, Y) {
    var rect = canvas2.getBoundingClientRect();
    var mouseX = X - rect.x;
    var mouseY = Y - rect.y;
    mouseX = Math.floor(mouseX / GRID2D_SIZE);
    mouseY = Math.floor(mouseY / GRID2D_SIZE);

    return {
        x: mouseX,
        y: mouseY
    };
}

function onClick(event) {
    pos = mouseToGrid(event.clientX, event.clientY);
    if ((pos.x <= 15) && (pos.y <= 15)) {
	GRID_DATA[pos.x][pos.y] = !GRID_DATA[pos.x][pos.y];
	updateMap();
    }
}

function onMove(event) {
    pos = mouseToGrid(event.clientX, event.clientY);
    var v = document.getElementById("gridValue");
    var value = "";
    if (pos.x >= 17)
	pos.x -= 17;

    if ( (pos.x < 16) && (pos.y < 16) )
	value = parseFloat(DISTANCE_FIELD[pos.x][pos.y]);
    v.innerHTML = "(<i>" + pos.x + "</i>, <i>" + pos.y + "</i>) =  <b>" + value + "</b>";
}

function updateMap (){
    draw2();
    for (var i = 0; i < 16; i ++){
	for (var j = 0; j < 16; j ++) {
	    if (GRID_DATA[i][j]) {
		// DISTANCE_FIELD[i][j] = 0;
		ctx2.beginPath();
		ctx2.fillStyle = 'magenta';
		ctx2.strokeStyle = 'white';
		ctx2.fillRect(i * GRID2D_SIZE, j * GRID2D_SIZE, GRID2D_SIZE, GRID2D_SIZE);
		ctx2.rect(i * GRID2D_SIZE, j * GRID2D_SIZE, GRID2D_SIZE, GRID2D_SIZE);
		ctx2.stroke();
	    }
		// Compute distance
	    var distance = 999999;
	    for (var x = 0; x < 16; x ++){
		for (var y = 0; y < 16; y ++) {
		    if (GRID_DATA[x][y]) {
			distance = Math.min(distance, Math.sqrt((x - i) * (x - i) + (y - j) * (y - j)));
		    }
		}
	    }
	    DISTANCE_FIELD[i][j] = distance;
	}
    }

    var maxv = [];
    for (var i = 0; i < 16; i ++) {
	maxv[i] = Math.max(...DISTANCE_FIELD[i]);
    }
    MaxDistance = Math.max(...maxv);

    for (var i = 0; i < 16; i ++){
	for (var j = 0; j < 16; j ++) {
	    DISTANCE_FIELD[i][j] /= MaxDistance; // normalization
	    DISTANCE_FIELD[i][j] += currentWeight; // ponderation
	    ctx2.beginPath();
	    ctx2.fillStyle = 'black';
	    ctx2.strokeStyle = 'black';
	    ctx2.fillText(DISTANCE_FIELD[i][j].toFixed(1),
			  i * GRID2D_SIZE + GRID2D_SIZE/4, j * GRID2D_SIZE + GRID2D_SIZE/2);
	    ctx2.stroke();

	}
    }

    var dataA = [];
    var dataB = [];
    for (var i = 0; i < 16; i ++){
	dataA[i] = [];
	dataB[i] = [];
	for (var j = 0; j < 16; j ++) {
	    dataA[i][j] = false;
	    dataB[i][j] = false;
	}
    }


    var offx = 17 * GRID2D_SIZE;

    for (var i = 0; i < POPULATION / 10; i ++) {
	// compute probabilities:
	var x;
	var y;
	x = Uniform(0, 15);
	y = Uniform(0, 15);
	dataA[x][y] = true;
	if (SHOW2DOTS[0]) {
	    ctx2.beginPath();
	    ctx2.fillStyle = 'red';
	    ctx2.strokeStyle = 'red';
	    ctx2.fillRect(offx + x * GRID2D_SIZE + GRID2D_SIZE/2,
	 		  y * GRID2D_SIZE + GRID2D_SIZE/2, GRID2D_SIZE/2, GRID2D_SIZE/2);
	    ctx2.stroke();
	}

	x = Normal(0, 15);
	y = Normal(0, 15);
	dataB[x][y] = true;
	if (SHOW2DOTS[1]) {
	    ctx2.beginPath();
	    ctx2.fillStyle = 'blue';
	    ctx2.strokeStyle = 'blue';
	    ctx2.fillRect(offx + x * GRID2D_SIZE,
	 		  y * GRID2D_SIZE, GRID2D_SIZE/2, GRID2D_SIZE/2);
	    ctx2.stroke();
	}
    }

    for (var i = 0; i < 16; i ++) {
	for (var j = 0; j < 16; j ++) {
	    var draw;
	    if (random() > DISTANCE_FIELD[i][j])
		draw = "A";
	    else
		draw = "B";

	    if ((FORCE_EDGES) && (DISTANCE_FIELD[i][j] - currentWeight) <= 0) {
		draw = "C";
	    } else {
		if ((FORCE_EDGES) && (DISTANCE_FIELD[i][j] - currentWeight) <= blankDistance)
		    draw = "NONE";
	    }

	    var caseA = ( (draw == "A") && (dataA[i][j]) );
	    var caseB = ( (draw == "B") && (dataB[i][j]) );
	    var caseC = (draw == "C");
	    if (caseA || caseB || caseC) {
		if (SHOW2DOTS[2]) {
		    ctx2.beginPath();
		    ctx2.fillStyle = 'green';
		    ctx2.strokeStyle = 'green';
		    ctx2.fillRect(offx + i * GRID2D_SIZE + GRID2D_SIZE/4,
	 			  j * GRID2D_SIZE + GRID2D_SIZE/4, GRID2D_SIZE/2, GRID2D_SIZE/2);
		    ctx2.stroke();
		}
	    }
	}
    }
}

function setColors(v){
    COLORS = !COLORS;
    draw();
}


function clear(canvas)
{
    canvas.width = canvas.width;  // clear the whole canvas
}

function drawGrid (ctx, xorg, yorg, w, h, step, color) {
    ctx.beginPath();
    for (var x=xorg;x<=xorg+w;x+=step) {
        ctx.moveTo(x, yorg);
        ctx.lineTo(x, h+yorg);
    }
    // set the color of the line
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    // the stroke will actually paint the current path
    ctx.stroke();
    // for the sake of the example 2nd path
    ctx.beginPath();
    for (var y=yorg;y<=yorg+h;y+=step) {
        ctx.moveTo(xorg, y+yorg);
        ctx.lineTo(w+xorg, y+yorg);
    }
    // set the color of the line
    ctx.strokeStyle = color;
    // just for fun
    ctx.lineWidth = 1;
    // for your original question - you need to stroke only once
    ctx.stroke();
};


function draw() {
    seed(SEED);

    // 1D Example
    var dataA = [];
    var dataB = [];
    var dataC = [];

    var c = document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    ctx.font = "30px Arial";
    clear(c);

    ctx.fillText("A: Uniform distribution ", 10, 20);
    ctx.fillText("B: Normal distribution ", 160, 20);
    ctx.fillText("C: Interpolated distribution ", 320, 20);

    var range = VALUE_MAX - VALUE_MIN;
    for (var i = 0; i <= range; i ++) {
	dataA[i] = 0;
	dataB[i] = 0;
	dataC[i] = 0;
    }

    for (var i = 0; i < POPULATION; i ++) {
        var vA = Uniform(VALUE_MIN, VALUE_MAX);
	// populate A
	dataA[vA] ++;
	// populate B
        var vB = Normal(VALUE_MIN, VALUE_MAX);
	dataB[vB] ++;
	// populate C
	var randomD = random();
	//var randomD = gaussianRand();
	ctx.beginPath();
	ctx.rect(Uniform(0, c.width), Uniform(200,400), 2, 2);
	if (randomD > currentDistance) {
	    dataC[vA] ++;
	    // 2D version
	    if (COLORS) {
		ctx.strokeStyle = 'red';
	    } else {
		ctx.strokeStyle = 'green';
	    }
	    ctx.stroke();
	} else {
	    dataC[vB] ++;
	    // 2D version
	    ctx.beginPath();
	    ctx.rect(Normal(0, c.width), Normal(200, 400),
		     2, 2);
	    if (COLORS) {
		ctx.strokeStyle = 'blue';
	    } else {
		ctx.strokeStyle = 'green';
	    }
	    ctx.stroke();
	}
    }
    var maxA = Math.max(...dataA);
    var maxB = Math.max(...dataB);
    var maxC = Math.max(...dataC);

    for (var i = 0; i < dataA.length; i ++) {
	ctx.beginPath();
	ctx.rect(20+i*5, 200, 5, -150*dataA[i]/(maxA));
	ctx.strokeStyle = 'red';
	ctx.stroke();
    }

    for (var i = 0; i < dataB.length; i ++) {
	ctx.beginPath();
	ctx.rect(170+i*5, 200, 5, -150*dataB[i]/(maxB));
	ctx.strokeStyle = 'blue';
	ctx.stroke();
    }


    for (var i = 0; i < dataB.length; i ++) {
	ctx.beginPath();
	ctx.rect(320+i*5, 200, 5, -150*dataC[i]/(maxC));
	ctx.strokeStyle = 'green';
	ctx.stroke();
    }
}

function draw2(){
    seed(SEED);

    // 2D Example
    var c = document.getElementById("myCanvas2");
    canvas2 = c;
    var ctx = c.getContext("2d");
    ctx2 = ctx;
    ctx2.font = "4px Arial";
    clear(c);

    drawGrid(ctx, 0, 0, 16 * GRID2D_SIZE, 16 * GRID2D_SIZE, GRID2D_SIZE, 'rgb(100,100,100)');
    drawGrid(ctx, 17 * GRID2D_SIZE, 0, 16 * GRID2D_SIZE, 16 * GRID2D_SIZE, GRID2D_SIZE, 'rgb(100,100,100)');
}

