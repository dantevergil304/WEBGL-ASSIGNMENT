var sphereVertexPositionBuffer;
var sphereVertexTextureCoordBuffer;
var sphereVertexIndexBuffer;
function initSphereBuffer(){
  var latitudeBands = 30;
  var longitudeBands = 30;
  var radius = 0.2;

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

function Sphere(x, y){
  this.posX = x;
  this.posY = y;
}

Sphere.prototype.draw = function(){
  drawSphere();
}

function drawSphere() {
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
}
