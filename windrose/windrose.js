"use strict";

var canvas;
var gl;

//var numVertices;

var program;

var index = 0;

var positionsArray = [];
var normalsArray = [];

var near = 0.1;
var far = 10.0;
var radius = 2.2;
var theta = 0.0;
var phi = 0.0;
var dr = 5.0 * Math.PI/180.0;

var fovy = 70.0;
var aspect;

var modelViewMatrix, projectionMatrix;
var modelViewMatrixLoc, projectionMatrixLoc;
var modelMatrix, modelMatrixLoc;
var cameraPosition, cameraPositionLoc;
var eye;
var eyeLoc;
var nMatrix, nMatrixLoc;

const at = vec3(0.0, 0.0, 1.0);
const up = vec3(0.0, 1.0, 0.0);

var c;

var flag = true;
var change = false;

var pointsArray = [];
var colorsArray = [];

// Rotations
var rotationSign = 1.0;

var rotationMatrix = mat4();
var translationMatrix = mat4();
var scalingMatrix = mat4();
var lookAtMatrix = mat4();
var lookAtMatrixLoc;
var scaling = 0.4;
var dx = 0.0;
var dy = 0.0;
var dz = 0.0;
var theta_rot = [0.0, 20.0, 0.0];

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 2;


var vertices = [
    vec4( 0.0,  0.0,  0.75,  1.0), //O center of the octagon - pos. z-axis
    vec4(-0.5,  1.0,  0.25, 1.0), //A
    vec4(-1.0,  0.5,  0.25, 1.0), //B
    vec4(-1.0, -0.5,  0.25, 1.0), //C
    vec4(-0.5, -1.0,  0.25, 1.0), //D
    vec4( 0.5, -1.0,  0.25, 1.0), //E
    vec4( 1.0, -0.5,  0.25, 1.0), //F
    vec4( 1.0,  0.5,  0.25, 1.0), //G
    vec4( 0.5,  1.0,  0.25, 1.0), //H
    vec4( 0.0,  0.0,  0.0,  1.0), //O'center of the octagon - neg. z-axis
    vec4(-0.5,  1.0, -0.25, 1.0), //A'
    vec4(-1.0,  0.5, -0.25, 1.0), //B'
    vec4(-1.0, -0.5, -0.25, 1.0), //C'
    vec4(-0.5, -1.0, -0.25, 1.0), //D'
    vec4( 0.5, -1.0, -0.25, 1.0), //E'
    vec4( 1.0, -0.5, -0.25, 1.0), //F'
    vec4( 1.0,  0.5, -0.25, 1.0), //G'
    vec4( 0.5,  1.0, -0.25, 1.0)  //H'
];

var pyramid_vertices = [
    vec4(-2.0,  2.0,  0.0,  1.0), //PA
    vec4(-3.0,  0.0,  0.0,  1.0), //PB
    vec4(-2.0, -2.0,  0.0,  1.0), //PC
    vec4( 0.0, -3.0,  0.0,  1.0), //PD
    vec4( 2.0, -2.2,  0.0,  1.0), //PE
    vec4( 3.0,  0.0,  0.0,  1.0), //PF
    vec4( 2.0,  2.0,  0.0,  1.0), //PG
    vec4( 0.0,  3.0,  0.0,  1.0)  //PH
];


// Global Ambient light:
var globalAmbient = vec4(0.2, 0.2, 0.2, 1.0);
var globalAmbientProductLoc;
// Directional light:
var lightDirection = vec4(1.0, 1.0, 1.0, 1.0);
var lightAmbient = vec4(0.7, 0.7, 0.7, 1.0);
var lightDiffuse = vec4(0.9, 0.9, 0.9, 1.0);
var lightSpecular = vec4(0.8, 0.8, 0.8, 1.0);

var materialAmbient = vec4(0.3, 0.7, 0.9, 1.0);
var materialDiffuse = vec4(0.3, 0.7, 0.9, 1.0);
var materialSpecular = vec4(0.3, 0.8, 0.9, 1.0); //actaully unused in the chosen shading model
var materialShininess = 200.0;

var ctm;
var ambientColor, diffuseColor, specularColor;

var vertexColors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 ),  // white
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];

