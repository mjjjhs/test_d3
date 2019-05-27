import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    canvasObj: null,
    dragComponent: null,
    draggableObj: null,
    svgEl: null,
    canvasEl: null
  },
  mutations: {
    setComponentDragFunc(state, data) {
      state.dragComponent = data;
    },
    setDraggableObj(state, data) {
      state.draggableObj = data;
    },
    setCanvasObj(state, data) {
      state.canvasObj = data;
    },
    setSvgEl(state, data) {
      state.svgEl = data;
    },
    setCanvasEl(state, data) {
      state.canvasEl = data;
    }
  },
  actions: {
    setComponentDragFunc(context, data) {
      context.commit('setComponentDragFunc', data);
    },
    setDraggableObj(context, data) {
      context.commit('setDraggableObj', data);
    },
    setCanvasObj(context, data) {
      context.commit('setCanvasObj', data);
    },
    setSvgEl(context, data) {
      context.commit('setSvgEl', data);
    },
    setCanvasEl(context, data) {
      context.commit('setCanvasEl', data);
    }
  },
});
