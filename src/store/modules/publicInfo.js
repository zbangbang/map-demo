const state = {
  // 温度颜色图例
  colorScaleK: [
    [254.15, [0, 0, 255]],
    [255.15, [0, 26, 249]],
    [256.15, [0, 39, 223]],
    [257.15, [0, 52, 210]],
    [258.15, [0, 65, 196]],
    [259.15, [0, 78, 195]],
    [260.15, [0, 91, 182]],
    [261.15, [0, 104, 169]],
    [262.15, [0, 117, 156]],
    [263.15, [0, 130, 143]],
    [264.15, [0, 143, 130]],
    [265.15, [0, 156, 117]],
    [266.15, [0, 169, 104]],
    [267.15, [0, 182, 91]],
    [268.15, [0, 195, 78]],
    [269.15, [0, 196, 65]],
    [270.15, [0, 210, 52]],
    [271.15, [0, 223, 39]],
    [272.15, [0, 236, 26]],
    [273.15, [0, 249, 13]],
    [274.15, [0, 255, 0]],
    [275.15, [8, 255, 0]],
    [276.15, [21, 255, 0]],
    [277.15, [34, 255, 0]],
    [278.15, [47, 255, 0]],
    [279.15, [60, 255, 0]],
    [280.15, [73, 255, 0]],
    [281.15, [86, 255, 0]],
    [282.15, [99, 255, 0]],
    [283.15, [112, 255, 0]],
    [284.15, [125, 255, 0]],
    [285.15, [138, 255, 0]],
    [286.15, [151, 255, 0]],
    [287.15, [164, 255, 0]],
    [288.15, [177, 255, 0]],
    [289.15, [190, 255, 0]],
    [290.15, [203, 255, 0]],
    [291.15, [216, 255, 0]],
    [292.15, [229, 255, 0]],
    [293.15, [242, 255, 0]],
    [294.15, [255, 255, 0]],
    [295.15, [255, 244, 0]],
    [296.15, [255, 231, 0]],
    [297.15, [255, 218, 0]],
    [298.15, [255, 205, 0]],
    [299.15, [255, 192, 0]],
    [300.15, [255, 179, 0]],
    [301.15, [255, 166, 0]],
    [302.15, [255, 153, 0]],
    [303.15, [255, 140, 0]],
    [304.15, [255, 127, 0]],
    [305.15, [255, 104, 0]],
    [306.15, [255, 102, 0]],
    [307.15, [255, 91, 0]],
    [308.15, [255, 78, 0]],
    [309.15, [255, 65, 0]],
    [310.15, [255, 52, 0]],
    [311.15, [255, 39, 0]],
    [312.15, [255, 26, 0]],
    [313.15, [255, 13, 0]],
    [314.15, [255, 0, 0]],
  ],
  colorScaleC: [
    // [254.15, [0, 0, 255]],
    // [255.15, [0, 26, 249]],
    // [256.15, [0, 39, 223]],
    // [257.15, [0, 52, 210]],
    // [258.15, [0, 65, 196]],
    // [259.15, [0, 78, 195]],
    // [260.15, [0, 91, 182]],
    // [261.15, [0, 104, 169]],
    // [262.15, [0, 117, 156]],
    // [263.15, [0, 130, 143]],
    // [264.15, [0, 143, 130]],
    // [265.15, [0, 156, 117]],
    // [266.15, [0, 169, 104]],
    // [267.15, [0, 182, 91]],
    // [268.15, [0, 195, 78]],
    // [269.15, [0, 196, 65]],
    // [270.15, [0, 210, 52]],
    // [271.15, [0, 223, 39]],
    // [272.15, [0, 236, 26]],
    [0, [0, 249, 13]],
    [1, [0, 255, 0]],
    [2, [8, 255, 0]],
    [3, [21, 255, 0]],
    [4, [34, 255, 0]],
    [5, [47, 255, 0]],
    [6, [60, 255, 0]],
    [7, [73, 255, 0]],
    [8, [86, 255, 0]],
    [9, [99, 255, 0]],
    [10, [112, 255, 0]],
    [11, [125, 255, 0]],
    [12, [138, 255, 0]],
    [13, [151, 255, 0]],
    [14, [164, 255, 0]],
    [15, [177, 255, 0]],
    [16, [190, 255, 0]],
    [17, [203, 255, 0]],
    [18, [216, 255, 0]],
    [19, [229, 255, 0]],
    [20, [242, 255, 0]],
    [21, [255, 255, 0]],
    [22, [255, 244, 0]],
    [23, [255, 231, 0]],
    [24, [255, 218, 0]],
    [25, [255, 205, 0]],
    [26, [255, 192, 0]],
    [27, [255, 179, 0]],
    [28, [255, 166, 0]],
    [29, [255, 153, 0]],
    [30, [255, 140, 0]],
    [31, [255, 127, 0]],
    [32, [255, 104, 0]],
    [33, [255, 102, 0]],
    [34, [255, 91, 0]],
    [35, [255, 78, 0]],
    [36, [255, 65, 0]],
    [37, [255, 52, 0]],
    [38, [255, 39, 0]],
    [39, [255, 26, 0]],
    [40, [255, 13, 0]],
    [41, [255, 0, 0]],
  ],
}

const mutations = {
  setColorScaleK(state, val) {
    state.colorScaleK = val
  },
  setColorScaleC(state, val) {
    state.colorScaleC = val
  },
}

const actions = {

}

const getters = {

}

export default {
  namespace: true,
  state,
  mutations,
  actions,
  getters
}