
/*
main.js script
 - Sets up buffer scene and render scene for GPU fluid dynamics demonstration
 - Implementation based on NVIDIA GPU Gems Ch. 38 by Mark J. Harris

Requirements:
 - 'js/three.js' be loaded
 - 'shaders/' directory with GLSL shaders stored as js template literals
 - A browser capable of handling js template literals and OpenGL

Max Potter 2018
*/

var scene;
var camera;
var renderer;

// Basic Three.js scene setup
// - add a scene, a camera and a renderer, adjust aspect and add to document
// - this scene will contain everything we render to the screen (in our case, the 'ink' field)
function scene_setup(){
	scene = new THREE.Scene();
	camera = new THREE.OrthographicCamera(w() / -2, w() / 2, h() / 2, h() / -2, 1, 1000);
	camera.position.z = 2;
	renderer = new THREE.WebGLRenderer();
	renderer.setSize( w(), h() );
	document.body.appendChild( renderer.domElement );
}
scene_setup();

// Load the GLSL code into Buffer objects
//  - each buffer object sets up a buffer scene to render intermediate steps off-screen
//  - inside this scene is a mesh with a shader material with the code representing one slab-op (e.g. advect, diffuse, etc)
//  - the simulation is progressed by swapping out textures from this material before rendering each buffer object's scene
advectBuffer = new Buffer('advect', advectShaderObject.fragShaderCode());
advectBuffer.init();
jacobiBuffer = new Buffer('jacobi', jacobiShaderObject.fragShaderCode());
jacobiBuffer.init();
forceBuffer = new Buffer('force', forceShaderObject.fragShaderCode());
forceBuffer.init();
divBuffer = new Buffer('div', divShaderObject.fragShaderCode());
divBuffer.init();
gradBuffer = new Buffer('grad', gradShaderObject.fragShaderCode());
gradBuffer.init();
brushBuffer = new Buffer('brush', brushShaderObject.fragShaderCode());
brushBuffer.init();
postBuffer = new Buffer('post', postShaderObject.fragShaderCode());
postBuffer.init();

// Set up Fields for each fluid property we need to keep track of
//  - each field has two textures
//  - these can be swapped out during rendering to propagate the results of one slab-ob to the next
u = new Field('velocity');
div_u = new Field('div(u)');
p = new Field('pressure');
x = new Field('ink'); // x is a quantity to be advected along the velocity field u

// Set up uniforms for each shader 
//  - start off with texA for each input texture (inside render() texB is the output)
advectBuffer.material.uniforms.texInput.value = u.texA;
advectBuffer.material.uniforms.velocity = {
	type : "t",
	value : u.texA
};
advectBuffer.material.uniforms.time = {
	type : "f",
	value : 0.0
};
advectBuffer.material.uniforms.dissipation = {
	type : "f",
	value : 1.0
};

jacobiBuffer.material.uniforms.texInput.value = u.texA;
jacobiBuffer.material.uniforms.b = {
	type : "t",
	value : new THREE.WebGLRenderTarget(w(), h(), {minFilter : THREE.LinearFilter, magFilter : THREE.NearestFilter})
};
jacobiBuffer.material.uniforms.alpha = {
	type : "f",
	value : alpha1()
};
jacobiBuffer.material.uniforms.rBeta = {
	type : "f",
	value : beta1()
};
jacobiBuffer.material.uniforms.pxSize = {
	type : "v2",
	value : new THREE.Vector2(1.0/w(), 1.0/h())
};

forceBuffer.material.uniforms.texInput.value = u.texA;
forceBuffer.material.uniforms.pos = {
	type : "v3",
	value : new THREE.Vector3(0.0, 0.0, 0.0)
};
forceBuffer.material.uniforms.drag = {
	type : "v3",
	value : new THREE.Vector3(0.0, 0.0, 0.0)
};

divBuffer.material.uniforms.texInput.value = u.texA;
divBuffer.material.uniforms.halfrdx = {
	type : "f",
	value : 0.5 / w()
};

