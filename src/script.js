
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

function setMatrixUniformsShadow() {
    gl.uniformMatrix4fv(shadowProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shadowProgram.mvMatrixUniform, false, mvMatrix);
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
	//gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    //gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram,"uMVMatrix");
  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
  shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
	shaderProgram.shadowMapUniform = gl.getUniformLocation(shaderProgram, "uShadowMap");
  shaderProgram.pMatrixFromLightUniform = gl.getUniformLocation(shaderProgram, "uPMatrixFromLight");
  shaderProgram.mvMatrixFromLightUniform = gl.getUniformLocation(shaderProgram, "uMVMatrixFromLight");
	shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
	shaderProgram.pointLightingLocationUniform = gl.getUniformLocation(shaderProgram, "uPointLightingLocation");
	shaderProgram.pointLightingColorUniform = gl.getUniformLocation(shaderProgram, "uPointLightingColor");
}

var shadowProgram;
function initShadow() {
  var fragmentShader = getShader(gl, "shadow-fs");
  var vertexShader = getShader(gl, "shadow-vs");

  shadowProgram = gl.createProgram();
  gl.attachShader(shadowProgram, vertexShader);
  gl.attachShader(shadowProgram, fragmentShader);
  gl.linkProgram(shadowProgram);

  if (!gl.getProgramParameter(shadowProgram, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
  }

  //gl.useProgram(shadowProgram);

  shadowProgram.vertexPositionAttribute = gl.getAttribLocation(shadowProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shadowProgram.vertexPositionAttribute);

  shadowProgram.pMatrixUniform = gl.getUniformLocation(shadowProgram, "uPMatrix");
  shadowProgram.mvMatrixUniform = gl.getUniformLocation(shadowProgram, "uMVMatrix");
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

function initFramebufferObject() {
  var framebuffer, texture, depthBuffer;

  // Define the error handling function
  var error = function() {
    if (framebuffer) gl.deleteFramebuffer(framebuffer);
    if (texture) gl.deleteTexture(texture);
    if (depthBuffer) gl.deleteRenderbuffer(depthBuffer);
    return null;
  }

  // Create a framebuffer object (FBO)
  framebuffer = gl.createFramebuffer();
  if (!framebuffer) {
    console.log('Failed to create frame buffer object');
    return error();
  }

  // Create a texture object and set its size and parameters
  texture = gl.createTexture(); // Create a texture object
  if (!texture) {
    console.log('Failed to create texture object');
    return error();
  }
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  // Create a renderbuffer object and Set its size and parameters
  depthBuffer = gl.createRenderbuffer(); // Create a renderbuffer object
  if (!depthBuffer) {
    console.log('Failed to create renderbuffer object');
    return error();
  }
  gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);

  // Attach the texture and the renderbuffer object to the FBO
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);

  // Check if FBO is configured correctly
  var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
  if (gl.FRAMEBUFFER_COMPLETE !== e) {
    console.log('Frame buffer object is incomplete: ' + e.toString());
    return error();
  }

  framebuffer.texture = texture; // keep the required object

  // Unbind the buffer object
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);

  return framebuffer;
}

//Ve
var zoom = -10;
var cubes = [];
var walls = [];
var flat = new Flat(0.0 , 0.0, -2); //Mat phang
var sphere =  new Sphere(0, 0, flat.posZ + radius);
var light;
var xangle = 70;
var yangle = 0;
<<<<<<< HEAD
=======

