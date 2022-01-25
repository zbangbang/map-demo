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
    <div class="content" ref="stageContent" id="stageContent">
    </div>
  </div>
</template>

<script>
import Konva from 'konva'
let stageContent,stageLayer;
export default {
  data() {
    return {
      btnList: [
        {
          label: "线",
          type: "line",
          bgShow: false,
        },
        {
          label: "导出",
          type: "export",
          bgShow: false,
        },
      ],

      // konva画布大小
      stageStyle: {
        width: 200,
        height: 200,
      },
    };
  },
  mounted() {
    this.stageStyle.width = this.$refs.stageContent.clientWidth - 20
    this.stageStyle.height = this.$refs.stageContent.clientHeight - 20

    stageContent = new Konva.Stage({
      container: 'stageContent',
      ...this.stageStyle
    })
    stageLayer = new Konva.Layer()
    stageContent.add(stageLayer)
    console.log(stageContent);

    const imageTest = new Image()
    imageTest.src = require('@/assets/Water_2_M_Normal.jpg')
    imageTest.onload = () => {
      let imageLayer = new Konva.Image({
        x: 0,
        y: 0,
        image: imageTest,
        ...this.stageStyle
      })

      stageLayer.add(imageLayer)
      stageLayer.batchDraw()
    }
  },
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
        case "line":
          this.drawLine();
          break;
        case "export":
          this.exportImage();
          break;

        default:
          break;
      }
    },

    // 绘制线
    drawLine() {
      let lastLine = null;
      let isDraw = false;

      stageContent.on('mousedown touchstart', e => {
        isDraw = true
        let pos = stageContent.getPointerPosition()
        lastLine = new Konva.Line({
          stroke: 'red',
          strokeWidth: 5,
          lineCap: 'round',
          lineJoin: 'round',
          points: [pos.x, pos.y]
        })
        console.log('lastLine', lastLine);
        stageLayer.add(lastLine)
        stageLayer.draw()
      })

      stageContent.on('mouseup touchend', function() {
        isDraw = false;
      });

      stageContent.on('mousemove touchmove', e => {
        if (!isDraw) {
          return
        }
        let pos = stageContent.getPointerPosition()
        let newPoints = lastLine.points().concat([pos.x, pos.y])
        lastLine.points(newPoints)
        stageLayer.batchDraw()
      })
    },

    // 导出图片
    exportImage() {
      let dataURL = stageContent.toDataURL({ pixelRatio: 3 })
      this.downloadURI(dataURL, 'stage.png')
    },
    downloadURI(url, fileName) {
      let link = document.createElement('a')
      link.download = fileName
      link.href = url
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
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
    padding: 10px;
  }
}
</style>