const PointShader = {
  uniforms: {
    
  },
  vertexShaderSource: `
    void main(){
      gl_PointSize=50.0;
      gl_Position =vec4(0.0,0.0,0.0,1.0);
    }
  `,
  fragmentShaderSource: `
    void main(){
      gl_FragColor = vec4(1.0,0.0,0.0,1.0);
    }
  `
};

const LineShader = {
  uniforms: {
    
  },
  vertexShaderSource: `
    attribute vec4 apos;
    attribute vec4 a_color;
    varying vec4 v_color;
    void main(){
      gl_Position =apos;
      v_color = a_color;
    }
  `,
  fragmentShaderSource: `
    precision lowp float;
    varying vec4 v_color;
    void main(){
      gl_FragColor = v_color;
    }
  `
};

// 矩形三角形
const RectangleShader = {
  uniforms: {
    
  },
  vertexShaderSource: `
    attribute vec4 apos;
    attribute vec4 a_color;
    varying vec4 v_color;
    void main(){
      mat4 m4 = mat4(1,0,0,0, 0,1,0,0, 0,0,1,0, -0.4,0,0,1);
      gl_Position = m4*apos;
      v_color = a_color;
    }
  `,
  fragmentShaderSource: `
    precision lowp float;
    varying vec4 v_color;
    void main(){
      gl_FragColor = v_color;
    }
  `
};

// 立方体
const RotationShader = {
  uniforms: {
    
  },
  vertexShaderSource: `
    attribute vec4 apos;
    attribute vec4 a_color;
    varying vec4 v_color;
    uniform mat4 my;
    void main(){
      float radian = radians(30.0);
      float cos = cos(radian);
      float sin = sin(radian);
      mat4 mx = mat4(1,0,0,0, 0,cos,-sin,0, 0,sin,cos,0, 0,0,0,1);
      // mat4 my = mat4(cos,0,-sin,0, 0,1,0,0, sin,0,cos,0, 0,0,0,1);
      gl_Position = mx*my*apos;
      v_color = a_color;
    }
  `,
  fragmentShaderSource: `
    precision lowp float;
    varying vec4 v_color;
    void main(){
      gl_FragColor = v_color;
    }
  `
};


// 纹理
const TextureShader = {
  uniforms: {
    
  },
  vertexShaderSource: `
    attribute vec4 a_Position;
    attribute vec2 a_TexCoord;
    varying vec2 v_TexCoord;
    void main(){
      gl_Position = a_Position;
      v_TexCoord = a_TexCoord;
    }
  `,
  fragmentShaderSource: `
    precision highp float;
    varying vec2 v_TexCoord;
    uniform sampler2D u_Sampler;
    void main(){
      gl_FragColor = texture2D(u_Sampler, v_TexCoord);
    }
  `
};

export { PointShader, RectangleShader, RotationShader, LineShader, TextureShader }