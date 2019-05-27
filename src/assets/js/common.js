const global = {
  install(Vue, options) {
    Vue.test = function() {
      return 'asdasd';
    };
  }
};

export default global;