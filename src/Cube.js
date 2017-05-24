var cubeVertexBuffer;
var cubeTextureBuffer;
var cubeIndexBuffer;
var cubeNormalBuffer;
var cubeSize = 0.125;

function initCubeBuffer() {
    cubeVertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
    var verts = [-cubeSize, -cubeSize, cubeSize,
        cubeSize, -cubeSize, cubeSize,
        cubeSize, cubeSize, cubeSize, -cubeSize, cubeSize, cubeSize,

        // Back face
        -cubeSize, -cubeSize, -cubeSize, -cubeSize, cubeSize, -cubeSize,
        cubeSize, cubeSize, -cubeSize,
        cubeSize, -cubeSize, -cubeSize,

        // Top face
        -cubeSize, cubeSize, -cubeSize, -cubeSize, cubeSize, cubeSize,
        cubeSize, cubeSize, cubeSize,
        cubeSize, cubeSize, -cubeSize,

        // Bottom face
        -cubeSize, -cubeSize, -cubeSize,
        cubeSize, -cubeSize, -cubeSize,
        cubeSize, -cubeSize, cubeSize, -cubeSize, -cubeSize, cubeSize,

        // Right face
        cubeSize, -cubeSize, -cubeSize,
        cubeSize, cubeSize, -cubeSize,
        cubeSize, cubeSize, cubeSize,
        cubeSize, -cubeSize, cubeSize,

        // Left face
        -cubeSize, -cubeSize, -cubeSize, -cubeSize, -cubeSize, cubeSize, -cubeSize, cubeSize, cubeSize, -cubeSize, cubeSize, -cubeSize
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    cubeVertexBuffer.itemSize = 3;
    cubeVertexBuffer.numItems = 24;

    cubeTextureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeTextureBuffer);

    var textureCoords = [
        // Front face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,

        // Back face
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,

        // Top face
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,

        // Bottom face
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,

        // Right face
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,

        // Left face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    cubeTextureBuffer.itemSize = 2;
    cubeTextureBuffer.numItems = 24;

    cubeNormalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, cubeNormalBuffer);

		var Normals = [
			[0.0, 0.0, 1.0], 		// Front face
			[0.0, 0.0, -1.0], 	// Back face
			[0.0, 1.0, 0.0],		// Top face
			[0.0, -1.0, 0.0],		// Bottom face
			[1.0, 0.0, 0.0],		// Right face
			[-1.0, 0.0, 0.0]		// Left face
		];
		var normals = [];
		for(key in Normals){
			for(var i = 0; i < 4; i++){
				normals = normals.concat(Normals[key]);
			}
		}

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
		cubeNormalBuffer.itemSize = 3;
		cubeNormalBuffer.numItems = 24;

    cubeIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);

    var indexs = [
        0, 1, 2, 0, 2, 3, // Front face
        4, 5, 6, 4, 6, 7, // Back face
        8, 9, 10, 8, 10, 11, // Top face
        12, 13, 14, 12, 14, 15, // Bottom face
        16, 17, 18, 16, 18, 19, // Right face
        20, 21, 22, 20, 22, 23 // Left face
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexs), gl.STATIC_DRAW);
    cubeIndexBuffer.itemSize = 1;
    cubeIndexBuffer.numItems = 36;

}


var cubeTexture;

function initCubeTexture() {
    cubeTexture = gl.createTexture();
    cubeTexture.image = new Image();
    cubeTexture.image.onload = function() {
        handleLoadedTexture(cubeTexture);
    }
    cubeTexture.image.src = "./img/crateTexture.jpg";
}


//Tao vi tri cua khoi lap phuong
function Cube(x, y, z) {
    this.posX = x;
    this.posY = y;
    this.posZ = z;
    this.rotY = 0;
}


Cube.prototype.draw = function(program) {
    //mvPushMatrix();

    mat4.translate(mvMatrix, [this.posX, this.posY, this.posZ]);
    mat4.rotate(mvMatrix, degToRad(this.rotY), [0, 0, 1]);
    mat4.rotate(mvMatrix, degToRad(this.rotY), [0, 1, 0]);
    mat4.rotate(mvMatrix, degToRad(this.rotY), [1, 0, 0]);
    drawCube(program);

    //mvPopMatrix();
}

Cube.prototype.animate = function(elapsed) {
    this.rotY += (90 * elapsed) / 1000.0;
}

function drawCube(program) {
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexBuffer);
    gl.vertexAttribPointer(program.vertexPositionAttribute, cubeVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    if(program.textureCoordAttribute >= 0) {
      gl.bindBuffer(gl.ARRAY_BUFFER, cubeTextureBuffer);
      gl.vertexAttribPointer(program.textureCoordAttribute, cubeTextureBuffer.itemSize, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, cubeTexture);
      gl.uniform1i(program.samplerUniform, 1);

      gl.bindBuffer(gl.ARRAY_BUFFER, cubeNormalBuffer);
      gl.vertexAttribPointer(program.vertexNormalAttribute, cubeNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
    }
    if(program.textureCoordAttribute >= 0) {
      setUniformMatrix();
    }
    else {
      setMatrixUniformsShadow();
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
    gl.drawElements(gl.TRIANGLES, cubeIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}
