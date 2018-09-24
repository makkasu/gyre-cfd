var diffuseShaderObject = {
	fragShaderCode : function(){
		return `	
			/*
			diffuse.js 
			 - Diffuses pixel colour into neighbours by having each pixel take colour from neighbours
			 - Performs one Jacobi iteration per render to solve the viscous diffusion equation

			Max Potter 2018/03/29
			*/	
			uniform vec2 res;
			uniform sampler2D texInput;	
			uniform sampler2D b;

			const float dt = 0.016;
			const float viscosity = 0.9;
			float alpha = 1.0/(viscosity * dt);
			//float rBeta = 1.0/(4.0 + alpha); // reciprocal of beta

			vec4 jacobi(sampler2D x, sampler2D b, vec2 uv){
				float pxSizeX = 1.0/res.x; // pixel sizes in normalizes coords
				float pxSizeY = 1.0/res.y;

				alpha = alpha * pxSizeX * pxSizeX;
				float rBeta = 1.0/(4.0 + alpha);

				// - store neightbouring pixels
				vec4 right = texture2D(x, vec2(uv.x + pxSizeX, uv.y));
				vec4 left  = texture2D(x, vec2(uv.x - pxSizeX, uv.y));
				vec4 up    = texture2D(x, vec2(uv.x, uv.y + pxSizeY));
				vec4 down  = texture2D(x, vec2(uv.x, uv.y - pxSizeY));
				vec4 centre = texture2D(b, uv);

				// return jacobi iteration result
				return (right + left + up + down + alpha * centre) * rBeta;
				// return centre;
			}

			void main(){
				vec2 uv = gl_FragCoord.xy/res.xy;
				// gl_FragColor = vec4(jacobi(texInput, b, uv).xyz, 1.0);
				gl_FragColor = jacobi(texInput, b, uv);
				// gl_FragColor = vec4(1.0,0.0,0.0,1.0);
				// gl_FragColor = texture2D(texInput, uv);
			}
		`;
	}
}