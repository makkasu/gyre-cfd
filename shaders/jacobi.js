var jacobiShaderObject = {
	fragShaderCode : function(){
		return `	
			/*
			jacobi.js 
	         - Performs one jacobi iteration to solve poissons eqn
	         - Used for calculating viscous diffusion term in Navier Stokes and velocity divergence

			Max Potter 2018/09/25
			*/	
			uniform vec2 res;
			uniform sampler2D texInput;	
			uniform sampler2D b;

			uniform float alpha;
			uniform float rBeta;
			uniform vec2 pxSize;

			vec4 jacobi(sampler2D x, sampler2D b, vec2 uv){
				// - store neightbouring pixels
				vec4 right = texture2D(x, vec2(uv.x + pxSize.x, uv.y));
				vec4 left  = texture2D(x, vec2(uv.x - pxSize.x, uv.y));
				vec4 up    = texture2D(x, vec2(uv.x, uv.y + pxSize.y));
				vec4 down  = texture2D(x, vec2(uv.x, uv.y - pxSize.y));
				vec4 centre = texture2D(b, uv);

				// return jacobi iteration result
				return (right + left + up + down + alpha * centre) * rBeta;
				// return centre;
			}

			void main(){
				vec2 uv = gl_FragCoord.xy/res.xy;
				gl_FragColor = jacobi(texInput, b, uv);
			}
		`;
	}
}