// Spotlight:
var spotlightDirection = vec4(0.0, 0.0, -1.0, 1.0);
var spotlightPosition = vec4(0.0, 0.0, 3.0, 1.0);
var spotlightAmbientIntensity = vec4(0.2, 0.2, 0.2, 1.0);
var spotlightSpecularIntensity = vec4(0.4, 0.4, 0.4, 1.0); //unused in the chosen shading model
var spotlightDiffuseIntensity = vec4(0.5, 0.5, 0.5, 1.0);
var spotlightCutoff = 10.0;
var spotlightAngle = 20.0;

var spotlightDirectionLoc;
var spotlightPositionLoc;
var spotlightAmbientProductLoc;
var spotlightSpecularProductLoc; ////unused in the chosen shading model
var spotlightDiffuseProductLoc;
var spotlightCutoffLoc;
var spotlightAngleLoc;

// Default values
var attConstant = 1.0;
var attLinear = 0.0;
var attQuad = 0.0;

// spotlight On/Off:

var spotlight = true;

//Texture:
var texture;
var texSize = 256;
var texCoordsArray = [];
var texCoord = [
    vec2(0, 0),
    vec2(1, 0),
    vec2(0, 1)];
var text = true;

function configureTexture(image) {
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB,
        gl.RGB, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,
                      gl.NEAREST_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.uniform1i(gl.getUniformLocation(program, "uTexMap"), 0);
}

   
   

//define the normals fer each triangle
function triangle(a, b, c) {

     var t1 = subtract(b, a);
     var t2 = subtract(c, a);
     var normal = normalize(cross(t2, t1));
     normal = vec4(normal[0], normal[1], normal[2], 1.0);

     normalsArray.push(normal);
     normalsArray.push(normal);
     normalsArray.push(normal);


     positionsArray.push(a);
     texCoordsArray.push(texCoord[0]);
     
     positionsArray.push(b);
     texCoordsArray.push(texCoord[1]);
     
     positionsArray.push(c);
     texCoordsArray.push(texCoord[2]);

     index += 3;
}

function octagon(o, a, b, c, d, e, f, g, h) {

     triangle(a, o, b);
     triangle(b, o, c);
     triangle(c, o, d);
     triangle(d, o, e);
     triangle(e, o, f);
     triangle(f, o, g);
     triangle(o, h, g);
     triangle(h, o, a)
}

function pyramid(p, a, b, c, d) {

     triangle(p, a, b);
     triangle(c, p, b);
     triangle(p, d, c);
     triangle(p, a, d);
     triangle(a, b, c);
     triangle(a, c, d)
}     

window.onload = function init() {

    canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available" );

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    aspect = canvas.width/canvas.height;

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var globalAmbientProduct = mult(globalAmbient, materialAmbient);
    
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);
    
    var spotlightAmbientProduct = mult(materialAmbient, spotlightAmbientIntensity);
    var spotlightSpecularProduct = mult(materialSpecular, spotlightSpecularIntensity);
    var spotlightDiffuseProduct = mult(materialDiffuse, spotlightDiffuseIntensity);
   
    
    
    
    octagon(vertices[0], vertices[1], vertices[2], vertices[3], vertices[4], vertices[5], vertices[6], vertices[7], vertices[8]);
    
    octagon(vertices[17], vertices[16], vertices[15], vertices[14], vertices[13], vertices[12], vertices[11], vertices[10], vertices[9]);
  
    pyramid(pyramid_vertices[0], vertices[1], vertices[2], vertices[10], vertices[11]);
    pyramid(pyramid_vertices[1], vertices[2], vertices[3], vertices[11], vertices[12]);
    pyramid(pyramid_vertices[2], vertices[3], vertices[4], vertices[12], vertices[13]);
    pyramid(pyramid_vertices[3], vertices[4], vertices[5], vertices[13], vertices[14]);
    pyramid(pyramid_vertices[4], vertices[5], vertices[6], vertices[14], vertices[15]);
    pyramid(pyramid_vertices[5], vertices[6], vertices[7], vertices[15], vertices[16]);
    pyramid(pyramid_vertices[6], vertices[7], vertices[8], vertices[16], vertices[17]);
    pyramid(pyramid_vertices[7], vertices[8], vertices[1], vertices[17], vertices[10]);

    var nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);

    var normalLoc = gl.getAttribLocation(program, "aNormal");
    gl.vertexAttribPointer(normalLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray( normalLoc);

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation( program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);
    
    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);
    
    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    modelMatrixLoc = gl.getUniformLocation(program, "uModelMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");
    nMatrixLoc = gl.getUniformLocation(program, "uNormalMatrix");
    
