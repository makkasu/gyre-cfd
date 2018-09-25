var gradShaderObject = {
	fragShaderCode : function(){
		return `	
			/*
			gradSubtraction.js 
			 - Completes the projection step: final velocity = intermediate velocity - pressure gradient
			 - Through Helmholtz-Hodge decomposition, we can recover a divergence-free vector field from a divergent field and a scalar gradient
			 - Here, we subtract the pressure gradient from the intermediate (divergent) velocity field to satisfy the incompressible condition in the Navier-Stokes equation

			Max Potter 2018/09/25
			*/	
	
			uniform vec2 res;
			uniform sampler2D texInput; //velocity
			uniform sampler2D pressure;

			uniform float halfrdx; // 0.5/(grid spacing)

			void main(){			
				// Normalise coords & read in texture
				vec2 uv = gl_FragCoord.xy/res.xy;
				vec2 w = texture2D(texInput, uv).xy; // w : intermediate velocity

				// Calc. pressure gradient
	            float t = texture2D(pressure, (gl_FragCoord.xy + vec2(0.0, 1.0)) / res).y;
	            float b = texture2D(pressure, (gl_FragCoord.xy + vec2(0.0, -1.0)) / res).y;
	            float r = texture2D(pressure, (gl_FragCoord.xy + vec2(1.0, 0.0)) / res).x;
	            float l = texture2D(pressure, (gl_FragCoord.xy + vec2(-1.0, 0.0)) / res).x;
	            float div = halfrdx * (r - l + t - b);
	            
	            // u = w - grad(p) 
	            gl_FragColor = vec4(w - halfrdx*vec2(r - l, t - b), 0, 0);
			}
		`;
	}
}