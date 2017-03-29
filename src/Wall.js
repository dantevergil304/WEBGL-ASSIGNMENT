var wallVertexBuffer;
var wallTextureBuffer;
var wallIndexBuffer;



var wallHeight = 0.1; //y
var wallSize = 0.75; //z
var wallWidth = 0.1; //x


//Buffer cho buc tuong nam nang
function initWallBuffer(){

  wallVertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, wallVertexBuffer);

	var verts =  [
	  //Font face
	    -FlatWidth, -wallHeight,  wallSize,
       FlatWidth, -wallHeight,  wallSize,
       FlatWidth,  wallHeight,  wallSize,
      -FlatWidth,  wallHeight,  wallSize,

      // Back face
      -FlatWidth,  wallHeight,  wallSize,
      -FlatWidth,  wallHeight, -wallSize,
       FlatWidth,  wallHeight, -wallSize,
       FlatWidth, -wallHeight, -wallSize,

      // Top face
      -FlatWidth,  wallHeight, -wallSize,
      -FlatWidth,  wallHeight,  wallSize,
       FlatWidth,  wallHeight,  wallSize,
       FlatWidth,  wallHeight, -wallSize,

      // Bottom face
      -FlatWidth, -wallHeight, -wallSize,
       FlatWidth, -wallHeight, -wallSize,
       FlatWidth, -wallHeight,  wallSize,
      -FlatWidth, -wallHeight,  wallSize,

      // Right face
       FlatWidth, -wallHeight, -wallSize,
       FlatWidth,  wallHeight, -wallSize,
       FlatWidth,  wallHeight,  wallSize,
       FlatWidth, -wallHeight,  wallSize,

      // Left face
      -FlatWidth, -wallHeight, -wallSize,
      -FlatWidth, -wallHeight,  wallSize,
      -FlatWidth,  wallHeight,  wallSize,
      -FlatWidth,  wallHeight, -wallSize,
    ];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
	wallVertexBuffer.itemSize = 3;
	wallVertexBuffer.numItems = 24;

	wallTextureBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, wallTextureBuffer);

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
    wallTextureBuffer.itemSize = 2;
    wallTextureBuffer.numItems = 24;

    wallIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wallIndexBuffer);

     var indexs = [
      0, 1, 2,      0, 2, 3,    // Front face
      4, 5, 6,      4, 6, 7,    // Back face
      8, 9, 10,     8, 10, 11,  // Top face
      12, 13, 14,   12, 14, 15, // Bottom face
      16, 17, 18,   16, 18, 19, // Right face
      20, 21, 22,   20, 22, 23  // Left face
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexs), gl.STATIC_DRAW);
    wallIndexBuffer.itemSize = 1;
    wallIndexBuffer.numItems = 36;
}

//Tao vi tri cua buc tuong nam nang
function Wall(x, y, z){
	this.posX = x;
	this.posY = y;
  this.posZ = z;
  this.width = wallWidth;
  this.height = wallHeight;
  this.size = wallSize;
}

//Tao texture cho buc tuong
var wallTexture;
function initWallTexture(){
  wallTexture = gl.createTexture();
  wallTexture.image = new Image();
  wallTexture.image.onload = function(){
    handleLoadedTexture(wallTexture);
  }
  wallTexture.image.src="./img/woodTexture.jpg";
}


Wall.prototype.draw = function(){
	mvPushMatrix();

	mat4.translate(mvMatrix, [this.posX, this.posY, this.posZ]);
	gl.bindBuffer(gl.ARRAY_BUFFER, wallVertexBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, wallVertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, wallTextureBuffer);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, wallTextureBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, wallTexture);
	gl.uniform1i(shaderProgram.samplerUniform, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wallIndexBuffer);
	setUniformMatrix();
	gl.drawElements(gl.TRIANGLES, wallIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0)

	mvPopMatrix();
}


//Buffer cho buc tuong nam doc
var wall2VertexBuffer;
function initWall2Buffer(){
  wall2VertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, wall2VertexBuffer);
  var verts =  [
    //Font face
      -wallWidth, -FlatHeight - 2*wallHeight,  wallSize,
       wallWidth, -FlatHeight - 2*wallHeight,  wallSize,
       wallWidth,  FlatHeight + 2*wallHeight,  wallSize,
      -wallWidth,  FlatHeight + 2*wallHeight,  wallSize,

      // Back face
      -wallWidth,  FlatHeight + 2*wallHeight,  wallSize,
      -wallWidth,  FlatHeight + 2*wallHeight, -wallSize,
       wallWidth,  FlatHeight + 2*wallHeight, -wallSize,
       wallWidth, -FlatHeight - 2*wallHeight, -wallSize,

      // Top face
      -wallWidth,  FlatHeight + 2*wallHeight, -wallSize,
      -wallWidth,  FlatHeight + 2*wallHeight,  wallSize,
       wallWidth,  FlatHeight + 2*wallHeight,  wallSize,
       wallWidth,  FlatHeight + 2*wallHeight, -wallSize,

      // Bottom face
      -wallWidth, -FlatHeight - 2*wallHeight, -wallSize,
       wallWidth, -FlatHeight - 2*wallHeight, -wallSize,
       wallWidth, -wallHeight - 2*wallHeight,  wallSize,
      -wallWidth, -wallHeight - 2*wallHeight,  wallSize,

      // Right face
       wallWidth, -FlatHeight - 2*wallHeight, -wallSize,
       wallWidth,  FlatHeight + 2*wallHeight, -wallSize,
       wallWidth,  FlatHeight + 2*wallHeight,  wallSize,
       wallWidth, -FlatHeight - 2*wallHeight,  wallSize,

      // Left face
      -wallWidth, -FlatHeight - 2*wallHeight, -wallSize,
      -wallWidth, -FlatHeight - 2*wallHeight,  wallSize,
      -wallWidth,  FlatHeight + 2*wallHeight,  wallSize,
      -wallWidth,  FlatHeight + 2*wallHeight, -wallSize,
    ];

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
  wall2VertexBuffer.itemSize = 3;
  wall2VertexBuffer.numItems = 24;
}

function Wall2(x, y, z){
  Wall.call(this, x, y, z);
}

Wall2.prototype = Object.create(Wall.prototype);

Wall2.prototype.draw = function (){
  mvPushMatrix();

  mat4.translate(mvMatrix, [this.posX, this.posY, this.posZ]);
  gl.bindBuffer(gl.ARRAY_BUFFER, wall2VertexBuffer);
  gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, wall2VertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, wallTextureBuffer);
  gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, wallTextureBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, wallTexture);
  gl.uniform1i(shaderProgram.samplerUniform, 0);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, wallIndexBuffer);
  setUniformMatrix();
  gl.drawElements(gl.TRIANGLES, wallIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0)

  mvPopMatrix();
}
