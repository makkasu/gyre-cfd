var advectShaderObject = {
	fragShaderCode : function(){
		return `			
			/*
			advect.js
			 - Advection shader - computes the self-advection term of the Navier-Stokes equations
			 - Implementation based on NVIDIA GPU Gems Ch. 38 by Mark J. Harris
			 
			Max Potter 2018/03/04
			*/

			uniform vec2 res;
			uniform sampler2D texInput; // quantity advected, discretised to texture
			uniform sampler2D velocity; // velocity field through which texInput is to be advected
			uniform float time;

			uniform float dissipation;
			const float dt = 0.016;
			const float scale = 1.0; // grid scale

			// Bilinear interpolation function 
			vec2 bilerp(sampler2D field, vec2 point){ // point in pixel coords
				vec4 ldru; // left, down, right, up
				// Find nearest pixel vertex to p:
				//  - store coords of centre of bottom-left-most pixel as ldru.xy
				//  - store coords of centre of top-right-most pixel as ldru.zw
				ldru.xy = floor(point - 0.5) + 0.5;
				ldru.zw = ldru.xy + 1.0;

				vec2 s = point - ldru.xy; // separation vector from ldru.xy (bottom-left) to p 
				vec4 ldru_norm = ldru / res.xyxy; // normalise coords

				vec2 fld, frd, flu, fru;                     // Store the field at pixel
				fld = texture2D(field, ldru_norm.xy).rg; // left  & down from p
				frd = texture2D(field, ldru_norm.zy).rg; // right & down from p
				flu = texture2D(field, ldru_norm.xw).rg; // left  & up from p
				fru = texture2D(field, ldru_norm.zw).rg; // right & up from p

				return mix(mix(fld, frd, s.x), mix(flu, fru, s.x), s.y);
			}

			void main(){
				vec2 uv = gl_FragCoord.xy/res.xy;
				vec4 v = texture2D(velocity, uv);

				// Calculate previous position of particle (advect it backwards in time, see Stam 1999)
				// vec2 pos = gl_FragCoord.xy - dt * scale * vec2(0.0,50.0);
				// vec2 pos = gl_FragCoord.xy - dt * scale * 1.0/(res.x) * v.rg;
				vec2 pos = gl_FragCoord.xy - dt * scale * res.x * v.rg;
				// vec2 pos = gl_FragCoord.xy - dt * scale * v.rg;

				// Bilinearly interpolate quantities from surrounding grid cells
				vec2 bilerpOut = dissipation*bilerp(texInput, pos);

				gl_FragColor = vec4(bilerpOut.rg, 0.0, 1.0);
			} 

		`;
	}
}