>>>>>>> origin/master
var pMatrix_all = mat4.create();
var mvMatrix_sphere = mat4.create();
var mvMatrix_flat = mat4.create();
var mvMatrix_wall = [];
var mvMatrix_cube = [];
var OFFSCREEN_WIDTH = 2048, OFFSCREEN_HEIGHT = 2048;
var LIGHT_X = -10, LIGHT_Y = -10, LIGHT_Z = 11.0;
function initmvMatrix() {
	for(var i=0; i<12; i++) {
		mvMatrix_cube.push(mat4.create());
	}
	for(var i=0; i<4; i++) {
		mvMatrix_wall.push(mat4.create());
	}
}
function drawScene(){
	// Shadow Program;
	gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
	gl.viewport(0, 0, OFFSCREEN_WIDTH, OFFSCREEN_HEIGHT);
	//gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.useProgram(shadowProgram);

	mat4.perspective(70, OFFSCREEN_WIDTH / OFFSCREEN_HEIGHT, 0.1, 100.0, pMatrix);
	//mat4.perspective(45, canvas.width / canvas.height, 0.1, 100.0, pMatrix);
	mat4.set(pMatrix, pMatrix_all);
	mat4.lookAt([LIGHT_X, LIGHT_Y, LIGHT_Z], [0, 0, 0], [0, 1, 0], mvMatrix);

	mvPushMatrix();
	mat4.translate(mvMatrix, [sphere.posX, sphere.posY, 0]);
	sphere.draw(shadowProgram);
	mat4.set(mvMatrix, mvMatrix_sphere);
	mvPopMatrix();

	mvPushMatrix();
	flat.draw(shadowProgram);
	mat4.set(mvMatrix, mvMatrix_flat);
	mvPopMatrix();

	for (var i = 0; i < walls.length; i++) {
		mvPushMatrix();
		walls[i].draw(shadowProgram);
		mat4.set(mvMatrix, mvMatrix_wall[i]);
		mvPopMatrix();
	}

	for (var i = 0; i < cubes.length; i++) {
		mvPushMatrix();
		cubes[i].draw(shadowProgram);
		mat4.set(mvMatrix, mvMatrix_cube[i]);
		mvPopMatrix();
	}
<<<<<<< HEAD
	var textPosX = 650;
	var textPosY = 30;
=======

>>>>>>> origin/master
	// Normal Program
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	text.clearRect(0,0, text.canvas.width, text.canvas.height);
	var msg = "Scores : " + score;
<<<<<<< HEAD
	if (score == 12){
		msg = "You have win the game press F5 to restart";
		text.font = "32px Monospace";
		textPosX = 300;
		textCanvas.style.top = "300px";
	}
	text.fillText(msg, textPosX , textPosY);
=======
	text.fillText(msg, 10 , 50);
>>>>>>> origin/master
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.useProgram(shaderProgram);

	gl.uniform1i(shaderProgram.shadowMapUniform, 0);
	gl.uniformMatrix4fv(shaderProgram.pMatrixFromLightUniform, false, pMatrix_all);

	mat4.perspective(45, canvas.width / canvas.height, 0.1, 100.0, pMatrix);
	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix, [0, 0, zoom]);
	mat4.rotate(mvMatrix, degToRad(-xangle), [1, 0 , 0]);
	mat4.rotate(mvMatrix, degToRad(-yangle), [0, 0 , 1]);

	//draw object
	mvPushMatrix();
	gl.uniformMatrix4fv(shaderProgram.mvMatrixFromLightUniform, false, mvMatrix_sphere);
	sphere.draw(shaderProgram);
	mvPopMatrix();
	mat4.translate(mvMatrix, [-sphere.posX,-sphere.posY, 0]);

	// move light point using mvMatrix;
	var oldLightPos = [LIGHT_X, LIGHT_Y, LIGHT_Z, 1];
	var newLightPos = [0, 0, 0, 0];
	newLightPos[0] = mvMatrix[0] * oldLightPos[0] + mvMatrix[4] * oldLightPos[1] + mvMatrix[8] * oldLightPos[2] + mvMatrix[12] * oldLightPos[3];
	newLightPos[1] = mvMatrix[1] * oldLightPos[0] + mvMatrix[5] * oldLightPos[1] + mvMatrix[9] * oldLightPos[2] + mvMatrix[13] * oldLightPos[3];
	newLightPos[2] = mvMatrix[2] * oldLightPos[0] + mvMatrix[6] * oldLightPos[1] + mvMatrix[10] * oldLightPos[2]+ mvMatrix[14] * oldLightPos[3];
	light = new Light(newLightPos[0], newLightPos[1], newLightPos[2], [0.2, 0.2, 0.2], [0.8, 0.8, 0.8]);
	light.setLightUniform();

	mvPushMatrix();
	gl.uniformMatrix4fv(shaderProgram.mvMatrixFromLightUniform, false, mvMatrix_flat);
	flat.draw(shaderProgram);
	mvPopMatrix();

	for (var i = 0; i < walls.length; i++) {
		mvPushMatrix();
		gl.uniformMatrix4fv(shaderProgram.mvMatrixFromLightUniform, false, mvMatrix_wall[i]);
		walls[i].draw(shaderProgram);
		mvPopMatrix();
	}

	for (var i = 0; i < cubes.length; i++) {
		mvPushMatrix();
		gl.uniformMatrix4fv(shaderProgram.mvMatrixFromLightUniform, false, mvMatrix_cube[i]);
		cubes[i].draw(shaderProgram);
		mvPopMatrix();
	}
}