// Global ambient light parameters location:
    globalAmbientProductLoc = gl.getUniformLocation(program, "globalAmbientProduct");
// Directional light paramaters location:
    gl.uniform4fv( gl.getUniformLocation(program,
       "uAmbientProduct"),flatten(ambientProduct));
    gl.uniform4fv( gl.getUniformLocation(program,
       "uDiffuseProduct"),flatten(diffuseProduct));
    gl.uniform4fv( gl.getUniformLocation(program,
       "uSpecularProduct"),flatten(specularProduct));
    gl.uniform4fv( gl.getUniformLocation(program,
       "uLightDirection"),flatten(lightDirection));
    gl.uniform1f( gl.getUniformLocation(program,
       "uShininess"),materialShininess);
// Camera Position:  
    lookAtMatrixLoc = gl.getUniformLocation(program, "lookAtMatrix");     
	  cameraPositionLoc = gl.getUniformLocation(program, "cameraPosition");
// Spotlight parameters location:
	  spotlightDirectionLoc = gl.getUniformLocation(program, "spotlightDirection");
	  spotlightPositionLoc = gl.getUniformLocation(program, "spotlightPosition");
	  spotlightAmbientProductLoc = gl.getUniformLocation(program, "spotlightAmbientProduct");
	  spotlightSpecularProductLoc =  gl.getUniformLocation(program, "spotlightSpecularProduct");
	  spotlightDiffuseProductLoc =  gl.getUniformLocation(program, "spotlightDiffuseProduct");
	  spotlightCutoffLoc =  gl.getUniformLocation(program, "spotlightCutoff");
	  spotlightAngleLoc = gl.getUniformLocation(program, "spotlightAngle");
	  
	  gl.uniform4fv(globalAmbientProductLoc, flatten(globalAmbientProduct));
	  
	  gl.uniform4fv(spotlightDirectionLoc, flatten(spotlightDirection));
	  gl.uniform4fv(spotlightPositionLoc, flatten(spotlightPosition));
	  gl.uniform4fv(spotlightAmbientProductLoc, flatten(spotlightAmbientProduct));
	  gl.uniform4fv(spotlightSpecularProductLoc, flatten(spotlightSpecularProduct));
	  gl.uniform4fv(spotlightDiffuseProductLoc, flatten(spotlightDiffuseProduct));
	  gl.uniform1f(spotlightCutoffLoc, spotlightCutoff);
	  gl.uniform1f(spotlightAngleLoc, spotlightAngle);
	 
	     
    // Initialize 
    translationMatrix = translate(dx, dy, dz);
    rotationMatrix = mult(rotationMatrix, rotateX(theta_rot[0]));
    rotationMatrix = mult(rotationMatrix, rotateY(theta_rot[1]));
    rotationMatrix = mult(rotationMatrix, rotateZ(theta_rot[2]));
    scalingMatrix = scale(scaling, scaling, scaling);
    
    // Initialize a texture
    
    var image = document.getElementById("TEXTURE");

    configureTexture(image);

    //thetaLoc = gl.getUniformLocation(program, "uTheta");
    
    render();
       
}

