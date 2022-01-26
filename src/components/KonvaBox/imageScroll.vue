<template>
  <div class="img_scroll_content">
    <!-- 每个可拖拽图片 -->
    <div
      class="img_item_box"
      ref="imgItemBox"
      v-for="(item, index) in imageList"
      :key="index"
      @dragstart="dragStart($event, index)"
      @touchstart="dragStart($event, index)"
      @touchmove="touchmove"
      @touchend="touchend"
    >
      <span>{{ item.name }}</span>
      <img :src="item.imgURL" />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 图片列表
      imageList: [
        {
          name: "风场",
          imgURL: require("@/assets/images/konva/qxhd风.png"),
        },
        {
          name: "海浪",
          imgURL: require("@/assets/images/konva/qxhd浪.png"),
        },
        {
          name: "位势高度",
          imgURL: require("@/assets/images/konva/qxhd位.png"),
        },
        {
          name: "温度",
          imgURL: require("@/assets/images/konva/qxhd温.png"),
        },
        {
          name: "相对湿度",
          imgURL: require("@/assets/images/konva/qxhd相.png"),
        },
        {
          name: "FY-2H",
          imgURL: require("@/assets/images/konva/qxhd2.png"),
        },
        {
          name: "H8",
          imgURL: require("@/assets/images/konva/qxhd8.png"),
        },
      ],

      // 刚开始位置
      clientX: 0,
      clientY: 0,
    };
  },
  mounted() {},
  methods: {
    // 开始拖拽
    dragStart(e, index) {
      this.$emit("setImgURL", e.target.src);
      this.clientX = this.$refs.imgItemBox[index].getBoundingClientRect().x
      this.clientY = this.$refs.imgItemBox[index].getBoundingClientRect().y
    },
    touchmove(e) {
      const clientX = e.changedTouches[0].clientX
      const clientY = e.changedTouches[0].clientY
      console.log('======----------===========--------', this.clientX, this.clientY, clientX, clientY);
    },
    touchend(e) {
      console.log('eeeeeeeeeeee', e);
      if (e.changedTouches[0].clientY - this.clientY < -30) {
        // this.$emit('setDomClient', e.changedTouches[0].clientX, e.changedTouches[0].clientY)
        this.$emit('setDomClient', e)
      }
    }
  },
};
</script>

<style lang='less' scoped>
.img_scroll_content {
  width: calc(100% - 20px);
  // height: 150px;
  position: absolute;
  left: 0;
  bottom: 0;
  margin: 10px;
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;

  /* 设置滚动条的样式 */
  &::-webkit-scrollbar {
    height: 5px;
    background: rgba(240, 240, 240, 0.6);
    // background-color: rgba(0, 0, 0, 0.5);
  }

  /* 滚动槽 */
  &::-webkit-scrollbar-track {
    border-radius: 10px;
  }

  /* 滚动条滑块 */
  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    // background: rgba(240, 240, 240, 0.6);
    background-color: rgba(0, 0, 0, 0.5);
  }

  // 单张图片区域
  .img_item_box {
    height: 100%;
    position: relative;
    padding-right: 10px;
    float: left;

    &:last-child {
      padding-right: 0;
    }

    span {
      position: absolute;
      left: 10px;
      top: 10px;
    }

    img {
      height: 130px;
    }
  }
}
</style>