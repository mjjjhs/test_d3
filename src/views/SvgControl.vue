<template>
  <div class="svg_ctl">
    <div class="d3_svg_1 section">
      <div id="canvas_container"></div>
      <div id="menu">
        <button id="processor_component_icon" type="processor" draggable="true" v-on:dragend="componentDragEnd" class="icon"><font-awesome-icon icon="coffee" /></button>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue';
import $ from 'jquery';
import * as d3 from 'd3';

export default {
  name: 'svgControl',
  data() {
    return {
      svg: null,
      canvas: null,
      translate: [0, 0],
      scale: 1,
      componentDrag: null,
      snapEnabled: true,
      snapAlignmentPixels: 8,
    };
  },
  methods: {
    componentDragEnd(e) {
      console.log(e);
      if(e.layerX < 0 || e.layerY < 0) return;
      const tObj = $(e.target);
      const processorObj = d3.select('#canvas').append('g')
        .classed('processor component', true)
        .attr('id', 'abc')
        .datum({
          'id': 'abc',
          'position': {
            'x': e.layerX,
            'y': e.layerY  
          },
          'dimensions': {
            'width': 350,
            'height': 130
          },
          'type': tObj.attr('type')
        })
        .attr('transform', d => `translate(${d.position.x}, ${d.position.y})`);
      processorObj.append('rect')
        .classed('border', true)
        .style('fill', 'transparent')
        .attr('width', d => d.dimensions.width)
        .attr('height', d => d.dimensions.height);
        
      processorObj.append('rect')
        .classed('body', true)
        .style('fill', 'yellow')
        .attr('width', d => d.dimensions.width)
        .attr('height', d => d.dimensions.height)
        .attr('filter', 'url(#component-drop-shadow)')
        .attr('stroke-width', 0);
        
      processorObj.call(this.setComponentEvent);
    },
    setComponentEvent(component) {
      component.on('mousedown.selection', function() {
          const pos = d3.mouse(d3.select(this).node());
          
          d3.selectAll('#canvas .component.selected')
            .classed('selected', false);
          d3.select(this)
            .classed('selected', true);
        })
        .call(this.activateDrag);
    },
    createCanvas() {
      // console.log(this.test());
      // create the canvas
      this.svg = d3.select('#canvas_container').append('svg');
      // create the canvas element
      this.canvas = this.svg.append('g')
        .attr('transform', `translate(${this.translate}) scale(${this.scale})`)
        .attr('id', 'canvas');
        
      this.svg.on('mouseup.selection', () => {
        if (d3.event.button !== 0) {
          // prevent further propagation (to parents and others handlers
          // on the same element to prevent zoom behavior)
          // 추가 전파 방지(확대 동작을 방지하기 위해 동일한 요소에 있는 부모 및 다른 핸들러에게)
          d3.event.stopImmediatePropagation();
          return;
        }
        d3.selectAll('#canvas .component.selected')
          .classed('selected', false);
      });
    },
    initCanvas() {
      this.createCanvas();
      this.updateGraphSize();
      this.defineMarker();
      this.setWindowResizeEvent();
    },
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
        'height': `${canvasHeight}px`,
        'bottom': `${bottom}px`
      });
      this.svg.attr('height', canvasContainer.height())
        .attr('width', $(window).width());
  
      // body
      $('#canvas-body').css({
        'height': windowHeight + 'px',
        'width': $(window).width() + 'px'
      });
    },
    setWindowResizeEvent() {
      // listen for browser resize events to reset the graph size
      // 브라우저 크기 조정 이벤트를 듣고 그래프 크기를 재설정합니다
      $(window).on('resize', function(e) {
        if (e.target === window) {
          // close the hamburger menu if open
          if($('.md-menu-backdrop').is(':visible') === true){
            $('.md-menu-backdrop').click();
          }
          this.updateGraphSize();
        }
      }.bind(this));
    },
    initMarker() {
      // create the definitions element
      const defs = this.svg.append('defs');
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
      
      return defs;
    },
    initFilter(defs) {
      // filter for drop shadow
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
    },
    // define a function for update the graph dimensions
    // 그래프 치수를 업데이트하는 함수 정의
    defineMarker() {
      const defs = this.initMarker();
      this.initFilter(defs);
    },
    initComponentDraggable() {
      // handle component drag events
      // 구성 요소 드래그 이벤트 처리
      this.componentDrag = d3.drag()
        .on('start', () => {
          // stop further propagation
          d3.event.sourceEvent.stopPropagation();
        })
        .on('drag', () => {
                  
          const dragSelection = d3.select('rect.drag-selection');
          console.log('dragSelection list :: ',dragSelection);
          // lazily create the drag selection box
          // 끌기 선택 상자를 늦게 만듭니다.
          if (dragSelection.empty()) {
            // get the current selection
            // 현재 선택 항목을 가져옵니다.
            const selection = d3.selectAll('.selected');
            console.log('selection::',selection.datum());
            // determine the appropriate bounding box
            // 적절한 경계 상자를 결정한다.
            let minX = null, maxX = null, minY = null, maxY = null;
            selection.each(function (d) {
              console.log('selection.each -> d::',d);
              if (minX === null || d.position.x < minX) {
                minX = d.position.x;
              }
              if (minY === null || d.position.y < minY) {
                minY = d.position.y;
              }
              const componentMaxX = d.position.x + d.dimensions.width;
              const componentMaxY = d.position.y + d.dimensions.height;
              if (maxX === null || componentMaxX > maxX) {
                maxX = componentMaxX;
              }
              if (maxY === null || componentMaxY > maxY) {
                maxY = componentMaxY;
              }
            });
            
            // create a selection box for the move
            d3.select('#canvas').append('rect')
              .attr('rx', 6)
              .attr('ry', 6)
              .attr('x', minX)
              .attr('y', minY)
              .attr('class', 'drag-selection')
              .attr('pointer-events', 'none')
              .attr('width', maxX - minX)
              .attr('height', maxY - minY)
              .attr('stroke-width', () => {
                  return 1 / 1;
              })
              .attr('stroke-dasharray', () => {
                  return 4 / 1;
              })
              .datum({
                original: {
                    x: minX,
                    y: minY
                },
                x: minX,
                y: minY
              });
          } else {
              // update the position of the drag selection
              // snap align the position unless the user is holding shift
              this.snapEnabled = !d3.event.sourceEvent.shiftKey;
              dragSelection.attr('x', function(d) {
                console.log('dragSelection -> d::', d);
                if(d3.event.dx) d.x += d3.event.dx;
                return this.snapEnabled ? (Math.round(d.x/this.snapAlignmentPixels) * this.snapAlignmentPixels) : d.x;
              }).attr('y', (d) => {
                if(d3.event.dy) d.y += d3.event.dy;
                return this.snapEnabled ? (Math.round(d.y/this.snapAlignmentPixels) * this.snapAlignmentPixels) : d.y;
              });
            }
        })
        .on('end', () => {
          // stop further propagation
          d3.event.sourceEvent.stopPropagation();

          // get the drag selection
          // 드래그 선택 가져 오기
          const dragSelection = d3.select('rect.drag-selection');

          // ensure we found a drag selection
          // 드래그 선택을 찾았는지 확인하십시오.
          if (dragSelection.empty()) {
            return;
          }

          // get the destination group if applicable... remove the drop flag if necessary to prevent
          // subsequent drop events from triggering prior to this move's completion
          // 해당되는 경우 대상 그룹을 가져옵니다... 필요한 경우 드롭 플래그를 제거하여이 이동 완료 전에 후속 드롭 이벤트가 트리거되지 않도록하십시오.
          // const group = d3.select('g.drop').classed('drop', false);

          // either move or update the selections group as appropriate
          // 적절하게 선택 그룹을 이동하거나 업데이트하십시오.
          // if (group.empty()) {
          this.updateComponentsPosition(dragSelection);
          // } else {
          //   updateComponentsGroup(group);
          // }

          // remove the drag selection
          dragSelection.remove();
        });
    },
    updateComponentsPosition(dragSelection) {
      const updates = d3.map();
      // determine the drag delta
      const dragData = dragSelection.datum();
      console.log('dragData::', dragData);
      const delta = {
          x: dragData.x - dragData.original.x,
          y: dragData.y - dragData.original.y
      };
      // if the component didn't move, return
      if (delta.x === 0 && delta.y === 0) {
          return;
      }

      // const selectedConnections = d3.selectAll('g.connection.selected');
      const selectedComponents = d3.selectAll('g.component.selected');
      console.log('selectedComponents::', selectedComponents);
      // // go through each selected connection
      // selectedConnections.each(function (d) {
      //     const connectionUpdate = nfDraggable.updateConnectionPosition(d, delta);
      //     if (connectionUpdate !== null) {
      //         updates.set(d.id, connectionUpdate);
      //     }
      // }.bind(this));

      // // go through each selected component
      selectedComponents.each(function (d) {
        console.log('this::',this, 'd::', d);
      //     // consider any self looping connections
      //     const connections = nfConnection.getComponentConnections(d.id);
      //     $.each(connections, function (_, connection) {
      //         if (!updates.has(connection.id) && nfCanvasUtils.getConnectionSourceComponentId(connection) === nfCanvasUtils.getConnectionDestinationComponentId(connection)) {
      //             var connectionUpdate = nfDraggable.updateConnectionPosition(nfConnection.get(connection.id), delta);
      //             if (connectionUpdate !== null) {
      //                 updates.set(connection.id, connectionUpdate);
      //             }
      //         }
      //     });

          // consider the component itself
          // 구성 요소 자체를 고려한다.
          this.updateComponentPosition(d, delta);
      }.bind(this));

      // nfDraggable.refreshConnections(updates);
    },
    renderProcessors(entered, selected) {
      if (entered.empty()) {
        return entered;
      }

      var processor = entered.append('g')
          .attrs({
              'id': function (d) {
                  return 'id-' + d.id;
              },
              'class': 'processor component'
          })
          .classed('selected', selected)
          .call(nfCanvasUtils.position);

      // processor border
      processor.append('rect')
          .attrs({
              'class': 'border',
              'width': function (d) {
                  return d.dimensions.width;
              },
              'height': function (d) {
                  return d.dimensions.height;
              },
              'fill': 'transparent',
              'stroke': 'transparent'
          });

      // processor body
      processor.append('rect')
          .attrs({
              'class': 'body',
              'width': function (d) {
                  return d.dimensions.width;
              },
              'height': function (d) {
                  return d.dimensions.height;
              },
              'filter': 'url(#component-drop-shadow)',
              'stroke-width': 0
          });

      // processor name
      processor.append('text')
          .attrs({
              'x': 75,
              'y': 18,
              'width': 230,
              'height': 14,
              'class': 'processor-name'
          });

      // processor icon container
      processor.append('rect')
          .attrs({
              'x': 0,
              'y': 0,
              'width': 50,
              'height': 50,
              'class': 'processor-icon-container'
          });

      // processor icon
      processor.append('text')
          .attrs({
              'x': 9,
              'y': 35,
              'class': 'processor-icon'
          })
          .text('\ue807');

      // restricted icon background
      processor.append('circle')
          .attrs({
              'r': 9,
              'cx': 12,
              'cy': 12,
              'class': 'restricted-background'
          });

      // restricted icon
      processor.append('text')
          .attrs({
              'x': 7.75,
              'y': 17,
              'class': 'restricted'
          })
          .text('\uf132');

      // is primary icon background
      processor.append('circle')
          .attrs({
              'r': 9,
              'cx': 38,
              'cy': 36,
              'class': 'is-primary-background'
          });

      // is primary icon
      processor.append('text')
          .attrs({
              'x': 34.75,
              'y': 40,
              'class': 'is-primary'
          })
          .text('P')
          .append('title').text(function (d) {
              return 'This component is only scheduled to execute on the Primary Node';
          });

      // make processors selectable
      // processor.call(nfSelectable.activate).call(nfContextMenu.activate).call(nfQuickSelect.activate);

      return processor;
    },
    /**
     * Update the component's position
     * 구성 요소의 위치 업데이트
     *
     * @param d     The component
     * @param delta The change in position
     * @returns {*}
     */
    updateComponentPosition(d, delta) {
      const newPosition = {
          'x': this.snapEnabled ? (Math.round((d.position.x + delta.x)/this.snapAlignmentPixels) * this.snapAlignmentPixels) : d.position.x + delta.x,
          'y': this.snapEnabled ? (Math.round((d.position.y + delta.y)/this.snapAlignmentPixels) * this.snapAlignmentPixels) : d.position.y + delta.y
      };
      const arr = [{
          'id': 'abc',
          'position': {
            'x': newPosition.x,
            'y': newPosition.y  
          },
          'dimensions': {
            'width': 350,
            'height': 130
          },
          'type': 'processor'
        }]
      d3.select('g.component.selected')
        .remove();
        
      const processorObj = d3.select('#canvas').append('g')
        .classed('processor component', true)
        .attr('id', 'abc')
        .datum(arr[0])
        .attr('transform', d => `translate(${d.position.x}, ${d.position.y})`);
      processorObj.append('rect')
        .classed('border', true)
        .style('fill', 'transparent')
        .attr('width', d => d.dimensions.width)
        .attr('height', d => d.dimensions.height);
        
      processorObj.append('rect')
        .classed('body', true)
        .style('fill', 'yellow')
        .attr('width', d => d.dimensions.width)
        .attr('height', d => d.dimensions.height)
        .attr('filter', 'url(#component-drop-shadow)')
        .attr('stroke-width', 0);
        
      processorObj.call(this.setComponentEvent);
      
      
    },
    activateDrag(component) {
      component.classed('moveable', true).call(this.componentDrag);
    }
  },
  
  created() {
    
  },
  mounted() {
    this.initCanvas();
    this.initComponentDraggable();
  },
  destroyed() {
  }
};
</script>

