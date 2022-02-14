/**
 * @options 配置参数
    * @colorList  颜色数组
    * @isCanvas   是否用Canvas绘制
    * @isPopup    是否添加弹出框
    * @isStroke    是否绘制边
    * @latlngs    点的经纬度数组
    * @paneName    pane
 */
L.Triangle = L.Polygon.extend({
  // -- initialized is called on prototype
  options: {
    colorList: [
      'rgb(245, 34, 45)',
      'rgb(250, 84, 28)',
      'rgb(250, 173, 20)',
      'rgb(245, 34, 45)',
      'rgb(250, 84, 28)',
      'rgb(250, 173, 20)'
    ],
    isCanvas: false,
    isPopup: false,
    isStroke: false,
    latlngs: null,
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
    this.getTriangleLayer();

    this._map.addLayer(this._triangleLayer);
  },

  onRemove() {
    this._triangleLayer.clearLayers()
    this._map.removeLayer(this._triangleLayer)
  },

  // 获取三角形图层
  getTriangleLayer() {
    this._triangleLayer = L.layerGroup({
      pane: this._paneName
    });
    const { colorList, isCanvas, isPopup, latlngs, isStroke, paneName } = this.options;

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

    for (let i = 0, length = latlngs.length; i < length; i++) {
      let polygon = isCanvas ?
        L.polygon([latlngs[0][0], latlngs[0][1], latlngs[0][2]], { color: colorList[i % 6], stroke: isStroke, renderer: this._canvasRenderer })
        : L.polygon([latlngs[0][0], latlngs[0][1], latlngs[0][2]], { color: colorList[i % 6], stroke: isStroke })
      if (isPopup) {
        polygon.bindPopup(`经纬度：${latlngs[0][3]},颜色：${colorList[i % 6]}`)
      }
      this._triangleLayer.addLayer(polygon)
    }

    return this._triangleLayer;
  },

  getLatlngs: function () {
    return this._latlngs
  }
})

L.triangle = function (options) {
  return new L.Triangle(options);
};