gradBuffer.material.uniforms.texInput.value = u.texA;
gradBuffer.material.uniforms.pressure = {
	type : 't',
	value : u.texA
};
gradBuffer.material.uniforms.halfrdx = {
	type : "f",
	value : 0.5 / w()
};

brushBuffer.material.uniforms.texInput.value = x.texA;
brushBuffer.material.uniforms.pos = { // pos.xy: position of ink source; pos.z: ink density
	type : "v3",
	value: new THREE.Vector3(0.0, 0.0, 0.0)
};

postBuffer.material.uniforms.texInput.value = x.texA;

// Set up the screen rendered scene
finalMaterial = new THREE.MeshBasicMaterial({map : x.texB});
plane = new THREE.PlaneBufferGeometry(w(), h());
quad = new THREE.Mesh(plane, finalMaterial);
scene.add(quad);

// Handle input events
// - mouse clicks: draw white circle on ink texture (brush.js)
// - mouse drags: encode direction and length of magnitude as a force in the velocity texture (applyforce.js)
var mouseDown = false;
var mouseCoords = [0,0];
var lastMouseCoords = [0,0];
document.onmousemove = function(event){
	// Update mouse position while keeping away from edges
	lastMouseCoords = mouseCoords;
	var padding = 10
	var newCoords = {x : event.clientX, y : event.clientY};
	if (newCoords.x < padding) newCoords.x = padding;
	if (newCoords.x > w()-padding) newCoords.x = w() - padding;
	if (newCoords.y < padding) newCoords.y = padding;
	if (newCoords.y > w()-padding) newCoords.y = h() - padding;
	mouseCoords = [newCoords.x, h()-newCoords.y];

	// Update uniforms with new position
	brushBuffer.material.uniforms.pos.value.x = mouseCoords[0];
	brushBuffer.material.uniforms.pos.value.y = mouseCoords[1]; // invert y axis to match shader coordinate scheme
	forceBuffer.material.uniforms.pos.value.x = mouseCoords[0];
	forceBuffer.material.uniforms.pos.value.y = mouseCoords[1];

	// Send drags to force shader
	forceBuffer.material.uniforms.drag.value = new THREE.Vector2(3.0*(mouseCoords[0]-lastMouseCoords[0]), 3.0*(mouseCoords[1]-lastMouseCoords[1]));
}
document.onmousedown = function(event){
	mouseDown = true;
	brushBuffer.material.uniforms.pos.value.z = 0.1; // turn on ink
	// forceBuffer.material.uniforms.pos.value.z = 1000.0;
	forceBuffer.material.uniforms.pos.value.z = 1.0;
}
document.onmouseup = function(event){
	mouseDown = false;
	brushBuffer.material.uniforms.pos.value.z = 0.0; // turn off ink
	forceBuffer.material.uniforms.pos.value.z = 0.0;
}

// Control which of the textures is being rendered: press 1 for x.texA, 2 for u.texA and 3 for u.texB
var fieldToRender = 2;
document.onkeypress = function(event){
	if (event.keyCode == 49) { 
		fieldToRender = 2;
	}
	else if (event.keyCode == 50) {
		fieldToRender = 0;
	}
	else if (event.keyCode == 51) {
		fieldToRender = 1;
	}
	else if (event.keyCode == 52) {
		fieldToRender = 3;
	}
}

console.log(alpha1(), beta1())