<style lang="scss">
  .svg_ctl {
    position:absolute;
    top:76px;
    width:100%;
    .section {
      position:absolute;
      width:100%;
      top:0;
      h4 {
        margin: 0;
      }
      #canvas_container {
        position: absolute;
        top: 0;
        left: 0px;
        bottom: 0px;
        right: 0px;
        background-color: #f9fafb;
        background-size: 14px 14px;
        background-image: linear-gradient(to right, rgba(229, 235, 237, 1) 1px, transparent 1px), linear-gradient(to bottom, rgba(229, 235, 237, 1) 1px, transparent 1px);
        z-index: 1;
        overflow: hidden;
      }
      text.add-connect {
        cursor: pointer;
        font-family: flowfont;
        font-size: 28px;
        fill: #004849;
      }
      #menu {
        position: absolute;
        z-index: 2;
        #processor_component_icon {
          width: 50px;
          height: 50px;
          font-size: 32px;
          color: #004849;
          cursor: pointer;
          -ms-touch-action: none;
          touch-action: none;
          -webkit-appearance: button;
          
          &.icon::before {
            font-family: "flowfont";
            font-style: normal;
            font-weight: normal;
            speak: none;
            display: inline-block;
            text-decoration: inherit;
            width: 1em;
            margin-right: .2em;
            text-align: center;
            font-variant: normal;
            text-transform: none;
            line-height: 1em;
            -webkit-font-smoothing: antialiased;
          }
          .svg-inline--fa.fa-w-20 {
            width: 1em;
          }
          &.selected {
            border-color:red;
          }
        }
      }
    }
    .dragging {
      &.component {
        font-family: "flowfont";
        font-style: normal;
        font-weight: normal;
        speak: none;
        display: inline-block;
        text-decoration: inherit;
        width: 1em;
        margin-right: .2em;
        text-align: center;
        font-variant: normal;
        text-transform: none;
        line-height: 1em;
        -webkit-font-smoothing: antialiased;
        .svg-inline--fa.fa-w-20 {
          width: 1em;
        }
      }
    }
    g {
      &.component {
        rect.border {
          stroke-width: 1;
          stroke: rgba(0, 0, 0, 0.25);
        }
        &.selected {
          rect.border {
            stroke: #004849!important;
            stroke-width: 3;
          }
        }
      }
    }
  }
</style>
