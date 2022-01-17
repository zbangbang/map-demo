<template>
  <div class="img_content">
    <div class="title">
      <div
        :class="{ btn: true, bg: item.bgShow }"
        v-for="(item, index) in btnList"
        :key="index"
        @click.stop="showImg(item)"
      >
        {{ item.label }}
      </div>
    </div>
    <div class="content">
      <canvas id="webgl" width="500" height="500" style="background-color: #981a00"></canvas>
    </div>
  </div>
</template>

<script>
import {PointShader, RectangleShader, RotationShader, LineShader, TextureShader} from '@/utils/glsl/first.js';
let canvas, gl;
export default {
  data() {
    return {
      btnList: [{
        label: '清除',
        type: 'clear',
        bgShow: false,
      }, {
        label: '点',
        type: 'point',
        bgShow: false,
      }, {
        label: '线',
        type: 'line',
        bgShow: false,
      }, {
        label: '矩形',
        type: 'rectangle',
        bgShow: false,
      }, {
        label: '三角形',
        type: 'triangle',
        bgShow: false,
      }, {
        label: '线立方体',
        type: 'rotation',
        bgShow: false,
      }, {
        label: '实体立方体',
        type: 'entity',
        bgShow: false,
      }, {
        label: '索引着色',
        type: 'element',
        bgShow: false,
      }, {
        label: '材质',
        type: 'texture',
        bgShow: false,
      }],

      timer: null,
    }
  },
  mounted() {
    canvas = document.getElementById('webgl')
    gl = canvas.getContext('webgl')
  },
  methods: {
    showImg(item) {
      this.btnList.forEach(btn => {
        btn.bgShow = false
      })
      item.bgShow = !item.bgShow;

      switch (item.type) {
        case 'clear':
          this.clearAll()
          break;
        case 'point':
          this.drawPoint()
          break;
        case 'line':
          this.drawLine()
          break;
        case 'rectangle':
          this.drawRectangle()
          break;
        case 'triangle':
          this.drawTriangle()
          break;
        case 'rotation':
          this.drawRotation()
          break;
        case 'entity':
          this.drawEntity()
          break;
        case 'element':
          this.drawElementRotation()
          break;
        case 'texture':
          this.drawTexture()
          break;
      
        default:
          break;
      }
    },

    clearAll() {
      cancelAnimationFrame(this.timer)

      gl.clearColor(0.0, 0.0, 1.0, 1.0)
      gl.clear(gl.COLOR_BUFFER_BIT)
    },

    // 绘制点
    drawPoint() {
      let program = this.initShader(gl, PointShader.vertexShaderSource, PointShader.fragmentShaderSource);

      //开始绘制，显示器显示结果
      gl.drawArrays(gl.POINTS, 0, 1);
    },

    // 初始化shader
    initShader(gl, vertexShaderSource, fragmentShaderSource) {
      //创建顶点着色器对象
      let vertexShader = gl.createShader(gl.VERTEX_SHADER)
      //创建片元着色器对象
      let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

      //引入顶点、片元着色器源代码
      gl.shaderSource(vertexShader, vertexShaderSource)
      gl.shaderSource(fragmentShader, fragmentShaderSource)

      //编译顶点、片元着色器
      gl.compileShader(vertexShader);
      gl.compileShader(fragmentShader);

      //创建程序对象program
      let program = gl.createProgram();
      //附着顶点着色器和片元着色器到program
      gl.attachShader(program,vertexShader);
      gl.attachShader(program,fragmentShader);
      //链接program
      gl.linkProgram(program);
      //使用program
      gl.useProgram(program);

      return program
    },

    drawLine() {
      let program = this.initShader(gl, LineShader.vertexShaderSource, LineShader.fragmentShaderSource)

      let apos = gl.getAttribLocation(program, 'apos')
      let a_color = gl.getAttribLocation(program, 'a_color')

      let colorData = new Float32Array([
        1, 0, 0, 0, 1, 0
      ])
      let colorBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, colorData, gl.STATIC_DRAW)
      gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(a_color)

      let data = new Float32Array([
        0.5, 0.5, 0.5, -0.5
      ])
      let buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
      gl.vertexAttribPointer(apos, 2, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(apos)

      gl.drawArrays(gl.LINES, 0, 2)
    },

    // 矩形
    drawRectangle() {
      let program = this.initShader(gl, RectangleShader.vertexShaderSource, RectangleShader.fragmentShaderSource);

      let aposLocation = gl.getAttribLocation(program, 'apos')

      let data = new Float32Array([0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5])
      
      let buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
      gl.vertexAttribPointer(aposLocation, 2, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(aposLocation)

      gl.drawArrays(gl.LINE_LOOP, 0, 4)
    },

    // 三角形
    drawTriangle() {
      let program = this.initShader(gl, RectangleShader.vertexShaderSource, RectangleShader.fragmentShaderSource);

      let aposLocation = gl.getAttribLocation(program, 'apos')
      let a_color = gl.getAttribLocation(program, 'a_color')

      // let colorData = new Float32Array([
      //   0, 0, 1, 1, 0, 0, 0, 1, 0
      // ])
      // let colorBuffer = gl.createBuffer()
      // gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
      // gl.bufferData(gl.ARRAY_BUFFER, colorData, gl.STATIC_DRAW)
      // gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 0, 0)
      // gl.enableVertexAttribArray(a_color)

      // let data=new Float32Array([
      //   0.0, 0.0, 1.0,  //三角形顶点1坐标
      //   0.0, 1.0, 0.0,  //三角形顶点2坐标
      //   1.0, 0.0, 0.0   //三角形顶点3坐标
      // ]);
      // let buffer = gl.createBuffer()
      // gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      // gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
      // gl.vertexAttribPointer(aposLocation, 3, gl.FLOAT, false, 0, 0)
      // gl.enableVertexAttribArray(aposLocation)

      // gl.drawArrays(gl.TRIANGLES, 0, 3)

      let colorData = new Float32Array([
        1,0,0,1,0,0,1,0,0,//三个红色点
        0,1,0,0,1,0,0,1,0//三个蓝色点
      ])
      let colorBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, colorData, gl.STATIC_DRAW)
      gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(a_color)

      let data=new Float32Array([
        -0.5,0.5,0.5,0.5,0.5,-0.5,//第一个三角形的三个点
        -0.5,0.5,0.5,-0.5,-0.5,-0.5//第二个三角形的三个点
      ]);
      let buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
      gl.vertexAttribPointer(aposLocation, 2, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(aposLocation)

      gl.drawArrays(gl.TRIANGLES, 0, 6)
    },

    // 立方体
    drawRotation() {
      let program = this.initShader(gl, RotationShader.vertexShaderSource, RotationShader.fragmentShaderSource);

      let aposLocation = gl.getAttribLocation(program, 'apos')

      // 立方体
      let data=new Float32Array([
        0.5, 0.5, 0.5,
        -0.5, 0.5, 0.5,
        -0.5, -0.5, 0.5,
        0.5, -0.5, 0.5,

        0.5, 0.5, -0.5,
        -0.5, 0.5, -0.5,
        -0.5, -0.5, -0.5,
        0.5, -0.5, -0.5,

        0.5, 0.5, 0.5,
        0.5, 0.5, -0.5,

        -0.5, 0.5, 0.5,
        -0.5, 0.5, -0.5,

        -0.5, -0.5, 0.5,
        -0.5, -0.5, -0.5,

        0.5, -0.5, 0.5,
        0.5, -0.5, -0.5,
      ]);
      let buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
      gl.vertexAttribPointer(aposLocation, 3, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(aposLocation)

      gl.drawArrays(gl.LINE_LOOP, 0, 4)
      gl.drawArrays(gl.LINE_LOOP, 4, 4)
      gl.drawArrays(gl.LINES, 8, 8)
      // gl.drawArrays(gl.TRIANGLES, 0, 4)
    },

    // 实体立方体
    drawEntity() {
      let program = this.initShader(gl, RotationShader.vertexShaderSource, RotationShader.fragmentShaderSource);

      let aposLocation = gl.getAttribLocation(program, 'apos')
      let a_color = gl.getAttribLocation(program, 'a_color')
      let my = gl.getUniformLocation(program, 'my')

      let colorData = new Float32Array([
        1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0,//红色——面1
        .9,0,0, .9,0,0, .9,0,0, .9,0,0, .9,0,0, .9,0,0,//红色——面2
        .8,0,0, .8,0,0, .8,0,0, .8,0,0, .8,0,0, .8,0,0,//红色——面3
        1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0,//红色——面4
        1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0,//红色——面5
        1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,0,0,//红色——面6
        // 0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0, 0,1,0,//绿色——面2
        // 0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1, 0,0,1,//蓝色——面3
        // 1,1,0, 1,1,0, 1,1,0, 1,1,0, 1,1,0, 1,1,0,//黄色——面4
        // 0,0,0, 0,0,0, 0,0,0, 0,0,0, 0,0,0, 0,0,0,//黑色——面5
        // 1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1, 1,1,1 //白色——面6
      ])
      let colorBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, colorData, gl.STATIC_DRAW)
      gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(a_color)

      let data=new Float32Array([
        .5,.5,.5,-.5,.5,.5,-.5,-.5,.5,.5,.5,.5,-.5,-.5,.5,.5,-.5,.5,      //面1
        .5,.5,.5,.5,-.5,.5,.5,-.5,-.5,.5,.5,.5,.5,-.5,-.5,.5,.5,-.5,      //面2
        .5,.5,.5,.5,.5,-.5,-.5,.5,-.5,.5,.5,.5,-.5,.5,-.5,-.5,.5,.5,      //面3
        -.5,.5,.5,-.5,.5,-.5,-.5,-.5,-.5,-.5,.5,.5,-.5,-.5,-.5,-.5,-.5,.5,//面4
        -.5,-.5,-.5,.5,-.5,-.5,.5,-.5,.5,-.5,-.5,-.5,.5,-.5,.5,-.5,-.5,.5,//面5
        .5,-.5,-.5,-.5,-.5,-.5,-.5,.5,-.5,.5,-.5,-.5,-.5,.5,-.5,.5,.5,-.5 //面6
      ]);
      let buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
      gl.vertexAttribPointer(aposLocation, 3, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(aposLocation)

      gl.enable(gl.DEPTH_TEST);

      // gl.drawArrays(gl.TRIANGLES, 0, 36)

      let angle = Math.PI/4;//起始角度
      let draw = () => {
        // gl.clear(gl.COLOR_BUFFER_BIT);//清空画布上一帧图像
        /**
         * 立方体绕y轴旋转
         ***/
        angle += 0.01;//每次渲染角度递增，每次渲染不同的角度
        let sin = Math.sin(angle);//旋转角度正弦值
        let cos = Math.cos(angle);//旋转角度余弦值
        let myArr = new Float32Array([cos,0,-sin,0,  0,1,0,0,  sin,0,cos,0,  0,0,0,1]);
        gl.uniformMatrix4fv(my, false, myArr);
        this.timer = requestAnimationFrame(draw);
        /**执行绘制命令**/
        gl.drawArrays(gl.TRIANGLES,0,36);
      }
      draw()
    },

    drawElementRotation() {
      let program = this.initShader(gl, RotationShader.vertexShaderSource, RotationShader.fragmentShaderSource);

      let aposLocation = gl.getAttribLocation(program, 'apos')

      // 立方体
      let data=new Float32Array([
        0.5, 0.5, 0.5,
        -0.5, 0.5, 0.5,
        -0.5, -0.5, 0.5,
        0.5, -0.5, 0.5,

        0.5, 0.5, -0.5,
        -0.5, 0.5, -0.5,
        -0.5, -0.5, -0.5,
        0.5, -0.5, -0.5,
      ]);

      let indexs = new Uint8Array([
        0, 1, 2, 3,
        4, 5, 6, 7,

        0, 4,
        1, 5,
        2, 6,
        3, 7
      ])
      let buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
      gl.vertexAttribPointer(aposLocation, 3, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(aposLocation)

      let indexsBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexsBuffer)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexs, gl.STATIC_DRAW)

      gl.drawElements(gl.LINE_LOOP, 4, gl.UNSIGNED_BYTE, 0)
      gl.drawElements(gl.LINE_LOOP, 4, gl.UNSIGNED_BYTE, 4)
      gl.drawElements(gl.LINES, 8, gl.UNSIGNED_BYTE, 8)
    },

    // 材质
    drawTexture() {
      let program = this.initShader(gl, TextureShader.vertexShaderSource, TextureShader.fragmentShaderSource);

      let a_Position = gl.getAttribLocation(program,'a_Position');
      let a_TexCoord = gl.getAttribLocation(program,'a_TexCoord');
      let u_Sampler = gl.getUniformLocation(program,'u_Sampler');

      let data=new Float32Array([
        -0.5, 0.5,//左上角——v0
        -0.5,-0.5,//左下角——v1
        0.5,  0.5,//右上角——v2
        0.5, -0.5 //右下角——v3
      ]);

      let textureData = new Float32Array([
        0,1,//左上角——uv0
        0,0,//左下角——uv1
        1,1,//右上角——uv2
        1,0 //右下角——uv3
      ]);

      let buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
      gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(a_Position)

      let textureBuffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer)
      gl.bufferData(gl.ARRAY_BUFFER, textureData, gl.STATIC_DRAW)
      gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(a_TexCoord)

      let texture = gl.createTexture();
      let image = new Image();
      image.src = require('@/assets/Water_2_M_Normal.jpg');
      image.onload = () => {
        this.loadTexture(gl, 4, texture, u_Sampler, image)
      }
    },

    loadTexture(gl, n, texture, u_Sampler, image) {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); //纹理图片上下反转
      gl.activeTexture(gl.TEXTURE0);//激活0号纹理单元TEXTURE0
      gl.bindTexture(gl.TEXTURE_2D, texture);//绑定纹理缓冲区
      //设置纹理贴图填充方式(纹理贴图像素尺寸大于顶点绘制区域像素尺寸)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      //设置纹理贴图填充方式(纹理贴图像素尺寸小于顶点绘制区域像素尺寸)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      //设置纹素格式，jpg格式对应gl.RGB
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
      gl.uniform1i(u_Sampler, 0);//纹理缓冲区单元TEXTURE0中的颜色数据传入片元着色器
      // 进行绘制
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
    },
  }
}
</script>

<style lang='less' scoped>
ul,
li {
  list-style: none;
}
.img_content {
  width: 70%;
  height: 70%;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  // border: 1px solid;
  background: #fff;
  z-index: 999;
  display: flex;
  flex-flow: column nowrap;

  .title {
    height: 30px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 15px;

    li {
      margin-right: 5px;
    }

    .btn {
      padding: 5px 10px;
      margin-right: 10px;
      border: 1px solid #ccc;
    }

    .bg {
      background: #981a00;
      color: #fff;
    }
  }

  .content {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
    height: 570px;
    overflow-y: scroll;

    img {
      width: 500px;
    }
  }
}
</style>