var render = function() {
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));
            
    lookAtMatrix = lookAt(eye, at , up);
    modelViewMatrix = mult(lookAtMatrix, mult(translationMatrix, mult(rotationMatrix, scalingMatrix)));
    modelMatrix = mult(translationMatrix, mult(rotationMatrix, scalingMatrix));
    projectionMatrix = perspective(fovy, aspect, near, far);
    nMatrix = normalMatrix(modelMatrix, true);
    //nMatrix = normalMatrix(modelViewMatrix, true);
    
    document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
    document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
    document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
    document.getElementById("ButtonT").onclick = function(){
        flag = !flag;
        var string;
        if (flag) string = "Stop rotation";
        else string = "Restart rotation";
        document.getElementById("ButtonT").innerHTML = string;
    };
    document.getElementById("invertRotationButton").onclick = function(){rotationSign = -rotationSign;};
    
     if(flag) {
        theta_rot[axis] = rotationSign * 1.0;
        if (axis == xAxis) rotationMatrix = mult(rotationMatrix, rotateX(theta_rot[axis]));
        if (axis == yAxis) rotationMatrix = mult(rotationMatrix, rotateY(theta_rot[axis]));
        if (axis == zAxis) rotationMatrix = mult(rotationMatrix, rotateZ(theta_rot[axis]));
    }

    if (change || flag) {
        modelViewMatrix = mult(lookAtMatrix, mult(translationMatrix, mult(rotationMatrix, scalingMatrix)));
        
    }
    
    document.getElementById("TextureButton").onclick = function() {
        text = !text;
    }
    
    document.getElementById("spotlightOnOff").onclick = function() {
        spotlight = !spotlight;
   }
   
   document.getElementById("scalingSlider").oninput = function(event) {
        scaling = parseFloat(event.target.value);
        scalingMatrix = scale(scaling, scaling, scaling);
        change = true;
    };
    document.getElementById("xTranslationSlider").oninput = function(event) {
        dx = parseFloat(event.target.value);
        translationMatrix = translate(dx, dy, dz);
        change = true;
    };
    document.getElementById("yTranslationSlider").oninput = function(event) {
        dy = parseFloat(event.target.value);
        translationMatrix = translate(dx, dy, dz);
        change = true;
    };
    document.getElementById("zTranslationSlider").oninput = function(event) {
        dz = parseFloat(event.target.value);
        translationMatrix = translate(dx, dy, dz);
        change = true;
    };
    document.getElementById("farSlider").oninput = function(event) {
        far = parseFloat(event.target.value);
        projectionMatrix = perspective(fovy, aspect, near, far);
    };
    document.getElementById("nearSlider").oninput = function(event) {
        near = parseFloat(event.target.value);
        projectionMatrix = perspective(fovy, aspect, near, far);
        
    };
    
    document.getElementById("spotlightXSlider").oninput = function(event) {spotlightPosition[0] = parseFloat(event.target.value);};
    document.getElementById("spotlightYSlider").oninput = function(event) {spotlightPosition[1] = parseFloat(event.target.value);};
    document.getElementById("spotlightZSlider").oninput = function(event) {spotlightPosition[2] = parseFloat(event.target.value);};
    document.getElementById("thetaEyeSlider").oninput = function(event) {
        theta = radians(parseFloat(event.target.value));
        eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));
        lookAtMatrix = lookAt(eye, at , up);
        change = true;
    };
    document.getElementById("phiEyeSlider").oninput = function(event) {
        phi = radians(parseFloat(event.target.value));
        eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));
        lookAtMatrix = lookAt(eye, at , up);
        change = true;
    };
    
    document.getElementById("attConstant").onchange = function(event) {
      attConstant = parseFloat(event.target.value);
      change = true;
  };
   
   document.getElementById("attLinear").onchange = function(event) {
      attLinear = parseFloat(event.target.value);
      change = true;
  };
  
  document.getElementById("attQuad").onchange = function(event) {
      attQuad = parseFloat(event.target.value);
      change = true;
  };

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(modelMatrixLoc, false, flatten(modelMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.uniformMatrix3fv(nMatrixLoc, false, flatten(nMatrix)  );
    gl.uniform1i( gl.getUniformLocation(program, "text"),text);
    gl.uniformMatrix4fv(lookAtMatrixLoc, false, flatten(lookAtMatrix));
    gl.uniform3fv(cameraPositionLoc, eye);
    gl.uniform1i( gl.getUniformLocation(program, "spotlight"), spotlight);
     
	  gl.uniform1f(gl.getUniformLocation(program,"attConstant"), attConstant);
    gl.uniform1f(gl.getUniformLocation(program,"attLinear"), attLinear);
    gl.uniform1f(gl.getUniformLocation(program,"attQuad"), attQuad);
   
    gl.uniform4fv(gl.getUniformLocation(program, "spotlightPosition"), flatten(spotlightPosition));
    
     for( var i=0; i<index; i+=3)
        gl.drawArrays(gl.TRIANGLES, i, 3);
    
    requestAnimationFrame(render);
}
