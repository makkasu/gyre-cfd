var postShaderObject = {
	fragShaderCode : function(){
		return `	
			/*
			post.js 
			 - Applies post-processing effects to the ink.
			 - Currently all it does is make sure the ink is white on a black background!

			Max Potter 2018/03/29
			*/		
			uniform vec2 res;
			uniform sampler2D texInput;

			void main(){			
				// Normalise coords & read in texture
				vec2 uv = gl_FragCoord.xy/res.xy;
				gl_FragColor = vec4(texture2D(texInput, uv).rrr, 1.0);
				// gl_FragColor = vec4(1.0,0.0,0.0,1.0);
			}
		`;
	}
}