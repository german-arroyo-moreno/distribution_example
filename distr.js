var VALUE_MAX = 19;
var VALUE_MIN = 0;
var POPULATION = 1000;

var COLORS = true;

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


draw(currentDistance);


slider.oninput = function() {
    currentDistance = this.value/100.0;
    output.innerHTML = currentDistance;
    draw();
}


function setColors(v){
    COLORS = !COLORS;
    draw();
}

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

function clear(canvas)
{
    canvas.width = canvas.width;  // clear the whole canvas
}

function draw() {
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

    ctx.save();
    for (var i = 0; i < dataA.length; i ++) {
	ctx.beginPath();
	ctx.rect(20+i*5, 200, 5, -150*dataA[i]/(maxA));
	ctx.strokeStyle = 'red';
	ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    for (var i = 0; i < dataB.length; i ++) {
	ctx.beginPath();
	ctx.rect(170+i*5, 200, 5, -150*dataB[i]/(maxB));
	ctx.strokeStyle = 'blue';
	ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    for (var i = 0; i < dataB.length; i ++) {
	ctx.beginPath();
	ctx.moveTo(0, 0);
	ctx.rect(320+i*5, 200, 5, -150*dataC[i]/(maxC));
	ctx.strokeStyle = 'green';
	ctx.stroke();
    }
    ctx.restore();
}

