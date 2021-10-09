<template>
  <div id="app">
    <div class="btn">
      <div class="params_btn btn_div">
        <div :class="{light: true, active: lightShow}" @click="addLightHouse">灯塔</div>
        <div :class="{water: true, active: waterShow}" @click="addWaterDepth">水深</div>
        <div :class="{font: true, active: fontShow}" @click="addFont">文字</div>
        <div :class="{font: true, active: allShow}" @click="addAll">白天</div>
      </div>
      <div class="base_btn btn_div">
        <div :class="{water: true, active: baseShow}" @click="addBaseLayer">基本</div>
        <div :class="{water: true, active: standardShow}" @click="addStandard">标准</div>
        <div :class="{font: true, active: totalShow}" @click="addTotalLayer">全部</div>
      </div>
      <div class="png_btn btn_div">
        <div @click="getImage">改值</div>
        <div @click="imgBox = !imgBox">图像处理</div>
        <div @click="glBox = !glBox">webGL</div>
      </div>
    </div>
    <!-- 色斑图数据显示 -->
    <div class="scalarNum"></div>

    <!-- 图像处理 -->
    <img-detail v-show="imgBox"></img-detail>

    <!-- webgl -->
    <webgl  v-show="glBox"></webgl>
  </div>
</template>

<script>
import axios from "axios";
import "@/utils/leaflet.ChineseTmsProviders.js";
import "@/utils/Semicircle.js";
import "@/utils/tileLayer.wmts.js";
// 引入色斑图绘制
import "@/utils/leaflet-vector-scalar.css";
import "backbone";
import "@/utils/leaflet-vector-scalar.js";
import imgDetail from '@/components/imgDetail.vue';
import Webgl from '@/components/webgl.vue';

let url = 'http://192.168.0.99:8899/mapcache/wmts/';
let wmsWaterDepth;
let wmsLightHouse;
let wmsFont;
let wmsAll;
let wmsBase;
let wmsTotal;
let wmsStandard;

