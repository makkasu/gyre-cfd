var brushShaderObject = {
	fragShaderCode : function(){
		return `	
			/*
			brush.js 
			 - Takes mouse input and draws a blob on a texture underneath any clicks

			Max Potter 2018/03/29
			*/		
			uniform vec2 res;
			uniform sampler2D texInput;
			uniform vec3 pos; // position of the source of ink

			const float radius = 50.0; // radius of ink blob
			const float recipradius = 1.0/50.0;

			void main(){			
				// Normalise coords & read in texture
				vec2 uv = gl_FragCoord.xy/res.xy;
				gl_FragColor = texture2D(texInput, uv);

				// If dist > radius, pixel is outside of source region => add nothing
				float dist = distance(pos.xy, gl_FragCoord.xy);

           		if (gl_FragColor.r > 0.0) gl_FragColor.r -= 0.002;//material disappears over time


				gl_FragColor.rgb += pos.z * max(radius - dist, 0.0);
				
			}
		`;
	}
}