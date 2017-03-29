var flatVertexBuffer;
var flatTextureBuffer;
var flatIndexBuffer;
var FlatWidth = 3.0; //x
var FlatHeight = 4.0; //y

function initFlatBuffer(){
	flatVertexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, flatVertexBuffer);

	var verts = [
		-FlatWidth,  FlatHeight, 0.0,
		 FlatWidth,  FlatHeight, 0.0,
		 FlatWidth, -FlatHeight, 0.0,
		-FlatWidth, -FlatHeight, 0.0
	];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
	flatVertexBuffer.itemSize = 3;
	flatVertexBuffer.numItems = 4;


	flatTextureBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, flatTextureBuffer);

	var textureCoords = [
		0.0, 1.0,
      	1.0, 1.0,
     	1.0, 0.0,
      	0.0, 0.0,
	];

	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
	flatTextureBuffer.itemSize = 2;
	flatTextureBuffer.numItems = 4;

	flatIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, flatIndexBuffer);
	var indexs = [
		0, 1, 2, 0, 2, 3
	];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexs), gl.STATIC_DRAW);
	flatIndexBuffer.itemSize = 1;
	flatIndexBuffer.numItems = 6;



}


//Tao texture cho mat phang
var flatTexture;
function initFlatTexture(){
	flatTexture = gl.createTexture();
	flatTexture.image = new Image();
	flatTexture.image.onload = function(){
		handleLoadedTexture(flatTexture);
	}
	flatTexture.image.src = "./img/flatTexture.png";
}




//Khoi tao vi tri cua mat phang
function Flat(x, y, z){
	this.posX = x;
	this.posY = y;
	this.posZ = z;
	this.width = FlatWidth;
	this.height = FlatHeight;
}


//Ve mat phang
Flat.prototype.draw = function(){
	mvPushMatrix();
	mat4.translate(mvMatrix, [this.posX, this.posY , this.posZ]);
	gl.bindBuffer(gl.ARRAY_BUFFER, flatVertexBuffer);
	gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, flatVertexBuffer.itemSize, gl.FLOAT, false, 0 , 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, flatTextureBuffer);
	gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, flatTextureBuffer.itemSize, gl.FLOAT, false, 0, 0);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, flatTexture);
	gl.uniform1i(shaderProgram.samplerUniform, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, flatIndexBuffer);
	setUniformMatrix();
	gl.drawElements(gl.TRIANGLES, flatIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	mvPopMatrix();
}
