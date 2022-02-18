import µ from './micro.js'
/**
 * @options 配置参数
    * @colorList  颜色数组
    * @isCanvas   是否用Canvas绘制
    * @isPopup    是否添加弹出框
    * @isStroke    是否绘制边
    * @nodeData    点的经纬度数组
    * @faceData    面对应点的数组
    * @paneName    pane
 */
L.Triangle = L.Polygon.extend({
  // -- initialized is called on prototype
  options: {
    colorScale: [
      [5, [245, 34, 45]],
      [10, [250, 84, 28]],
      [15, [250, 173, 20]],
      [20, [245, 34, 45]],
      [25, [250, 84, 28]],
      [30, [250, 173, 20]]
    ],
    isCanvas: false,
    isPopup: false,
    isStroke: false,
    opacity: 1,
    nodeData: null,
    faceData: null,
    paneName: null,
  },
  _map: null,
  _canvas: null,
  _canvasRenderer: null,
  _triangleLayer: null,
  initialize: function (options) {
    L.setOptions(this, options);
  },

  onAdd(map) {
    this._map = map;
    this.drawTriangleLayer();

    this._map.addLayer(this._triangleLayer);
  },

  onRemove() {
    this._triangleLayer.clearLayers()
    this._map.removeLayer(this._triangleLayer)
  },

  // 返回三角网格的图层组
  getTriangleLayer() {
    return this._triangleLayer
  },

  setTriangleData(nodeData, faceData) {
    const { colorScale, opacity } = this.options
    let layers = this._triangleLayer.getLayers()
    let getColorByValue = µ.segmentedColorScale(colorScale)
    for (let i = 0, j = 0, length = faceData.length; i < length; i += 3, j++) {
      layers[j].setStyle({
        color: `rgba(${getColorByValue(nodeData[faceData[i] - 1][2], opacity)})`
      })
    }
  },

  // 获取三角形图层
  drawTriangleLayer() {
    this._triangleLayer = L.layerGroup({
      pane: this._paneName
    });
    const { colorScale, isCanvas, isPopup, opacity, nodeData, faceData, isStroke, paneName } = this.options;

    // determine where to add the layer
    this._paneName = paneName || "shadowPane"; // fall back to overlayPane for leaflet < 1
    let pane = map._panes.shadowPane;
    if (map.getPane) {
      // attempt to get pane first to preserve parent (createPane voids this)
      pane = map.getPane(this._paneName);
      if (!pane) {
        pane = map.createPane(this._paneName);
      }
    } // create canvas, add to map pane

    // 使用canvas进行渲染
    if (isCanvas) {
      this._canvasRenderer = L.canvas({ padding: 0.5 });
    }

    // 根据数值大小，获取渐变颜色值的函数
    let getColorByValue = µ.segmentedColorScale(colorScale)

    for (let i = 0, length = faceData.length; i < length; i += 3) {
      let polygon = isCanvas ?
        L.polygon([[nodeData[faceData[i] - 1][0], nodeData[faceData[i] - 1][1]], [nodeData[faceData[i + 1] - 1][0], nodeData[faceData[i + 1] - 1][1]], [nodeData[faceData[i + 2] - 1][0], nodeData[faceData[i + 2] - 1][1]]],
          {
            color: `rgba(${getColorByValue(nodeData[faceData[i] - 1][2], opacity)})`,
            stroke: isStroke,
            fillOpacity: opacity,
            renderer: this._canvasRenderer
          })
        : L.polygon([[nodeData[faceData[i] - 1][0], nodeData[faceData[i] - 1][1]], [nodeData[faceData[i + 1] - 1][0], nodeData[faceData[i + 1] - 1][1]], [nodeData[faceData[i + 2] - 1][0], nodeData[faceData[i + 2] - 1][1]]],
          {
            color: `rgba(${getColorByValue(nodeData[faceData[i] - 1][2], opacity)})`,
            stroke: isStroke,
            fillOpacity: opacity,
          })
      if (isPopup) {
        // polygon.bindPopup(`经纬度：${nodeData[faceData[i] - 1][0], nodeData[faceData[i] - 1][1]},颜色：${colorList[i % 6]}`)
        polygon.bindPopup(`经纬度：${nodeData[faceData[i] - 1][0], nodeData[faceData[i] - 1][1]}--数据值：${nodeData[faceData[i] - 1][2]}`)
      }
      this._triangleLayer.addLayer(polygon)
    }
  },
})

L.triangle = function (options) {
  return new L.Triangle(options);
};