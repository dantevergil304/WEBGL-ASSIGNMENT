var gl;
var canvas;
var tex;
var score = 0;
function initViewPort(){
	gl.viewport(0, 0, canvas.width, canvas.height);
}


//Setup matrix

var mvMatrix = mat4.create();
var pMatrix = mat4.create();
var mvStackMatrices = [];

function mvPushMatrix(){
	var copy = mat4.create();
	mat4.set(mvMatrix, copy);
	mvStackMatrices.push(copy);
}

function mvPopMatrix(){
	if (mvStackMatrices.length == 0){
		throw "Invalid pop operation";
	}
	mvMatrix = mvStackMatrices.pop();
}


function setUniformMatrix(){
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);

	var normalMatrix = mat3.create();
	mat4.toInverseMat3(mvMatrix, normalMatrix);
	mat3.transpose(normalMatrix);
	gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
}



//Setup Shader program

function getShader(gl, id) {
	var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

	var str = "";
    var k = shaderScript.firstChild;
    while (k) {
	    if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
		shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
		shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
		return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
	    alert(gl.getShaderInfoLog(shader));
    	    return null;
       	}

    return shader;
}

var shaderProgram;

function initShaders(){
   	var fragmentShader = getShader(gl,"shader-fs");
    var vertexShader = getShader(gl,"shader-vs");

   	shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

		shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
		gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram,"uMVMatrix");
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
		shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
		shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
		shaderProgram.pointLightingLocationUniform = gl.getUniformLocation(shaderProgram, "uPointLightingLocation");
		shaderProgram.pointLightingColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingColor");
}



function handleLoadedTexture(texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
}



function degToRad(deg){
	return deg * Math.PI / 180;
}


//Ve
var zoom = -10;
var cubes = [];
var walls = [];
var flat = new Flat(0.0 , 0.0, -2); //Mat phang
var sphere =  new Sphere(0, 0, flat.posZ + radius);
var light = new Light(0, 0, -9.5, [0.2, 0.2, 0.2], [0.8, 0.8, 0.8]);
function drawScene(){
	text.clearRect(0,0, text.canvas.width, text.canvas.height);
	var msg = "Scores : " + score;
	text.fillText(msg, 10 , 50);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	mat4.perspective(45, canvas.width / canvas.height, 0.1, 100.0, pMatrix);
	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix, [0.0, 0.0, zoom]);
	mat4.rotate(mvMatrix, degToRad(-50), [1, 0 , 0]);
	//mat4.rotate(mvMatrix, degToRad(-50), [0, 1 , 0]);
	light.setLightUniform();

	flat.draw();

	sphere.draw();

	for (var i = 0; i < walls.length; i++)
		walls[i].draw();

	for (var i = 0; i < cubes.length; i++)
		cubes[i].draw();
}

//Khoi tao cac khoi lap phuong(vi tri so voi Flat)

function initCube(){
	var current_x = 0;
	var current_y = 0;
	var rot= 0;
	var radiusFlatRatio = 28/5;
	var radius = (FlatHeight * FlatWidth) / radiusFlatRatio;
	for (var i = 0; i < 12; i++){
		cubes.push(new Cube(flat.posX + current_x + radius*Math.cos(degToRad(rot)),flat.posY + current_y + radius*Math.sin(degToRad(rot)), flat.posZ + 2.8 * cubeSize ));
		rot += 30;
	}
}


//Khoi tao cac buc tuong

function initWalls(){
	walls.push(new Wall(flat.posX, flat.posY + flat.height + wallHeight, flat.posZ));
	walls.push(new Wall(flat.posX, flat.posY -flat.height - wallHeight, flat.posZ));
	walls.push(new Wall2(flat.posX -flat.width - wallWidth, flat.posY, flat.posZ));
	walls.push(new Wall2(flat.posX +flat.width + wallWidth, flat.posY, flat.posZ));
}



function checkForMoving(){
	for (var key in currentlyPressedKey)
		if (currentlyPressedKey[key])
			return true;
	return false;
}

var lastTime = 0;
function animate(){
	var timeNow = new Date().getTime();
	if (lastTime != 0){
		var elapsed = timeNow - lastTime;
		if (checkForMoving())
			sphere.animate(elapsed);
		for (var i = 0; i < cubes.length; i++)
			cubes[i].animate(elapsed);

	}
	lastTime = timeNow;
}



var currentlyPressedKey = {};
function handleKeyDown(event){
	currentlyPressedKey[event.keyCode] = true;

}

function handleKeyUp(event){
	currentlyPressedKey[event.keyCode] = false;

}

function intersectObject(x1, y1, x2, y2){
	var number = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
	var para1 = (radius - cubeSize) * (radius - cubeSize);
	var para2 = (radius + cubeSize) * (radius + cubeSize);
	return para1 <= number && number <= para2;
}

function colisionDetected(){
	var playerX = sphere.posX , playerY = sphere.posY;
	console.log(playerX);
	console.log(playerY);
	for (var i = 0; i < cubes.length; i++)
		if (intersectObject(playerX, playerY, cubes[i].posX, cubes[i].posY)){
			console.log("colisionDetected");
			cubes.splice(i,1);
			score++;
		}
}

function handleKeys(){
	if (currentlyPressedKey[38] == true){
		sphere.moveUp();
	}

	if (currentlyPressedKey[40] == true){
		sphere.moveDown();
	}

	if (currentlyPressedKey[37] == true){
		sphere.moveLeft();
	}

	if (currentlyPressedKey[39] == true){
		sphere.moveRight();
	}
}


function tick(){
	requestAnimFrame(tick);
	handleKeys();
	colisionDetected();
	drawScene();
	animate();
}


function WebGLload(){
	canvas = document.getElementById('canvas');
	gl = canvas.getContext('webgl');
	textCanvas = document.getElementById('text');
	text = textCanvas.getContext('2d');
	text.font = "10px Monospace";
	initViewPort();
	initShaders();
	initFlatBuffer();
	initFlatTexture();
	initCubeBuffer();
	initCubeTexture();
	initWallBuffer();
	initWall2Buffer();
	initWallTexture();
	initSphereBuffer();
	initSphereTexture();
	gl.clearColor(220/250, 220/250, 220/250, 1.0);
	gl.enable(gl.DEPTH_TEST);
	initCube();
	initWalls();
	document.onkeyup = handleKeyUp;
	document.onkeydown = handleKeyDown;
	tick();

}
window.onload= WebGLload;
