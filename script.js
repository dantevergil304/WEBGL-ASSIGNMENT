var gl;
var canvas;


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

    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram,"uMVMatrix");
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
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

var zoom = -10;
var cubes = [];
var walls = [];
var flat = new Flat(0.0 , 0.0, cubeSize- 2.8*cubeSize);
function drawScene(){
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	mat4.perspective(45, canvas.width / canvas.height, 0.1, 100.0, pMatrix);
	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix, [0.0, 0.0, zoom]);	
	mat4.rotate(mvMatrix, degToRad(-50), [1, 0 , 0]);
	flat.draw();
	
	for (var i = 0; i < walls.length; i++)
		walls[i].draw();
	
	for (var i = 0; i < 12; i++)
		cubes[i].draw();
}

function initCube(){
	var current_x = 0;
	var current_y = 0;
	var rot= 0;
	var radiusFlatRatio = 28/5;
	var radius = (FlatHeight * FlatWidth) / radiusFlatRatio;
	for (var i = 0; i < 12; i++){
		cubes.push(new Cube(flat.posX + current_x + radius*Math.cos(degToRad(rot)),flat.posY + current_y + radius*Math.sin(degToRad(rot))));
		rot += 30;
	}
}

function initWalls(){
	walls.push(new Wall(flat.posX, flat.posY + flat.height + wallHeight, flat.posZ));
	walls.push(new Wall(flat.posX, flat.posY -flat.height - wallHeight, flat.posZ));
	walls.push(new Wall2(flat.posX -flat.width - wallWidth, flat.posY, flat.posZ));
	walls.push(new Wall2(flat.posX +flat.width + wallWidth, flat.posY, flat.posZ));
}


var lastTime = 0;

function animate(){
	var timeNow = new Date().getTime();
	if (lastTime != 0){
		var elapsed = timeNow - lastTime;
		for (var i = 0; i < 12; i++)
			cubes[i].animate(elapsed);
	}
	lastTime = timeNow;
}

function tick(){
	requestAnimFrame(tick);
	drawScene();
	animate();
}


function WebGLload(){
	canvas = document.getElementById('surface');
	gl = canvas.getContext('webgl');
	initViewPort();
	initShaders();
	initCubeBuffer();
	initCubeTexture();
	initFlatBuffer();
	initFlatTexture();
	initWallBuffer();
	initWall2Buffer();
	initWallTexture();
	gl.clearColor(220/250, 220/250, 220/250, 1.0);
	gl.enable(gl.DEPTH_TEST);
	initCube();
	initWalls();
	tick();
}