let scalarLayer = null;
export default {
  components: { imgDetail, Webgl },
  data() {
    return {
      lightShow: false,
      waterShow: false,
      fontShow: false,
      allShow: false,
      baseShow: false,
      standardShow: false,
      totalShow: false,

      firstDrawFlag: true,
      pngNum: null,

      imgBox: false,

      glBox: false,
    }
  },
  mounted() {
    this.initMap();
    // 直接读txt文本，加载云图
    // this.openFile();
    // 读png图片，加载云图
    // this.getImage();
  },
  methods: {
    // 直接读txt文本
    openFile() {
      axios.get("/js/C03data.txt").then(res => {
        let data = res.data.split('\r\n');
        let head = data.slice(0, 6)
        let list = data.slice(6, data.length)

        let col = head[0].replaceAll(" ", "").replace('ncols', "")
        let row = head[1].replaceAll(" ", "").replace('nrows', "")
        let lon1 = head[2].replaceAll(" ", "").replace('xllcorner', "")
        let lat1 = head[3].replaceAll(" ", "").replace('yllcorner', "")
        let dx = head[4].replaceAll(" ", "").replace('cellsize', "")
        let dy = dx
        let lon2 = lon1 + Number(col) * Number(dx)
        let lat2 = lat1 + Number(row) * Number(dy)
        let noData = head[5].replaceAll(" ", "").replace('NODATA_value', "")
        let minValue = 999;
        let maxValue = -999;

        // 图例配置信息
        let headerObj = {
          nx: col,
          ny: row,
          lo1: lon1,
          lo2: lon2,
          la1: lat1,
          la2: lat2,
          dx: dx,
          dy: dy,
          numberPoints: Number(col) * Number(row),
        };

        let payload = [];
        let imgArr = {
          data: [],
          header: {
            ...headerObj,
          },
        };

        list.forEach(data => {
          data.split(',').forEach(item => {
            if(item == 'nan') {
              imgArr.data.push(NaN)
            } else {
              minValue = minValue > Number(item) ? Number(item) : minValue;
              maxValue = maxValue < Number(item) ? Number(item) : maxValue;
              if(this.pngNum !== null) {
                if(Number(item) > this.pngNum) {
                  imgArr.data.push(item);
                } else {
                  imgArr.data.push(NaN);
                }
              } else {
                imgArr.data.push(item);
              }
            }
          })
        })

        payload.push(imgArr);

        let colorScale = [
          [2.6, [0, 0, 0]],
          [5.3, [42, 42, 42]],
          [7.9, [63, 63, 63]],
          [10.6, [85, 85, 85]],
          [13.3, [106, 106, 106]],
          [15.9, [127, 127, 127]],
          [18.6, [148, 148, 148]],
          [21.2, [170, 170, 170]],
          [23.9, [191, 191, 191]],
          [26.5, [212, 212, 212]],
          [29.2, [233, 233, 233]],
          [32.6, [255, 255, 255]],
        ];

        let config = { minValue, maxValue };
        if (this.firstDrawFlag) {
          scalarLayer = new L.scalarLayer({
            displayValues: false,
            displayOptions: {
              velocityType: "",
              displayPosition: "",
              displayEmptyString: "",
            },
            colorScale,
            ...config,
          });
          this.firstDrawFlag = false;
          // 当色斑图添加完成之后，再将前面的删除
          scalarLayer.setData(payload);
          scalarLayer.getCanvasLayer(map);
          scalarLayer.onAdd(map);
          // if (this.layerShow == 0) {
          //   scalarLayer.setOpacity(0);
          // }

          this.pngNum = minValue;
        } else {
          this.pngNum += 2;
          scalarLayer.setData(payload);
          // scalarLayer.setOpacity(this.layerShow);
        }
      })
    },

    // 解码
    decodeUtf8(arr) {
      let str = "";
      for (let i = 0; i < arr.length; i++) {
        str += String.fromCharCode(arr[i]);
      }
      return str;
    },
    toRGB(color) {
      let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
      let sColor = color.toLowerCase();
      if (sColor && reg.test(sColor)) {
        if (sColor.length === 4) {
          var sColorNew = "#";
          for (var i = 1; i < 4; i += 1) {
            sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
          }
          sColor = sColorNew;
        }
        //处理六位的颜色值
        var sColorChange = [];
        for (var i = 1; i < 7; i += 2) {
          sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
        }
        // return "RGB(" + sColorChange.join(",") + ")";
        return sColorChange;
      } else {
        return sColor;
      }
    },

    getImage() {
      let myCanvas = document.createElement("canvas");
      let image = new Image();
      image.src = "http://localhost:8080/images/C03data.png";
      let ctx = myCanvas.getContext("2d");
      image.onload = () => {
        myCanvas.width = image.width;
        myCanvas.height = image.height;
        ctx.drawImage(image, 0, 0, image.width, image.height);

        let imageData = ctx.getImageData(0, 0, myCanvas.width, myCanvas.height);
        let data = imageData.data;

        let width = imageData.width;
        let height = imageData.height;

        // 头部数据占用的行数
        let rowArr = [];
        // 头部数据的长度
        let lengthArr = [];
        for (let i = 0; i < 24; i += 4) {
          let arr = [
            data[i],
            data[i + 1] + 1,
            255 - data[i + 2],
            255 - data[i + 3] - 1,
          ];
          let num = 0;
          let realData = data[i];
          for (let m = 0; m < arr.length; m++) {
            let count = 0;
            for (let n = 0; n < arr.length; n++) {
              if (arr[m] == arr[n]) {
                ++count;
              }
            }
            if (count > num) {
              num = count;
              realData = arr[m];
            }
          }
          if (i < 8) {
            rowArr.push(realData);
          } else {
            lengthArr.push(realData);
          }
        }
        // 行数,不包括第一行
        let rowNum = rowArr[0] + (rowArr[1] << 8);
        let headWidth =
          lengthArr[0] +
          (lengthArr[1] << 8) +
          (lengthArr[2] << 16) +
          (lengthArr[3] << 24);

        // 头部存储的数据
        let bytes = [];
        let start = width * 4;
        let end = start + headWidth * 4;
        // 加 =号 温度不会少最高的颜色
        for (let i = start; i <= end; i += 4) {
          bytes.push(data[i]);
        }
        let str = this.decodeUtf8(bytes);
        let noStr = str.replaceAll("\u0000", "");
        let infoArr = noStr.split(";");
        // 图例配置信息
        let headerObj = {
          nx: infoArr[0].split(",")[1],
          ny: infoArr[0].split(",")[0],
          lo1: infoArr[1].split(",")[0],
          lo2: infoArr[1].split(",")[1],
          la1: infoArr[2].split(",")[0],
          la2: infoArr[2].split(",")[1],
          dx: infoArr[3].split(",")[0],
          dy: infoArr[3].split(",")[1],
          numberPoints: (data.length - (rowNum + 1) * width * 4) / 4,
        };
        let minNum = Number(infoArr[4].split(",")[0]);
        let maxNum = Number(infoArr[4].split(",")[1]);
        if(this.firstDrawFlag) {
          this.pngNum = minNum;
        } else {
          this.pngNum += 2;
        }
        let minNumV, maxNumV;

        // 颜色配置，colorScale[[v1, [r, g, b]], [v2, [r, g, b]]]三层
        let colorVaule = null;
        let colorList = null;
        colorVaule = infoArr[5].split(",");
        colorList = infoArr[6].split(",");
        let colorScale = [];
        colorList.forEach((item, index) => {
          let sArr = [Number(colorVaule[index])];
          let tArr = this.toRGB(item);
          sArr.push(tArr);
          colorScale.push(sArr);
        });
        let minValue = Number(colorVaule[0]);
        let maxValue = Number(colorVaule[colorVaule.length - 1]);
        let payload = [];

        colorScale = [
          [2.6, [0, 0, 0]],
          [5.3, [42, 42, 42]],
          [7.9, [63, 63, 63]],
          [10.6, [85, 85, 85]],
          [13.3, [106, 106, 106]],
          [15.9, [127, 127, 127]],
          [18.6, [148, 148, 148]],
          [21.2, [170, 170, 170]],
          [23.9, [191, 191, 191]],
          [26.5, [212, 212, 212]],
          [29.2, [233, 233, 233]],
          [32.6, [255, 255, 255]],
        ];

        let imgArr = {
          data: [],
          header: {
            ...headerObj,
          },
        };
        for (let i = (rowNum + 1) * width * 4; i < data.length; i += 4) {
          let d1 = null;
          if (
            data[i] == 0 &&
            data[i + 1] == 0 &&
            (data[i + 2] == 99 || data[i + 2] == 100 || data[i + 2] == 101) &&
            data[i + 3] == 100
          ) {
            d1 = NaN;
          } else {
            d1 = (data[i] * (maxNum - minNum)) / 255 + minNum;
            d1 = this.pngNum > d1 ? NaN : d1;
          }

          imgArr.data.push(d1);
        }

        payload.push(imgArr);

        let config = { minValue, maxValue };
        if (this.firstDrawFlag) {
          scalarLayer = new L.scalarLayer({
            displayValues: false,
            displayOptions: {
              velocityType: "",
              displayPosition: "",
              displayEmptyString: "",
            },
            colorScale,
            ...config,
          });
          this.firstDrawFlag = false;
          // 当色斑图添加完成之后，再将前面的删除
          scalarLayer.setData(payload);
          scalarLayer.getCanvasLayer(map);
          scalarLayer.onAdd(map);
        } else {
          scalarLayer.setData(payload);
        }
      };
    },

    initMap() {
      // 底图切换
      window.map = L.map("app", {
        attributionControl: false,
        crs: L.CRS.EPSG3857,
        minZoom: 1,
        maxZoom: 18,
        worldCopyJump: true,
        zoomControl: false,
      });

      // this.tile1 = L.tileLayer
      //   .chinaProvider("Geoq.Normal.PurplishBlue", { maxZoom: 10, minZoom: 3 })
      //   .addTo(window.map);

      window.map.setView([21.27, 110.35], 5);

      let wmsLayer = L.tileLayer.wms(globalConfig.mapWmsURL + "/geoserver/world/wms", {
        service: 'WMS',
        version: '1.1.1',
        request: 'GetMap',
        layers: 'world:world-i',
        // layers: 'world:world2',
        SRS: "EPSG:4326",
        styles: '',
        format: 'image/png',
        TRANSPARENT: true,
      });
      wmsLayer.addTo(map);



      let wmsLayer1 = L.tileLayer.wms(globalConfig.mapWmsURL + "/geoserver/world/wms", {
        service: 'WMS',
        version: '1.1.1',
        request: 'GetMap',
        // layers: 'world:world-i',
        layers: 'world:world2',
        SRS: "EPSG:4326",
        styles: '',
        format: 'image/png',
        TRANSPARENT: true,
      });

      // 灯塔
      let wmsLayer2 = L.tileLayer.wms('http://192.168.1.152/cgi-bin/mapserv.exe', {
        map: 'F:/ruanjian/ms4w/includes/DAY_BRIGHT_LIGHTS1.map',
        service: 'WMS',
        version: '1.1.0',
        request: 'GetMap',
        layers: 'LIGHTS_1',
        // layers: 'world:world2',
        SRS: "EPSG:4326",
        styles: '',
        format: 'image/png',
        TRANSPARENT: true,
      });

      // let circle = L.semiCircle([25, 125], {
      //       radius: 100000,
      //       weight: 10,
      //       color: '#ff0',
      //       opacity: 1,
      //       fillOpacity: 0.9,
      //   }).addTo(map);
      //   circle.setDirection(0, 270);


      // let testObj = {
      //   id: 1,
      //   arr: []
      // }

      // for(let i = 0; i < 10000000; i++) {
      //   testObj.arr.push(Math.random() * 100)
      // }
      // console.log('object', testObj);
    },

    // 水深
    addWaterDepth() {
      if(this.waterShow) {
        map.removeLayer(wmsWaterDepth);
        this.waterShow = false;
      } else {
        // wmsWaterDepth = L.tileLayer.wms('http://192.168.0.99:8899/cgi-bin/mapserv.exe', {
        //   map: 'C:/map/' + 'includes/DAY_BRIGHT_SOUNDG1.map',
        //   service: 'WMS',
        //   version: '1.1.0',
        //   request: 'GetMap',
        //   layers: 'SeaChart_BRIGHT_SOUNDG1',
        //   // layers: 'world:world2',
        //   // SRS: "EPSG:4326",
        //   styles: '',
        //   format: 'image/png',
        //   transparent: false,
        // });
        wmsWaterDepth = L.tileLayer.wmts(url,{  
          "layer": "SOUNDG",
          "style": "default",
          "format": "image/png",
          // "tilematrixSet": "WGS84" //高级海图 advsea ,基础海陆混合 basicsearoad ,高级海陆混合 advsearoad
          "tilematrixSet": "GoogleMapsCompatible" //高级海图 advsea ,基础海陆混合 basicsearoad ,高级海陆混合 advsearoad
        });
  
        wmsWaterDepth.addTo(map);
        this.waterShow = true;
      }
    },

    // 灯塔
    addLightHouse() {
      if(this.lightShow) {
        map.removeLayer(wmsLightHouse);
        this.lightShow = false;
      } else {
        // wmsLightHouse = L.tileLayer.wms('http://192.168.0.99:8899/cgi-bin/mapserv.exe', {
        //   map: 'C:/map/' + 'includes/DAY_BRIGHT_LIGHTS1.map',
        //   service: 'WMS',
        //   version: '1.3.0',
        //   request: 'GetMap',
        //   layers: 'SeaChart_BRIGHT_LIGHTS1',
        //   // layers: 'world:world2',
        //   // srs: "EPSG:4326",
        //   styles: '',
        //   format: 'image/png',
        //   transparent: false,
        //   // updateWhenIdle: true,
        //   // updateWhenZooming: false,
        // });
        wmsLightHouse = L.tileLayer.wmts(url,{  
          "layer": "LIGHTS",
          "style": "default",
          "format": "image/png",
          // "tilematrixSet": "WGS84" //高级海图 advsea ,基础海陆混合 basicsearoad ,高级海陆混合 advsearoad
          "tilematrixSet": "GoogleMapsCompatible" //高级海图 advsea ,基础海陆混合 basicsearoad ,高级海陆混合 advsearoad
        });
  
        wmsLightHouse.addTo(map);
        this.lightShow = true;
      }
    },

    // 文字
    addFont() {
      if(this.fontShow) {
        map.removeLayer(wmsFont);
        this.fontShow = false;
      } else {
        // wmsFont = L.tileLayer.wms('http://192.168.0.99:8899/cgi-bin/mapserv.exe', {
        //   map: 'C:/map/' + 'includes/DAY_BRIGHT_SEAARE.map',
        //   service: 'WMS',
        //   version: '1.1.0',
        //   request: 'GetMap',
        //   layers: 'SeaChart_BRIGHT_SEAARE',
        //   // layers: 'world:world2',
        //   // SRS: "EPSG:4326",
        //   styles: '',
        //   format: 'image/png',
        //   transparent: false,
        // });
        wmsFont = L.tileLayer.wmts(url,{  
          "layer": "SEAARE",
          "style": "default",
          "format": "image/png",
          // "tilematrixSet": "WGS84" //高级海图 advsea ,基础海陆混合 basicsearoad ,高级海陆混合 advsearoad
          "tilematrixSet": "GoogleMapsCompatible" //高级海图 advsea ,基础海陆混合 basicsearoad ,高级海陆混合 advsearoad
        });
        this.fontShow = true;
  
        wmsFont.addTo(map);
      }
    },

    // 白天的所有要素
    addAll() {
      if(this.allShow) {
        map.removeLayer(wmsAll);
        this.allShow = false;
      } else {
        // wmsAll = L.tileLayer.wms('http://192.168.0.99:8899/cgi-bin/mapserv.exe', {
        //   map: 'C:/map/' + 'SeaChart_DAY_BRIGHT_EASY.map',
        //   service: 'WMS',
        //   version: '1.1.0',
        //   request: 'GetMap',
        //   layers: 'SeaChart_DAY_BRIGHT',
        //   // layers: 'world:world2',
        //   // SRS: "EPSG:4326",
        //   styles: '',
        //   format: 'image/png',
        //   transparent: false,
        // });

        wmsAll = L.tileLayer.wmts(url,{  
          "layer": "BRIGHT",
          "style": "default",
          "format": "image/png",
          "tilematrixSet": "GoogleMapsCompatible" //高级海图 advsea ,基础海陆混合 basicsearoad ,高级海陆混合 advsearoad
        });
        this.allShow = true;
  
        wmsAll.addTo(map);
      }
    },


    // 基本
    addBaseLayer() {
      if(this.baseShow) {
        map.removeLayer(wmsBase);
        this.baseShow = false;
      } else {
        // wmsBase = L.tileLayer.wms('http://192.168.0.99:8899/cgi-bin/mapserv.exe', {
        //   map: 'C:/map/' + 'SeaChart_DAY_BRIGHT_EASY.map',
        //   service: 'WMS',
        //   version: '1.1.0',
        //   request: 'GetMap',
        //   layers: 'SeaChart_DAY_BRIGHT',
        //   // layers: 'world:world2',
        //   // SRS: "EPSG:4326",
        //   styles: '',
        //   format: 'image/png',
        //   transparent: false,
        // });

        wmsBase = L.tileLayer.wmts(url,{  
          "layer": "EASY",
          "style": "default",
          "format": "image/png",
          // "tilematrixSet": "WGS84" //高级海图 advsea ,基础海陆混合 basicsearoad ,高级海陆混合 advsearoad
          "tilematrixSet": "GoogleMapsCompatible" //高级海图 advsea ,基础海陆混合 basicsearoad ,高级海陆混合 advsearoad
        });
        this.baseShow = true;
  
        wmsBase.addTo(map);
      }
    },

    // 标准的所有要素
    addStandard() {
      if(this.standardShow) {
        map.removeLayer(wmsStandard);
        this.standardShow = false;
      } else {
        // wmsStandard = L.tileLayer.wms('http://192.168.0.99:8899/cgi-bin/mapserv.exe', {
        //   map: 'C:/map/' + 'SeaChart_DAY_BRIGHT_standard.map',
        //   service: 'WMS',
        //   version: '1.1.0',
        //   request: 'GetMap',
        //   layers: 'SeaChart_DAY_BRIGHT',
        //   // layers: 'world:world2',
        //   // SRS: "EPSG:4326",
        //   styles: '',
        //   format: 'image/png',
        //   transparent: false,
        // });

        wmsStandard = L.tileLayer.wmts(url,{  
          "layer": "standard",
          "style": "default",
          "format": "image/png",
          // "tilematrixSet": "WGS84" //高级海图 advsea ,基础海陆混合 basicsearoad ,高级海陆混合 advsearoad
          "tilematrixSet": "GoogleMapsCompatible" //高级海图 advsea ,基础海陆混合 basicsearoad ,高级海陆混合 advsearoad
        });
        this.standardShow = true;
  
        wmsStandard.addTo(map);
      }
    },

    // 全部
    addTotalLayer() {
      if(this.totalShow) {
        map.removeLayer(wmsTotal);
        this.totalShow = false;
      } else {
        // wmsTotal = L.tileLayer.wms('http://192.168.0.99:8899/cgi-bin/mapserv.exe', {
        //   map: 'C:/map/' + 'SeaChart_DAY_BRIGHT.map',
        //   service: 'WMS',
        //   version: '1.1.0',
        //   request: 'GetMap',
        //   layers: 'SeaChart_DAY_BRIGHT',
        //   // layers: 'world:world2',
        //   // SRS: "EPSG:4326",
        //   styles: '',
        //   format: 'image/png',
        //   transparent: false,
        // });
        // this.totalShow = true;
  
        // wmsTotal.addTo(map);

        wmsTotal = L.tileLayer.wmts(url,{  
          "layer": "BRIGHT",
          "style": "default",
          "format": "image/png",
          // "tilematrixSet": "WGS84" //高级海图 advsea ,基础海陆混合 basicsearoad ,高级海陆混合 advsearoad
          "tilematrixSet": "GoogleMapsCompatible" //高级海图 advsea ,基础海陆混合 basicsearoad ,高级海陆混合 advsearoad
        });
        this.totalShow = true;
        wmsTotal.addTo(map);
      }
    },
  }
}
</script>

<style lang="less" scoped>
#app {
  width: 100vw;
  height: 100vh;
}

.btn {
  width: 180px;
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 999;
  display: flex;
  flex-wrap: wrap;

  .btn_div {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
  }

  .params_btn, .base_btn, .png_btn {
    div {
      width: 50px;
      height: 30px;
      line-height: 30px;
      text-align: center;
      background: #fff;
      margin: 5px;

      &:hover {
        cursor: pointer;
      }
    }

    .active {
      color: #fff;
      background: #981a00;
    }
  }

  .base_btn {
    margin-top: 10px;
  }

  .png_btn {
    margin-top: 10px;
  }
}
// 色斑图弹出信息
.scalarNum {
    position: fixed;
    color: #FFF;
    z-index: 999;
}
</style>
