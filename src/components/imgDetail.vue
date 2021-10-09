<template>
  <div class="img_content">
    <div class="title">
      <div
        :class="{ btn: true, bg: item.bgShow }"
        v-for="(item, index) in btnList"
        :key="index"
        @click.stop="showImg(index)"
      >
        {{ item.label }}
      </div>
    </div>
    <ul class="content">
      <li v-for="(item, index) in imgList" :key="index">
        <img :src="item.img" />
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      btnList: [
        {
          label: "原图",
          type: "normal",
          bgShow: false,
        },
        {
          label: "锐化",
          type: "r",
          bgShow: false,
        },
        {
          label: "直方图均衡化",
          type: "z",
          bgShow: false,
        },
        {
          label: "模糊",
          type: "fuzzy",
          bgShow: false,
        },
      ],
      imgList: [],

      normalImg: require("@/assets/images/get_image.jpg"),
    };
  },
  mounted() {},
  methods: {
    showImg(i) {
      this.btnList[i].bgShow = !this.btnList[i].bgShow;

      if (!this.btnList[i].bgShow) {
        let index = this.imgList.findIndex(
          (item) => item.type == this.btnList[i].type
        );
        index != -1 ? this.imgList.splice(index, 1) : null;
        return;
      }

      let type = this.btnList[i].type;

      switch (type) {
        case "normal":
          this.nImage();
          break;
        case "r":
          this.rImage();
          break;
        case "z":
          this.zImage();
          break;
        case "fuzzy":
          this.fuzzyImage();
          break;

        default:
          break;
      }
    },

    nImage() {
      this.imgList.push({
        type: "normal",
        img: require("@/assets/images/get_image.jpg"),
      });
    },

    rImage() {
      let myCanvas = (myCanvas = document.createElement("canvas"));
      let ctx = myCanvas.getContext("2d");
      let image = new Image();
      image.src = this.normalImg;
      image.onload = () => {
        myCanvas.width = image.width;
        myCanvas.height = image.height;
        ctx.drawImage(image, 0, 0, image.width, image.height);

        let imageData = ctx.getImageData(0, 0, myCanvas.width, myCanvas.height);

        // 拉普拉斯算子，锐化
        let canvasData = this.ConvolutionMatrix(
          imageData,
          [0, -1, 0, -1, 5, -1, 0, -1, 0],
          1,
          0
        );
        // 浮雕
        // let canvasData = this.ConvolutionMatrix(imageData, [-2, -1, 0, -1, 1, 1, 0, 1, 2], 1, 0)
        // 边缘检测
        // let canvasData = this.ConvolutionMatrix(imageData, [0, 1, 0, 1, -4, 1, 0, 0, 0], 1, 0)
        ctx.putImageData(canvasData, 0, 0);

        this.imgList.push({
          type: "r",
          img: myCanvas.toDataURL(),
        });
      };

      // ctx.drawImage(this.normalImg, )
    },
    ConvolutionMatrix(input, m, divisor, offset) {
      let output = document
        .createElement("canvas")
        .getContext("2d")
        .createImageData(input);
      let w = input.width,
        h = input.height;
      let iD = input.data,
        oD = output.data;
      // 对除了边缘的点之外的内部点的 RGB 进行操作，透明度在最后都设为 255
      for (let y = 1; y < h - 1; y += 1) {
        for (let x = 1; x < w - 1; x += 1) {
          for (let c = 0; c < 3; c += 1) {
            let i = (y * w + x) * 4 + c;
            oD[i] =
              offset +
              (m[0] * iD[i - w * 4 - 4] +
                m[1] * iD[i - w * 4] +
                m[2] * iD[i - w * 4 + 4] +
                m[3] * iD[i - 4] +
                m[4] * iD[i] +
                m[5] * iD[i + 4] +
                m[6] * iD[i + w * 4 - 4] +
                m[7] * iD[i + w * 4] +
                m[8] * iD[i + w * 4 + 4]) /
                divisor;
            // console.log('=============', oD[i]);
          }
          oD[(y * w + x) * 4 + 3] = 255; // 设置透明度为不透明
        }
      }
      return output;
    },

    zImage() {
      console.log("直方图均衡化");
      let myCanvas = (myCanvas = document.createElement("canvas"));
      let ctx = myCanvas.getContext("2d");
      let image = new Image();
      image.src = this.normalImg;
      image.onload = () => {
        myCanvas.width = image.width;
        myCanvas.height = image.height;
        ctx.drawImage(image, 0, 0, image.width, image.height);

        let imageData = ctx.getImageData(0, 0, myCanvas.width, myCanvas.height);

        // 直方图均衡化
        let canvasData = this.histogramEqualization(imageData);
        ctx.putImageData(canvasData, 0, 0);

        this.imgList.push({
          type: "z",
          img: myCanvas.toDataURL(),
        });
      };
    },
    // 直方图均衡化算法  https://blog.csdn.net/qq_15971883/article/details/88699218
    histogramEqualization(imageData) {
      let N = imageData.data.length / 4;
      let arr = [];

      // 根据算法，将r通道数据 统计成直方图形式
      for (let i = 0; i < imageData.data.length; i += 4) {
        let index = arr.findIndex((item) => imageData.data[i] == item.value);
        if (index == -1) {
          arr.push({
            value: imageData.data[i],
            num: 1
          });
        } else {
          arr[index].num++;
        }
      }

      // 按照灰度数据排序
      arr.sort((a, b) => {
        return a.value - b.value
      })

      // let st = []
      // let sk = []
      let temp = 0
      let length = arr.length - 1
      // 根据算法计算出 均衡化之后的像素值trueValue
      arr.forEach(item => {
        // st.push(item.num / N)
        temp += item.num / N
        // sk.push(temp)
        item.trueValue = Math.round(temp * length)
      })

      // 修改原图的像素数据
      for(let i = 0; i < imageData.data.length; i+=4) {
        let index = arr.findIndex(t => t.value == imageData.data[i])
        imageData.data[i] = arr[index].trueValue
        imageData.data[i + 1] = arr[index].trueValue
        imageData.data[i + 2] = arr[index].trueValue
      }

      return imageData
    },

    // 模糊处理
    fuzzyImage() {
      let myCanvas = (myCanvas = document.createElement("canvas"));
      let ctx = myCanvas.getContext("2d");
      let image = new Image();
      image.src = this.normalImg;
      image.onload = () => {
        myCanvas.width = image.width;
        myCanvas.height = image.height;
        ctx.drawImage(image, 0, 0, image.width, image.height);

        let imageData = ctx.getImageData(0, 0, myCanvas.width, myCanvas.height);

        let canvasData = this.ConvolutionMatrix(
          imageData,
          [1, 1, 1, 1, 1, 1, 1, 1, 1],
          9,
          0
        );
        ctx.putImageData(canvasData, 0, 0);

        this.imgList.push({
          type: "fuzzy",
          img: myCanvas.toDataURL(),
        });
      };
    },
  },
};
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