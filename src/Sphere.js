var sphereVertexPositionBuffer;
var sphereVertexTextureCoordBuffer;
var sphereVertexIndexBuffer;
var radius = 0.2;
function initSphereBuffer(){
  var latitudeBands = 30;
  var longitudeBands = 30;


  var vertexPositionData = [];
  var textureCoordData = [];

  for(var latNumber = 0; latNumber <= latitudeBands; latNumber++){
    var theta = latNumber * Math.PI / latitudeBands;
    var sinTheta = Math.sin(theta);
    var cosTheta = Math.cos(theta);

    for(var longNumber = 0; longNumber <= longitudeBands; longNumber++){
      var phi = longNumber * 2 * Math.PI / longitudeBands;
      var sinPhi = Math.sin(phi);
      var cosPhi = Math.cos(phi);

      var x = cosPhi * sinTheta;
      var y = cosTheta;
      var z = sinPhi * sinTheta;
      var u = 1 - (longNumber / longitudeBands);
      var v = 1 - (latNumber / latitudeBands);

      textureCoordData.push(u);
      textureCoordData.push(v);
      vertexPositionData.push(x * radius);
      vertexPositionData.push(y * radius);
      vertexPositionData.push(z * radius);
    }
  }

  var indexData = [];
  for(var latNumber = 0; latNumber < latitudeBands; latNumber++){
    for(var longNumber = 0; longNumber < longitudeBands; longNumber++){
      var first = (latNumber * (longitudeBands + 1)) + longNumber;
      var second = first + longitudeBands + 1;

      indexData.push(first);
      indexData.push(second);
      indexData.push(first + 1);

      indexData.push(second);
      indexData.push(second + 1);
      indexData.push(first + 1);
    }
  }

  moonVertexTextureCoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexTextureCoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
  moonVertexTextureCoordBuffer.itemSize = 2;
  moonVertexTextureCoordBuffer.numItems = textureCoordData.length / 2;

  moonVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
  moonVertexPositionBuffer.itemSize = 3;
  moonVertexPositionBuffer.numItems = vertexPositionData.length / 3;

  moonVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, moonVertexIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
  moonVertexIndexBuffer.itemSize = 1;
  moonVertexIndexBuffer.numItems = indexData.length;
}

var sphereTexture;
function initSphereTexture(){
    sphereTexture = gl.createTexture();
    sphereTexture.image = new Image();
    sphereTexture.image.onload = function(){
      handleLoadedTexture(sphereTexture);
    }
    sphereTexture.image.src = "./img/sphereTexture.jpg";
}

function Sphere(x, y, z){
  this.posX = x;
  this.posY = y;
  this.posZ = z;
  this.rot = 0;
  this.speed = 0;
  this.direction = [1, 0, 0];
}

Sphere.prototype.draw = function(){
    mvPushMatrix();
    mat4.translate(mvMatrix, [this.posX, this.posY, this.posZ]);
    mat4.rotate(mvMatrix, degToRad(this.rot), this.direction);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sphereTexture);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, moonVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, moonVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, moonVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, moonVertexIndexBuffer);
    setUniformMatrix();
    gl.drawElements(gl.TRIANGLES, moonVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    mvPopMatrix();
}

var speed = 0.01;

Sphere.prototype.animate = function(elapsed){
  if (this.rot < 0){
    this.rot -= (180 * elapsed) / 1000.0;
  }
  else {
    this.rot += (180 * elapsed) / 1000.0;
  }
}

Sphere.prototype.moveLeft = function(){
  if (this.posX > -FlatWidth + radius){
    this.posX -= speed;
    if (this.rot > 0) this.rot = -this.rot;
    this.direction = [0, 1, 0];
  }
}

Sphere.prototype.moveRight = function(){
  if (this.posX < FlatWidth - radius){
    this.posX += speed;
    if (this.rot < 0) this.rot = -this.rot;
    this.direction = [0, 1, 0];
  }
}

Sphere.prototype.moveUp = function(){
  if (this.posY < FlatHeight - radius){
    this.posY += speed;
    if (this.rot > 0)
      this.rot = -this.rot;
    this.direction = [1, 0 , 0];
  }
}

Sphere.prototype.moveDown = function(){
  if (this.posY > -FlatHeight + radius){
    this.posY -= speed;
    if (this.rot < 0)
      this.rot = -this.rot;
    this.direction = [1, 0, 0];
  }
}
