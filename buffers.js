/*
buffers.js
 - Contains class definitions:
   - individual buffer scenes for rendering shader passes
   - field class to store the two textures necessary for shader effect propagation
 - Intended use is to create a buffer for each shader program and a field for each variable needed for Navier-Stokes
   - One for the velocity, one for the pressure and one for some quantity to be advected i.e. ink.

Max Potter 2018/03/28
*/

function Buffer(name, shaderCode){
	/* Class definition for Buffers
		- Each buffer is a container for a slab operation
		- When rendered, each buffer scene runs its own shader code on whichever texture is currently set in this.uniforms.texInput
	*/
	this.name = name;
	this.shaderCode = shaderCode;

	this.init = function(){
		// Set up buffer scene & textures to swap in and out
		this.scene = new THREE.Scene();

		// Set up shader uniforms including a temporary textureve
		this.tex = new THREE.WebGLRenderTarget(w(), h(), {minFilter : THREE.LinearFilter, magFilter : THREE.NearestFilter});
		this.uniforms = {
			res : {type:'v2', value:new THREE.Vector2(w(),h())},
			texInput : {type: 't', value : this.tex}
		};

		// Create material containing the shader and uniforms supplied to this object
		this.material = new THREE.ShaderMaterial({
			uniforms : this.uniforms,
			fragmentShader : this.shaderCode
		});

		// Apply the shader material to a mesh object and add to buffer scene for off-screen rendering
		this.plane = new THREE.PlaneBufferGeometry(w(), h());
		this.mesh = new THREE.Mesh(this.plane, this.material);
		this.scene.add(this.mesh);
	};
}

function Field(name){
	/* Class definition for Fields
		- Fields are vectors or scalars to be computed 
		- The quantity that the field represents is stored as a texture i.e. discretised onto a grid of texels
		- Two textures are used to achieve result propagation through successive shader computations
	*/
	this.name = name;
	this.texA = new THREE.WebGLRenderTarget(w(), h(), {minFilter : THREE.LinearFilter, magFilter : THREE.NearestFilter, type : THREE.HalfFloatType});
	this.texB = new THREE.WebGLRenderTarget(w(), h(), {minFilter : THREE.LinearFilter, magFilter : THREE.NearestFilter, type : THREE.HalfFloatType});

	this.swap = function(){
		var temp = this.texA;
		this.texA = this.texB;
		this.texB = temp;
	}
};