// Handles calls to all of the shaders needed to calculate an updated velocity texture
function updateVelocity(){
	// ---- ADVECT -------------------------------------------------------------------------------------
	advectBuffer.material.uniforms.texInput.value = u.texA;
	advectBuffer.material.uniforms.velocity.value = u.texA;
	advectBuffer.material.uniforms.dissipation.value = 1.0;
	renderer.render(advectBuffer.scene, camera, u.texB, true);	
	u.swap();

	advectBuffer.material.uniforms.time += 1;	
	advectBuffer.material.uniforms.res.value.x = w();
	advectBuffer.material.uniforms.res.value.y = h();

	// ---- DIFFUSE -------------------------------------------------------------------------------------
	// jacobiBuffer.material.uniforms.alpha.value = alpha1();
	// jacobiBuffer.material.uniforms.rBeta.value = beta1();
	// for (var i = 0; i < DIFFUSE_ITER_MAX; i++) {
	// 	jacobiBuffer.material.uniforms.texInput.value = u.texA;
	// 	jacobiBuffer.material.uniforms.b.value = u.texA;
	// 	renderer.render(jacobiBuffer.scene, camera, u.texB, true);	
	// 	u.swap();
	// }	

	// jacobiBuffer.material.uniforms.res.value.x = w();
	// jacobiBuffer.material.uniforms.res.value.y = h();
	
	// ---- APPLY FORCES -------------------------------------------------------------------------------------
	forceBuffer.material.uniforms.texInput.value = u.texA;
	renderer.render(forceBuffer.scene, camera, u.texB, true);
	u.swap();

	// ---- PROJECT -------------------------------------------------------------------------------------
	//  * ---- COMPUTE PRESSURE 	
	//     * - CALC. div(u)
	divBuffer.uniforms.texInput.value = u.texA;
	renderer.render(divBuffer.scene, camera, div_u.texA, true);

	//     * - SOLVE POISSONS FOR P
	jacobiBuffer.material.uniforms.alpha.value = alpha2();
	jacobiBuffer.material.uniforms.rBeta.value = 1.0/4.0;
	for (var i = 0; i < PRESSURE_ITER_MAX; i++) {
		jacobiBuffer.material.uniforms.texInput.value = p.texA;
		jacobiBuffer.material.uniforms.b.value = div_u.texA;
		renderer.render(jacobiBuffer.scene, camera, p.texB, true);	
		p.swap();
	}	
	
	//  * ---- SUBTRACT grad(p)
	gradBuffer.uniforms.texInput.value = u.texA;
	gradBuffer.uniforms.pressure.value = p.texA;
	renderer.render(gradBuffer.scene, camera, u.texB, true);
	u.swap();
}

// Uses updated velocity texture to correctly draw and displace any ink dropped into the fluid
function updateInk(){	
	// Render buffer scenes
	// ---- BRUSH --------------------------------------------------------------------------------------
	brushBuffer.material.uniforms.texInput.value = x.texA;
	renderer.render(brushBuffer.scene, camera, x.texB, true);	
	
	// Swap A and B textures: take output of buffer renders, set up input for next buffer renders
	x.swap();

	// Update uniforms to account for window resizing and allow for time dependent effects
	brushBuffer.material.uniforms.res.value.x = w();
	brushBuffer.material.uniforms.res.value.y = h();
	// -------------------------------------------------------------------------------------------------

	// ---- ADVECT -------------------------------------------------------------------------------------
	advectBuffer.material.uniforms.texInput.value = x.texA;
	advectBuffer.material.uniforms.velocity.value = u.texA;
	advectBuffer.material.uniforms.dissipation.value = 0.992;
	renderer.render(advectBuffer.scene, camera, x.texB, true);	
	x.swap();

	advectBuffer.material.uniforms.time += 1;	
	advectBuffer.material.uniforms.res.value.x = w();
	advectBuffer.material.uniforms.res.value.y = h();

	// ---- POST-PROCESSING ----------------------------------------------------------------------------    
	postBuffer.material.uniforms.texInput.value = x.texA;
	renderer.render(postBuffer.scene, camera, x.texB, true);	
	x.swap();

	postBuffer.material.uniforms.res.x = w();
	postBuffer.material.uniforms.res.y = h();
}

// Update and render everything!
function render() {
	requestAnimationFrame(render);

	updateVelocity();
	updateInk();

	// Render visual scene
	switch(fieldToRender){
		case 2:
			quad.material.map = x.texA;
			break;
		case 0:
			quad.material.map = u.texA;
			break;
		case 1:
			quad.material.map = u.texB;
			break;
		case 3:
			quad.material.map = x.texB;
			break;
		default:
			quad.material.map = x.texA; 
	}
	renderer.render( scene, camera );
}
render();