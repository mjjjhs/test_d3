import $ from 'jquery';
import * as d3 from 'd3';

const SCALE = 1;
const TRANSLATE = [0, 0];
const INCREMENT = 1.2;
const MAX_SCALE = 8;
const MIN_SCALE = 0.2;
const MIN_SCALE_TO_RENDER = 0.6;
const DEFAULT_PAGE_TITLE = '';

let svg = null, canvas = null, app = null; 

export default {
  
  init(Vue) {
    app = Vue;
    console.log('svg::', Vue.$root.$canvas.svg);
    // create the canvas
    app.svg = d3.select('#canvas_container').append('svg');
    // create the canvas element
    app.canvas = app.svg.append('g')
      .attr('transform', `translate(${TRANSLATE}) scale(${SCALE})`)
      .attr('id', 'canvas');
      
    app.svg.on('mouseup.selection', () => {
      if (d3.event.button !== 0) {
        // prevent further propagation (to parents and others handlers
        // on the same element to prevent zoom behavior)
        // 추가 전파 방지(확대 동작을 방지하기 위해 동일한 요소에 있는 부모 및 다른 핸들러에게)
        d3.event.stopImmediatePropagation();
        return;
      }
      
      // d3.selectAll('.selected, .dragging')
      //   .classed('selected', false)
      //   .classed('dragging', false);
      
    });
    this.updateGraphSize();
    this.defineMarker();
    this.setWindowResizeEvent();
    
  },
  setWindowResizeEvent() {
    // listen for browser resize events to reset the graph size
    // 브라우저 크기 조정 이벤트를 듣고 그래프 크기를 재설정합니다
    $(window).on('resize', function (e) {
      if (e.target === window) {
        // close the hamburger menu if open
        if($('.md-menu-backdrop').is(':visible') === true){
          $('.md-menu-backdrop').click();
        }
        this.updateGraphSize();
      }
    }.bind(this));
  },
  // define a function for update the graph dimensions
  // 그래프 치수를 업데이트하는 함수 정의
  updateGraphSize() {
    // get the location of the bottom of the graph
    // 그래프 하단의 위치를 ​​얻는다.
    const footer = $('#banner-footer');
    let bottom = 0;
    if (footer.is(':visible')) {
        bottom = footer.height();
    }
    const canvasContainer = $('#canvas_container');
    // calculate size
    const top = parseInt(canvasContainer.parent().parent().css('top'), 10);
    const windowHeight = $(window).height();
    const canvasHeight = windowHeight - (bottom + top);
    // canvas/svg
    canvasContainer.css({
        'height': canvasHeight + 'px',
        'bottom': bottom + 'px'
    });
    app.svg.attr('height', canvasContainer.height())
      .attr('width', $(window).width());  

    // body
    $('#canvas-body').css({
        'height': windowHeight + 'px',
        'width': $(window).width() + 'px'
    });
  },
  defineMarker() {
    // create the definitions element
    const defs = app.svg.append('defs');
    // create arrow definitions for the various line types
    // 다양한 선 유형에 대한 화살표 정의 생성
    defs.selectAll('marker')
      .data(['normal', 'ghost', 'unauthorized', 'full'])
      .enter()
      .append('marker')
        .attr('id', d => {
          console.log('marker id -> d::', d);
          return d;
        })
        .attr('viewBox', '0 0 6 6')
        .attr('refX', 5)
        .attr('refY', 3)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .attr('fill', d => {
          if (d === 'ghost') {
            return '#aaaaaa';
          } else if (d === 'unauthorized') {
            return '#ba554a';
          } else if (d === 'full') {
            return '#ba554a';
          } else {
            return '#000000';
          }
        })
        .append('path')
          .attr('d', 'M2,3 L0,6 L6,3 L0,0 z');
    // filter for drop shadowㄴ
    const componentDropShadowFilter = defs.append('filter')
      .attr('id', 'component-drop-shadow')
      .attr('height', '140%')
      .attr('y', '-20%');
    
    componentDropShadowFilter.append('feGaussianBlur')
      .attr('in', 'SourceAlpah')
      .attr('stdDeviation', 3)
      .attr('result', 'blur');

    // offset
    componentDropShadowFilter.append('feOffset')
      .attr('in', 'blur')
      .attr('dx', 0)
      .attr('dy', 1)
      .attr('result', 'offsetBlur');

    // color/opacity
    componentDropShadowFilter.append('feFlood')
      .attr('flood-color', '#000000')
      .attr('flood-opacity', 0.4)
      .attr('result', 'offsetColor');

    // combine
    componentDropShadowFilter.append('feComposite')
      .attr('in', 'offsetColor')
      .attr('in2', 'offsetBlur')
      .attr('operator', 'in')
      .attr('result', 'offsetColorBlur');

    // stack the effect under the source graph
    // 효과를 소스 그래프 아래에 쌓다
    const componentDropShadowFeMerge = componentDropShadowFilter.append('feMerge');
    componentDropShadowFeMerge.append('feMergeNode')
      .attr('in', 'offsetColorBlur');
    componentDropShadowFeMerge.append('feMergeNode')
      .attr('in', 'SourceGraphic');
    }
}