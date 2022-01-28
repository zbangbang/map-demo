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

    <!-- 图片区域 -->
    <image-scroll
      @setImgURL="getImgURL"
      @setDomClient="getDomClient"
    ></image-scroll>
  </div>
</template>

<script>
import Konva from 'konva'
import imageScroll from './imageScroll.vue';
let stageContent,stageLayer;
export default {
  components: { imageScroll },
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

      // 拖拽的图片url
      imgURL: null,
      // 移动端鼠标所在位置
      touchEndEvent: null,
    };
  },
  mounted() {
    this.stageStyle.width = this.$refs.stageContent.clientWidth
    this.stageStyle.height = this.$refs.stageContent.clientHeight

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

      console.log('------------', stageLayer);
    }

    // 开启拖拽监听
    this.openDragEvent()
  },
  watch: {
    touchEndEvent: {
      handler(newval) {
        const clientXY = {
          clientX: newval.changedTouches[0].clientX,
          clientY: newval.changedTouches[0].clientY,
        }
        const stageXY = this.$refs.stageContent.getBoundingClientRect()
        if (clientXY.clientX > stageXY.x && clientXY.clientX < stageXY.right && clientXY.clientY > stageXY.y && clientXY.clientY < stageXY.bottom) {
          console.log('绘制图片');
          stageContent.setPointersPositions(newval);

          Konva.Image.fromURL(this.imgURL, image => {
            // 计算宽高比，重新设置宽高
            let wh = image.getWidth() / image.getHeight()
            image.height(200)
            image.width(200 * wh)

            stageLayer.add(image);

            // 重新设置图片位置，图片中心点位于鼠标位置
            const pos =  stageContent.getPointerPosition()
            image.position({
              x: pos.x - wh * 100,
              y: pos.y - 100
            });
            image.draggable(true);
            // 双击图片，将图片删除
            image.addEventListener('dblclick', e => {
              imgTrans.destroy()
              image.destroy()
              console.log('-=-===-==--==-==-', stageLayer);
            })

            // 图片旋转变换
            let imgTrans = new Konva.Transformer({
              nodes: [image],
              keepRatio: true,
              enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
            });
            stageLayer.add(imgTrans);

            stageLayer.batchDraw();

            console.log('===============', stageLayer);
          });
        }
      },
      deep: true
    },
  },
  methods: {
    showImg(i) {
      this.btnList[i].bgShow = !this.btnList[i].bgShow;
      let type = this.btnList[i].type;

      switch (type) {
        case "line":
          if (this.btnList[i].bgShow) {
            this.drawLine();
          } else {
            this.cancleLine();
          }
          break;
        case "export":
          this.exportImage();
          break;

        default:
          break;
      }
    },

    cancleLine() {
      stageContent.off('mousedown touchstart')
      stageContent.off('mouseup touchend')
      stageContent.off('mousemove touchmove')
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
      link = null
    },

    // 开启画布拖拽监听
    openDragEvent() {
      const stageContainer = stageContent.container()
      stageContainer.addEventListener('dragover', e => {
        console.log('objectobject');
        e.preventDefault(); // !important
      });
      // 拖拽结束，将图片加到画布上
      stageContainer.addEventListener('drop', e => {
        e.preventDefault();
        stageContent.setPointersPositions(e);

        Konva.Image.fromURL(this.imgURL, image => {
          // 计算宽高比，重新设置宽高
          let wh = image.getWidth() / image.getHeight()
          image.height(200)
          image.width(200 * wh)

          stageLayer.add(image);

          // 重新设置图片位置，图片中心点位于鼠标位置
          const pos =  stageContent.getPointerPosition()
          image.position({
            x: pos.x - wh * 100,
            y: pos.y - 100
          });
          image.draggable(true);
          // 双击图片，将图片删除
          image.addEventListener('dblclick', e => {
            imgTrans.destroy()
            image.destroy()
            console.log('-=-===-==--==-==-', stageLayer);
          })

          // 图片旋转变换
          let imgTrans = new Konva.Transformer({
            nodes: [image],
            keepRatio: true,
            enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right']
          });
          stageLayer.add(imgTrans);

          stageLayer.batchDraw();

          console.log('===============', stageLayer);
        });
      })
    },

    // 子组件开始拖拽传递图片
    getImgURL(imgURL) {
      console.log('---------', imgURL);
      this.imgURL = imgURL
    },

    // 移动端传递鼠标最后位置
    getDomClient(e) {
      this.touchEndEvent = e
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
  padding: 10px;

  .title {
    height: 30px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    padding: 5px;

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
  }
}
</style>