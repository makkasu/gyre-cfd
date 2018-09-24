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

			// Mouse drag start pos., normalised distance components and magnitude
			uniform vec3 pos;
			uniform vec3 drag; // x = dx, y = dy, z = mag

			const float dt = 0.016;
			const float rr = 1.0/50.0; // reciprocal of radius
			// const float scale = 1000.0;

			void main(){		
				// vec4 F = drag.z * vec4(drag.x, drag.y, 0.0, 1.0);
				// vec2 pos1 = vec2(500, 500);
				// float dist = distance(pos1.xy, gl_FragCoord.xy);
				// vec4 c = F * dt  * exp( pow(dist, 2.0) * rr );
				// c.a = 1.0;

				// c = vec4(1.0, 1.0, 0.0, 1.0)*exp(pow(dist, 2.0) * rr);

				// gl_FragColor.rg += max(50.0 - dist, 0.0);
				// gl_FragColor = c; // force is now coded into velocity texture as .r = Fx ; .b = Fy
				// gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);


// BRUSH ------------------------------------------------------
				// Normalise coords & read in texture
				vec2 uv = gl_FragCoord.xy/res.xy;
				gl_FragColor = texture2D(texInput, uv);

				// If dist > radius, pixel is outside of source region => add nothing
				float dist = distance(pos.xy, gl_FragCoord.xy);
				// gl_FragColor.rgb += pos.z * max(50.0 - dist, 0.0);
// /BRUSH ------------------------------------------------------

				gl_FragColor += pos.z * vec4(1.0, 0.0, 0.0, 1.0) * max(50.0 - dist, 0.0);

			}

		`;
	}
}