//Khoi tao cac khoi lap phuong(vi tri so voi Flat)
function initCube(){
	var current_x = 0;
	var current_y = 0;
	var rot= 0;
	var radius = 4;
	for (var i = 0; i < 12; i++){
		cubes.push(new Cube(flat.posX + current_x + radius*Math.cos(degToRad(rot)),flat.posY + current_y + radius*Math.sin(degToRad(rot)), flat.posZ + 2.8 * cubeSize ));
		rot += 30;
	}
}

//Khoi tao cac buc tuong
function initWalls(){
	walls.push(new Wall(flat.posX, flat.posY + flat.height + wallHeight, flat.posZ + wallSize ));
	walls.push(new Wall(flat.posX, flat.posY -flat.height - wallHeight, flat.posZ + wallSize));
	walls.push(new Wall2(flat.posX -flat.width - wallWidth, flat.posY, flat.posZ + wallSize));
	walls.push(new Wall2(flat.posX +flat.width + wallWidth, flat.posY, flat.posZ + wallSize));
}



function checkForMoving(){
		if (currentlyPressedKey[37] || currentlyPressedKey[40] || currentlyPressedKey[38] || currentlyPressedKey[39])
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
	var number =	 (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
	var para1 = (radius - cubeSize) * (radius - cubeSize);
	var para2 = (radius + cubeSize) * (radius + cubeSize);
	return para1 <= number && number <= para2;
}

function colisionDetected(){
	var playerX = sphere.posX , playerY = sphere.posY;
	for (var i = 0; i < cubes.length; i++)
		if (intersectObject(playerX, playerY, cubes[i].posX, cubes[i].posY)){
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

	if (currentlyPressedKey[16] == true){
		speed = 0.03;
		rotateSpeed = 1080;
	}

	else if (currentlyPressedKey[16] == false){
		speed = 0.01;
		rotateSpeed = 360;
	}

	if (currentlyPressedKey[87] == true){
		xangle += 1.0;
	}

    if (currentlyPressedKey[83] == true){
		xangle -= 1.0;
	}

	if (currentlyPressedKey[65] == true){
		yangle += 0.5;
	}
	if (currentlyPressedKey[68] == true){
		yangle -= 0.5;
	}

}



function tick(){
	requestAnimFrame(tick);
	handleKeys();
	colisionDetected();
	drawScene();
	animate();
}

var fbo;
<<<<<<< HEAD
var text;
var gl;
var canvas;
var score = 0;
var textCanvas;
=======
>>>>>>> origin/master
function WebGLload(){
	canvas = document.getElementById('canvas');
	gl = canvas.getContext('webgl');
	textCanvas = document.getElementById('text');
	text = textCanvas.getContext('2d');
	text.font = "14px Monospace";
	text.fillStyle = "yellow";
	initViewPort();
	initShaders();
	initShadow();
	initFlatBuffer();
	initFlatTexture();
	initCubeBuffer();
	initCubeTexture();
	initWallBuffer();
	initWall2Buffer();
	initWallTexture();
	initSphereBuffer();
	initSphereTexture();

	fbo = initFramebufferObject();
	if(!fbo) {
		console.log('Failed to initialize frame buffer object');
		return;
	}
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, fbo.texture);

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	initCube();
	initWalls();
	initmvMatrix();
	document.onkeyup = handleKeyUp;
	document.onkeydown = handleKeyDown;
	tick();

}
window.onload= WebGLload;
