var forceShaderObject = {
	fragShaderCode : function(){
		return `	
			/*
			applyforce.js 
			 - Converts mouse drags into force application events
			 - The distance and direction of the drag determine the magitude and direction of the force

			Max Potter 2018/04/09
			*/	
	
			uniform vec2 res;
			uniform sampler2D texInput;
			uniform vec3 pos; // position of the source of ink
			uniform vec3 drag; // x : dx, y : dy, z : magnitude

			const float rr = 1.0/50.0; // reciprocal of radius of ink blob
			const float dt = 0.016;
			const float radius = 50.0;

			void main(){			
				// Normalise coords & read in texture
				vec2 uv = gl_FragCoord.xy/res.xy;
				gl_FragColor = texture2D(texInput, uv);

				vec2 c = pos.z * drag.xy * dt * exp(- (pow(gl_FragCoord.x - pos.x, 2.0) + pow(gl_FragCoord.y - pos.y, 2.0)) * rr *rr *0.5 );

				// // If dist > radius, pixel is outside of source region => add nothing
				float dist = distance(pos.xy, gl_FragCoord.xy);

				// // Just update red channel - applies a force to the right under any click
				// gl_FragColor.g += pos.z * max(radius - dist, 0.0);

				gl_FragColor += vec4(c, 0.0, 0.0);

			}
		`;
	}
}