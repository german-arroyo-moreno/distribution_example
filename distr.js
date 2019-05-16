var VALUE_MAX = 19;
var VALUE_MIN = 0;
var POPULATION = 1000;

var GRID2D_SIZE = 25;

var COLORS = true;

var canvas2;
var ctx2;


function Uniform(min, max) {
    return Math.floor(Math.random() * (max-min)) + min;
}

function gaussianRand() {
    var rand = 0;

    for (var i = 0; i < 6; i += 1) {
	rand += Math.random();
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
GRID_DATA[7][7] = true;

updateMap();


function onClick(event) {
    var rect = canvas2.getBoundingClientRect();
    var mouseX = event.clientX - rect.x;
    var mouseY = event.clientY - rect.y;
    mouseX = Math.floor(mouseX / GRID2D_SIZE);
    mouseY = Math.floor(mouseY / GRID2D_SIZE);
    //alert("Coords = " + mouseX + ", " + mouseY);
    if ((mouseX <= 15) && (mouseY <= 15)) {
	GRID_DATA[mouseX][mouseY] = !GRID_DATA[mouseX][mouseY];
	updateMap();
    }
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
	    if (distance < 100) {
		ctx2.beginPath();
		ctx2.fillStyle = 'black';
		ctx2.strokeStyle = 'black';
		ctx2.fillText(DISTANCE_FIELD[i][j].toFixed(1),
			      i * GRID2D_SIZE + GRID2D_SIZE/4, j * GRID2D_SIZE + GRID2D_SIZE/2);
		ctx2.stroke();
	    }

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
	ctx2.beginPath();
	ctx2.fillStyle = 'red';
	ctx2.strokeStyle = 'red';
	ctx2.fillRect(offx + x * GRID2D_SIZE + GRID2D_SIZE/2,
	 	      y * GRID2D_SIZE + GRID2D_SIZE/2, GRID2D_SIZE/2, GRID2D_SIZE/2);
	ctx2.stroke();

	x = Normal(0, 15);
	y = Normal(0, 15);
	dataB[x][y] = true;
	ctx2.beginPath();
	ctx2.fillStyle = 'blue';
	ctx2.strokeStyle = 'blue';
	ctx2.fillRect(offx + x * GRID2D_SIZE,
	 	      y * GRID2D_SIZE, GRID2D_SIZE/2, GRID2D_SIZE/2);
	ctx2.stroke();
    }

    for (var i = 0; i < 16; i ++) {
	for (var j = 0; j < 16; j ++) {
	    var draw;
	    if (Math.random() > DISTANCE_FIELD[i][j])
		draw = "B";
	    else
		draw = "A";
	    if ( ( (draw == "A") && (dataA[i][j]) ) || ( (draw == "B") && (dataB[i][j]) ) ) {
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
	var randomD = Math.random();
	//var randomD = gaussianRand();
	if (randomD > currentDistance) {
	    dataC[vA] ++;
	    // 2D version
	    ctx.beginPath();
	    ctx.rect(Uniform(0, c.width), Uniform(200,400),
		     2, 2);
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
    // 2D Example
    var c = document.getElementById("myCanvas2");
    canvas2 = c;
    var ctx = c.getContext("2d");
    ctx2 = ctx;
    ctx2.font = "10px Arial";
    clear(c);

    drawGrid(ctx, 0, 0, 16 * GRID2D_SIZE, 16 * GRID2D_SIZE, GRID2D_SIZE, 'rgb(100,100,100)');
    drawGrid(ctx, 17 * GRID2D_SIZE, 0, 16 * GRID2D_SIZE, 16 * GRID2D_SIZE, GRID2D_SIZE, 'rgb(100,100,100)');
}

