var divShaderObject = {
	fragShaderCode : function(){
		return `	
			/*
			divergence.js 
			 - Calculate the divergence of the velocity field

			Max Potter 2018/09/25
			*/	
	
			uniform vec2 res;
			uniform sampler2D texInput;

			uniform float halfrdx; // 0.5/(grid spacing)

			void main(){			
				// Normalise coords & read in texture
				vec2 uv = gl_FragCoord.xy/res.xy;
				gl_FragColor = texture2D(texInput, uv);

				// 1st order finite difference approximation to divergence
	            float t = texture2D(texInput, (gl_FragCoord.xy + vec2(0.0, 1.0)) / res).y;
	            float b = texture2D(texInput, (gl_FragCoord.xy + vec2(0.0, -1.0)) / res).y;
	            float r = texture2D(texInput, (gl_FragCoord.xy + vec2(1.0, 0.0)) / res).x;
	            float l = texture2D(texInput, (gl_FragCoord.xy + vec2(-1.0, 0.0)) / res).x;
	            float div = halfrdx * (r - l + t - b);
	            
	            gl_FragColor = vec4(div, 0, 0, 0);
			}
		`;
	}
}