function Light(x, y, z, ambientColor, pointLightingColor){
  this.posX = x;
  this.posY = y;
  this.posZ = z;
  this.AMColor = ambientColor;
  this.PLColor = pointLightingColor;
}
Light.prototype.setLightUniform = function(){
  gl.uniform3f(shaderProgram.ambientColorUniform, this.AMColor[0], this.AMColor[1], this.AMColor[2]);
  gl.uniform3f(shaderProgram.pointLightingLocationUniform, this.posX, this.posY, this.posZ);
  gl.uniform3f(shaderProgram.pointLightingColorUniform, this.PLColor[0], this.PLColor[1], this.PLColor[2]);
}
