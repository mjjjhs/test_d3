import canvas from './canvas';

const myPlugin = {
  install(Vue, opt) {
    Vue.prototype.$moduleCanvas = canvas;
    Vue.prototype.$getModuleCanvas = function () {
      return this.$moduleCanvas;
    }
  }
};
export default myPlugin;