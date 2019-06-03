<template>
  <div class="svg_ctl">
    <div class="d3_svg_1 section">
      <div id="canvas_container"></div>
      <div id="menu">
        <button id="processor_component_icon" type="processor" draggable="true" v-on:dragend="componentDragEnd" class="icon"></button>
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
      connectDrag: null,
      snapEnabled: true,
      snapAlignmentPixels: 8,
      connectionContainer: null,
      lineGenerator: null,
      bendPointDrag: null,
      endpointDrag: null,
    };
  },
  methods: {
    config(dimensions) {
      return {
        selfLoopXOffset: (dimensions.width / 2) + 5,
        selfLoopYOffset: 25,
      };
    },
    componentDragEnd(e) {
      console.log(e);
      if(e.layerX < 0 || e.layerY < 0) return;
      const tObj = $(e.target);
      const length = $('.processor.component').length;
      const processorObj = d3.select('#canvas').append('g')
        .classed('processor component', true)
        .attr('id', `abc_${length}`)
        .datum({
          'id': `abc_${length}`,
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
      const connectDrag = this.connectDrag;
      component.on('mousedown', function(e) {
          const pos = d3.mouse(d3.select(this).node());
          
          d3.selectAll('#canvas .component.selected')
            .classed('selected', false);
          d3.select(this)
            .classed('selected', true);
        })
        .classed('connectable', true)
        .on('mouseenter.connectable', function (d) {
          // if (allowConnection()) {
            
            const selection = d3.select(this);
            // ensure the current component supports connection source
            // 현재 구성 요소가 연결 소스를 지원하는지 확인하십시오.
            // if (nfCanvasUtils.isValidConnectionSource(selection)) {
                // see if theres already a connector rendered
                // 커넥터가 이미 렌더링되었는지 확인하십시오.
            const addConnect = d3.select('text.add-connect');
            if (addConnect.empty()) {
              const x = (d.dimensions.width / 2) - 14,
                y = (d.dimensions.height / 2) + 14;
              selection.append('text')
                .datum({
                    origX: x,
                    origY: y
                })
                .call(connectDrag)
                .classed('add-connect', true)
                .attr('transform', function(d) {
                  return `translate(${d.origX}, ${d.origY})`;
                })
                .text('\ue834');
                
            }
            // }
        // }
        })
        .on('mouseleave.connectable', function () {
            // conditionally remove the connector
            // 커넥터를 조건부로 제거하다
            const addConnect = d3.select(this).select('text.add-connect');
            // if (!addConnect.empty() && !addConnect.classed('dragging')) {
            addConnect.remove();
            // }
        })
        // Using mouseover/out to workaround chrome issue #122746
        .on('mouseover.connectable', function () {
            // mark that we are hovering when appropriate
            d3.select(this).classed('hover', true)
        })
        .on('mouseout.connection', function () {
          // remove all hover related classes
          d3.select(this).classed('hover connectable-destination', false);
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
      console.log('vue::',this.$root.$getModuleCanvas());
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
          // // close the hamburger menu if open
          // if($('.md-menu-backdrop').is(':visible') === true){
          //   $('.md-menu-backdrop').click();
          // }
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
        
      // filter for drop shadow
      const connectionFullDropShadowFilter = defs.append('filter')
        .attr('id', 'connection-full-drop-shadow')
        .attr('height', '140%')
        .attr('y', '-20%');

      // blur
      connectionFullDropShadowFilter.append('feGaussianBlur')
        .attr('in', 'SourceAlpha')
        .attr('stdDeviation', 3)
        .attr('result', 'blur')

      // offset
      connectionFullDropShadowFilter.append('feOffset')
        .attr('in', 'blur')
        .attr('dx', 0)
        .attr('dy', 1)
        .attr('result', 'offsetBlur')

      // color/opacity
      connectionFullDropShadowFilter.append('feFlood')
        .attr('flood-color', '#ba554a')
        .attr('flood-opacity', 1)
        .attr('result', 'offsetColor')

      // combine
      connectionFullDropShadowFilter.append('feComposite')
        .attr('in', 'offsetColor')
        .attr('in2', 'offsetBlur')
        .attr('operator', 'in')
        .attr('result', 'offsetColorBlur')

      // stack the effect under the source graph
      // 효과를 소스 그래프 아래에 쌓다
      const connectionFullFeMerge = connectionFullDropShadowFilter.append('feMerge');
      connectionFullFeMerge.append('feMergeNode')
        .attr('in', 'offsetColorBlur');
      connectionFullFeMerge.append('feMergeNode')
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
          // lazily create the drag selection box
          // 끌기 선택 상자를 늦게 만듭니다.
          if (dragSelection.empty()) {
            // get the current selection
            // 현재 선택 항목을 가져옵니다.
            const selection = d3.selectAll('g.component.selected');
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
              .attr('fill', 'transparent')
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
              }.bind(this)).attr('y', function(d) {
                if(d3.event.dy) d.y += d3.event.dy;
                return this.snapEnabled ? (Math.round(d.y/this.snapAlignmentPixels) * this.snapAlignmentPixels) : d.y;
              }.bind(this));
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
    initConnectDraggable() {
      const canvas = this.canvas,
        dimensions = {
          width: 224,
        },
        vue = this;
      
      let origin = null,
        destination = null;
        
      this.connectDrag = d3.drag()
        .subject(function (d) {
            origin = d3.mouse(canvas.node());
            return {
                x: origin[0],
                y: origin[1]
            };
        })
        .on('start', function (d) {
            // stop further propagation
            d3.event.sourceEvent.stopPropagation();

            // unselect the previous components
            d3.selectAll('g.component.selected, g.connection.selected')
              .classed('selected', false);
            // mark the source component has selected
            console.log('parentNode::',d3.select(this.parentNode));
            const source = d3.select(this.parentNode).classed('selected', true);
           
            // mark this component as dragging and selected
            d3.select(this).classed('dragging', true);

            // mark the source of the drag
            const sourceData = source.datum();
            console.log('source::', sourceData);
            // start the drag line and insert it first to keep it on the bottom
            const position = d3.mouse(canvas.node());
            canvas.insert('path', ':first-child')
              .datum({
                'sourceId': sourceData.id,
                'sourceWidth': sourceData.dimensions.width,
                'x': position[0],
                'y': position[1]
              })
              .classed('connector', true)
              .attr('fill', 'transparent')
              .attr('d', function(pathDatum) {
                console.log('pathDatum::', pathDatum);
                return `M${pathDatum.x} ${pathDatum.y}L${pathDatum.x} ${pathDatum.y}`;
              });

            // updates the location of the connection img
            d3.select(this).attr('transform', function () {
                return 'translate(' + position[0] + ', ' + (position[1] + 20) + ')';
            });

            // re-append the image to keep it on top
            canvas.node().appendChild(this);
        })
        .on('drag', function (d) {
          // updates the location of the connection img
          d3.select(this)
            .attr('transform', function () {
              return 'translate(' + d3.event.x + ', ' + (d3.event.y + 50) + ')';
            });

          // mark node's connectable if supported
          destination = d3.select('g.hover').classed('connectable-destination', function () {
            // ensure the mouse has moved at least 10px in any direction, it seems that
            // when the drag event is trigger is not consistent between browsers. as a result
            // some browser would trigger when the mouse hadn't moved yet which caused
            // click and contextmenu events to appear like an attempt to connection the
            // component to itself. requiring the mouse to have actually moved before
            // checking the eligiblity of the destination addresses the issue
            console.log('origin::',origin, (Math.abs(origin[0] - d3.event.x) > 10 || Math.abs(origin[1] - d3.event.y) > 10) &&
                true);
            return (Math.abs(origin[0] - d3.event.x) > 10 || Math.abs(origin[1] - d3.event.y) > 10) &&
                true;
          });
          
          // update the drag line
          d3.select('path.connector').classed('connectable', () => {
            if (destination.empty()) {
              return false;
            }

            // if there is a potential destination, see if its connectable
            return destination.classed('connectable-destination');
          }).attr('d', (pathDatum) => {
            if (!destination.empty() && destination.classed('connectable-destination')) {
              const destinationData = destination.datum();
              console.log('destinationData::', destinationData, 'pathDatum.sourceId::', pathDatum.sourceId);
              // show the line preview as appropriate
              if (pathDatum.sourceId === destinationData.id) {
                const x = pathDatum.x,
                  y = pathDatum.y,
                  componentOffset = pathDatum.sourceWidth / 2,
                  xOffset = vue.config(dimensions).selfLoopXOffset,
                  yOffset = vue.config(dimensions).selfLoopYOffset;
                return 'M' + x + ' ' + y + 'L' + (x + componentOffset + xOffset) + ' ' + (y - yOffset) + 'L' + (x + componentOffset + xOffset) + ' ' + (y + yOffset) + 'Z';
              } else {
                // get the position on the destination perimeter
                const end = vue.getPerimeterPoint(pathDatum, {
                  'x': destinationData.position.x,
                  'y': destinationData.position.y,
                  'width': destinationData.dimensions.width,
                  'height': destinationData.dimensions.height
                });

                // direct line between components to provide a 'snap feel'
                return 'M' + pathDatum.x + ' ' + pathDatum.y + 'L' + end.x + ' ' + end.y;
              }
            } else {
              return 'M' + pathDatum.x + ' ' + pathDatum.y + 'L' + d3.event.x + ' ' + d3.event.y;
            }
          });
        })
        .on('end', function (d) {
          // stop further propagation
          d3.event.sourceEvent.stopPropagation();

          // get the add connect img
          const addConnect = d3.select(this);
          console.log('addConnect::', addConnect);
          // get the connector, if it the current point is not over a new destination
          // the connector will be removed. otherwise it will be removed after the
          // connection has been configured/cancelled
          const connector = d3.select('path.connector');
          const connectorData = connector.datum();
          console.log('connector data::', connectorData);
          // get the destination
          const destination = d3.select('g.connectable-destination');

          // we are not over a new destination
          if (destination.empty()) {
            // get the source to determine if we are still over it
            const source = d3.select(`#${connectorData.sourceId}`);
            console.log('sourceEl::',source);
            const sourceData = source.datum();
            console.log('sourceData::',sourceData);
            // get the mouse position relative to the source
            const position = d3.mouse(source.node());

            // if the position is outside the component, remove the add connect img
            // 위치가 구성 요소 외부에 있으면 추가 연결 img을 제거하십시오.
            if (position[0] < 0 || position[0] > sourceData.dimensions.width || position[1] < 0 || position[1] > sourceData.dimensions.height) {
              addConnect.remove();
            } else {
              // reset the add connect img by restoring the position and place in the DOM
              // DOM에 위치와 위치를 복원하여 연결 추가 img 재설정
              addConnect.classed('dragging', false).attr('transform', () => {
                return 'translate(' + d.origX + ', ' + d.origY + ')';
              });
              source.node().appendChild(this);
            }

            // remove the connector
            connector.remove();
          } else {
            // remove the add connect img
            addConnect.remove();

            // create the connection
            // const destinationData = destination.datum();
            // nfConnectionConfiguration.createConnection(connectorData.sourceId, destinationData.id);
            vue.renderConnections();
              
          }
        });
    },
    renderConnections() {
      const connection = this.connectionContainer.append('g')
        .attr('id', d => 'abc_0_to_abc_1')
        .attr('class', 'connection')
        .classed('selected', true);

      // create a connection between the two components 
      // 두 구성 요소 사이에 연결고리를 만들다.
      connection.append('path')
        .attr('pointer-events', 'none')
        .classed('connection-path', true);

      // path to show when selection
      // 선택시 표시할 경로
      connection.append('path')
        .attr('pointer-events', 'none')
        .classed('connection-selection-path', true);

      // path to make selection easier
      // 선택하기 쉬운 경로
      connection.append('path')
        .attr('pointer-events', 'stroke')
        .classed('connection-path-selectable', true)
        .on('mousedown.selection', function () {
          // select the connection when clicking the selectable path
          // 선택 가능한 경로를 클릭할 때 연결을 선택합니다
          // nfSelectable.select(d3.select(this.parentNode));
          // only need to update selection if necessary
          const parentNode = d3.select(this.parentNode);
          if (!parentNode.classed('selected')) {
            // since we're not appending, deselect everything else
            if (!d3.event.shiftKey) {
              d3.selectAll('g.selected').classed('selected', false);
            }

            // update the selection
            parentNode.classed('selected', true);
          } else {
            // we are currently selected, if shift key the deselect
            if (d3.event.shiftKey) {
              parentNode.classed('selected', false);
            }
          }
          // update URL deep linking params
          // URL 깊은 연결 매개 변수 업데이트
          // nfCanvasUtils.setURLParameters();
        });
        // .call(nfContextMenu.activate);
        
        connection.select('path.connection-path-selectable')
          .on('dblclick', function (d) {
            var position = d3.mouse(this.parentNode);

            // find where to put this bend point
            //이 굴곡 점을 넣을 위치를 찾습니다.
            var bendIndex = getNearestSegment({
                'x': position[0],
                'y': position[1]
            }, d);

            // copy the original to restore if necessary
            // 필요한 경우 원본을 복사하여 복원합니다.
            var bends = d.component.bends.slice();

            // add it to the collection of points
            // 그것을 포인트 콜렉션에 추가한다.
            bends.splice(bendIndex, 0, {
                'x': position[0],
                'y': position[1]
            });

            var connection = {
                id: d.id,
                bends: bends
            };

            // update the label index if necessary
            // 필요한 경우 레이블 색인을 업데이트합니다.
            var labelIndex = d.component.labelIndex;
            if (bends.length === 1) {
                connection.labelIndex = 0;
            } else if (bendIndex <= labelIndex) {
                connection.labelIndex = labelIndex + 1;
            }

            // save the new state
            // 새 상태 저장
            save(d, connection);

            d3.event.stopPropagation();
              
          });
    },
    /**
     * Calculates the point on the specified bounding box that is closest to the
     * specified point.
     * 지정된 점에 가장 가까운 지정된 경계 상자의 점을 계산합니다.
     *
     * @param {object} p            The point
     * @param {object} bBox         The bounding box
     */
    getPerimeterPoint(p, bBox) {
      // calculate theta
      // 세타 계산
      const theta = Math.atan2(bBox.height, bBox.width);

      // get the rectangle radius
      // 직사각형 반경을 얻는다.
      const xRadius = bBox.width / 2;
      const yRadius = bBox.height / 2;

      // get the center point
      // 중심점을 얻다.
      const cx = bBox.x + xRadius;
      const cy = bBox.y + yRadius;

      // calculate alpha
      // 알파를 계산하다
      const dx = p.x - cx;
      const dy = p.y - cy;
      let alpha = Math.atan2(dy, dx);
      
      const TWO_PI = 2 * Math.PI;
      
      // normalize aphla into 0 <= alpha < 2 PI
      // aphla를 0 <= alpha <2로 정규화
      alpha = alpha % TWO_PI;
      if (alpha < 0) {
          alpha += TWO_PI;
      }

      // calculate beta
      // 베타 계산하다
      const beta = (Math.PI / 2) - alpha;

      // detect the appropriate quadrant and return the point on the perimeter
      // 적절한 사분면을 검출하고 주변상의 점을 되 돌린다.
      if ((alpha >= 0 && alpha < theta) || (alpha >= (TWO_PI - theta) && alpha < TWO_PI)) {
        // right quadrant
        // 오른쪽 사분면
        return {
          'x': bBox.x + bBox.width,
          'y': cy + Math.tan(alpha) * xRadius
        };
      } else if (alpha >= theta && alpha < (Math.PI - theta)) {
        // bottom quadrant
        // 하단 사분면
        return {
          'x': cx + Math.tan(beta) * yRadius,
          'y': bBox.y + bBox.height
        };
      } else if (alpha >= (Math.PI - theta) && alpha < (Math.PI + theta)) {
        // left quadrant
        // 왼쪽 사분면
        return {
          'x': bBox.x,
          'y': cy - Math.tan(alpha) * xRadius
        };
      } else {
        // top quadrant
        // 상단 사분면
        return {
          'x': cx - Math.tan(beta) * yRadius,
          'y': bBox.y
        };
      }
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
          'id': `abc_${d.id}`,
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
        
      const processorObj = d3.select('g.component.selected')
        .datum(arr[0])
        .attr('transform', d => `translate(${newPosition.x}, ${newPosition.y })`);
    },
    activateDrag(component) {
      console.log('component drag::', component);
      component.classed('moveable', true).call(this.componentDrag);
    },
    initConnections() {
      // create the connection container
      this.connectionContainer = this.canvas.append('g')
        .attr('pointer-events', 'stroke')
        .attr('class', 'connections');
        

      // define the line generator
      // 라인 제너레이터 정의
      this.lineGenerator = d3.line()
        .x(function (d) {
          return d.x;
        })
        .y(function (d) {
          return d.y;
        })
        .curve(d3.curveLinear);
        
      let snapEnabled = null;
      const snapAlignmentPixels = this.snapAlignmentPixels;
      // handle bend point drag events
      // 벤드 포인트 드래그 이벤트 처리
      this.bendPointDrag = d3.drag()
        .on('start', function () {
          // stop further propagation
          // 추가 전달 중지
          d3.event.sourceEvent.stopPropagation();
        })
        .on('drag', function (d) {
          snapEnabled = !d3.event.sourceEvent.shiftKey;
          d.x = snapEnabled ? (Math.round(d3.event.x/snapAlignmentPixels) * snapAlignmentPixels) : d3.event.x;
          d.y = snapEnabled ? (Math.round(d3.event.y/snapAlignmentPixels) * snapAlignmentPixels) : d3.event.y;

          // redraw this connection
          //이 연결을 다시 그립니다.
          d3.select(this.parentNode).call(updateConnections, {
            'updatePath': true,
            'updateLabel': false
          });
        })
        .on('end', function () {
          const connection = d3.select(this.parentNode),
            connectionData = connection.datum(),
            bends = connection.selectAll('rect.midpoint').data();

          // ensure the bend lengths are the same
          // 굽힘 길이가 동일한지 확인하십시오.
          if (bends.length === connectionData.component.bends.length) {
            // determine if the bend points have moved
            // 굽힘 포인트가 움직 였는지 판단
            let different = false;
            const leng = bends.length;
            for (let i = 0; i < leng && !different; i++) {
              if (bends[i].x !== connectionData.component.bends[i].x || bends[i].y !== connectionData.component.bends[i].y) {
                different = true;
              }
            }

            // // only save the updated bends if necessary
            // // 필요한 경우 업데이트 된 굴곡부 만 저장합니다.
            // if (different) {
            //   save(connectionData, {
            //     id: connectionData.id,
            //     bends: bends
            //   }).fail(function () {
            //     // restore the previous bend points
            //     // 이전의 절곡 점 복원
            //     connectionData.bends = $.map(connectionData.component.bends, function (bend) {
            //       return {
            //           x: bend.x,
            //           y: bend.y
            //       };
            //     });

            //     // refresh the connection
            //     // 연결 새로 고침
            //     connection.call(updateConnections, {
            //         'updatePath': true,
            //         'updateLabel': false
            //     });
            //   });
            // }
          }

          // stop further propagation
          // 추가 전달 중지
          d3.event.sourceEvent.stopPropagation();
        });

      // handle endpoint drag events
      // 끝점 드래그 이벤트를 처리합니다.
      this.endpointDrag = d3.drag()
        .on('start', function (d) {
          // indicate that dragging has begun
          // 드래그가 시작되었음을 나타냅니다.
          d.dragging = true;

          // stop further propagation
          // 추가 전달 중지
          d3.event.sourceEvent.stopPropagation();
        })
        .on('drag', function (d) {
          d.x = d3.event.x - 8;
          d.y = d3.event.y - 8;

          // ensure the new destination is valid
          // 새 대상이 유효한지 확인합니다.
          d3.select('g.hover').classed('connectable-destination', function () {
            return nfCanvasUtils.isValidConnectionDestination(d3.select(this));
          });

          // redraw this connection
          //이 연결을 다시 그립니다.
          d3.select(this.parentNode).call(updateConnections, {
            'updatePath': true,
            'updateLabel': false
          });
        })
        .on('end', function (d) {
          // indicate that dragging as stopped
          // 드래그가 중지됨을 나타냅니다.
          d.dragging = false;

          // get the corresponding connection
          // 해당 연결을 가져옵니다.
          var connection = d3.select(this.parentNode);
          var connectionData = connection.datum();
          var previousDestinationComponentId = this.getConnectionDestinationComponentId(connectionData);

          // attempt to select a new destination
          // 새 대상을 선택하려고 시도합니다.
          var destination = d3.select('g.connectable-destination');

          // resets the connection if we're not over a new destination
          // 우리가 새로운 목적지를 넘지 않는다면 연결을 재설정합니다.
          if (destination.empty()) {
            connection.call(updateConnections, {
              'updatePath': true,
              'updateLabel': false
            });
          } else {
            // // prompt for the new port if appropriate
            // // 적절한 경우 새 포트를 묻습니다.
            // if (nfCanvasUtils.isProcessGroup(destination) || nfCanvasUtils.isRemoteProcessGroup(destination)) {
            //   // user will select new port and updated connect details will be set accordingly
            //   // 사용자가 새 포트를 선택하고 그에 따라 업데이트 된 연결 세부 정보가 설정됩니다.
            //   nfConnectionConfiguration.showConfiguration(connection, destination).done(function () {
            //     // reload the previous destination
            //     // 이전 대상을 다시로드합니다.
            //     nfCanvasUtils.reloadConnectionSourceAndDestination(null, previousDestinationComponentId);
            //   }).fail(function () {
            //     // reset the connection
            //     connection.call(updateConnections, {
            //       'updatePath': true,
            //       'updateLabel': false
            //     });
            //   });
            // } else {
                // get the destination details
                // 목적지 세부 정보를 얻으십시오.
                var destinationData = destination.datum();
                var destinationType = nfCanvasUtils.getConnectableTypeForDestination(destination);

                var connectionEntity = {
                  'revision': nfClient.getRevision(connectionData),
                  'disconnectedNodeAcknowledged': nfStorage.isDisconnectionAcknowledged(),
                  'component': {
                    'id': connectionData.id,
                    'destination': {
                      'id': destinationData.id,
                      'groupId': nfCanvasUtils.getGroupId(),
                      'type': destinationType
                    }
                  }
                };

                // if this is a self loop and there are less than 2 bends, add them
                // 이것이 자기 루프이고 굴곡이 2 개 미만인 경우 추가하십시오
                if (connectionData.bends.length < 2 && connectionData.sourceId === destinationData.id) {
                    var rightCenter = {
                      x: destinationData.position.x + (destinationData.dimensions.width),
                      y: destinationData.position.y + (destinationData.dimensions.height / 2)
                    };
                    var xOffset = nfConnection.config.selfLoopXOffset;
                    var yOffset = nfConnection.config.selfLoopYOffset;

                    connectionEntity.component.bends = [];
                    connectionEntity.component.bends.push({
                      'x': (rightCenter.x + xOffset),
                      'y': (rightCenter.y - yOffset)
                    });
                    connectionEntity.component.bends.push({
                      'x': (rightCenter.x + xOffset),
                      'y': (rightCenter.y + yOffset)
                    });
                }

                $.ajax({
                    type: 'PUT',
                    url: connectionData.uri,
                    data: JSON.stringify(connectionEntity),
                    dataType: 'json',
                    contentType: 'application/json'
                }).done(function (response) {
                    var updatedConnectionData = response.component;

                    // refresh to update the label
                    // 새로 고침하여 레이블을 업데이트하십시오.
                    nfConnection.set(response);

                    // reload the previous destination and the new source/destination
                    // 이전 대상 및 새 소스 / 대상을 다시로드하십시오.
                    nfCanvasUtils.reloadConnectionSourceAndDestination(null, previousDestinationComponentId);

                    var sourceComponentId = nfCanvasUtils.getConnectionSourceComponentId(response);
                    var destinationComponentId = nfCanvasUtils.getConnectionSourceComponentId(response);
                    nfCanvasUtils.reloadConnectionSourceAndDestination(sourceComponentId, destinationComponentId);
                }).fail(function (xhr, status, error) {
                    if (xhr.status === 400 || xhr.status === 401 || xhr.status === 403 || xhr.status === 404 || xhr.status === 409) {
                        nfDialog.showOkDialog({
                            headerText: 'Connection',
                            dialogContent: nfCommon.escapeHtml(xhr.responseText)
                        });

                        // reset the connection
                        connection.call(updateConnections, {
                            'updatePath': true,
                            'updateLabel': false
                        });
                    } else {
                        nfErrorHandler.handleAjaxError(xhr, status, error);
                    }
                });
            // }
          }

          // stop further propagation
          // 추가 전파를 중지
          d3.event.sourceEvent.stopPropagation();
        }.bind(this));
    },
    /* Returns the component id of the source of this processor. If the connection is attached
    * to a port in a [sub|remote] group, the component id will be that of the group. Otherwise
    * it is the component itself.
    * 이 프로세서의 소스의 컴퍼넌트 ID를 돌려줍니다. 연결이 [sub | remote] 그룹의 포트에 연결되면 구성 요소 ID는 그룹의 ID가됩니다. 그렇지 않으면 구성 요소 자체입니다.
    *
    * @param {object} connection   The connection in question
    */
    getConnectionDestinationComponentId: function (connection) {
      var destinationId = connection.destinationId;
      if (connection.destinationGroupId !== nfCanvas.getGroupId()) {
        destinationId = connection.destinationGroupId;
      }
      return destinationId;
    },
  },
  
  created() {
    
  },
  mounted() {
    this.initCanvas();
    this.initComponentDraggable();
    this.initConnectDraggable();
    this.initConnections();
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
            content: '\e815';
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
    
    text {
      &.add-connect {
        cursor: pointer;
        font-family: flowfont;
        font-size: 28px;
        fill: #004849;
      }
    }
    /*
    * Licensed to the Apache Software Foundation (ASF) under one or more
    * contributor license agreements.  See the NOTICE file distributed with
    * this work for additional information regarding copyright ownership.
    * The ASF licenses this file to You under the Apache License, Version 2.0
    * (the "License"); you may not use this file except in compliance with
    * the License.  You may obtain a copy of the License at
    *
    *     http://www.apache.org/licenses/LICENSE-2.0
    *
    * Unless required by applicable law or agreed to in writing, software
    * distributed under the License is distributed on an "AS IS" BASIS,
    * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    * See the License for the specific language governing permissions and
    * limitations under the License.
    */
    /*
        Graph Styles
    */

    #canvas-container {
        position: absolute;
        top: 88px;
        left: 0px;
        bottom: 0px;
        right: 0px;
        background-color: #f9fafb;
        background-size: 14px 14px;
        background-image: linear-gradient(to right, rgba(229, 235, 237, 1) 1px, transparent 1px), linear-gradient(to bottom, rgba(229, 235, 237, 1) 1px, transparent 1px);
        z-index: 1;
        overflow: hidden;
    }

    .tooltip {
        padding: 10px;
        display: none;
        position: absolute;
        z-index: 1000;
    }

    /* svg styles */

    text.unset {
        font-style: italic;
        font-weight: normal;
        fill: #aaa;
    }

    .moveable {
        cursor: pointer;
    }

    /*
        All components
    */

    g.component {
        font-family: Roboto;
    }

    g.component rect.body {
        fill: #ffffff;
    }

    g.component rect.body.unauthorized {
        fill: #f4f6f7;
    }

    g.component rect.border {
        stroke: rgba(0,0,0,0.25);
        stroke-width: 1;
    }

    g.component rect.border.unauthorized {
        stroke-width: 3;
        stroke: #ba554a !important;
        stroke-dasharray: 4;
    }

    g.component rect.border.ghost {
        stroke-width: 3;
        stroke: #aaaaaa !important;
        stroke-dasharray: 4;
    }

    g.component rect.processor-icon-container.unauthorized {
        fill: #f4f6f7 !important;
    }

    g.component.selected rect.border {
        stroke: #004849 !important;
        stroke-width: 3;
    }

    text.stats-label {
        fill: #262626;
        font-size: 12px;
        font-family: Roboto Slab;
    }

    text.stats-value {
        fill: #775351;
        font-size: 12px;
        font-weight: bold;
    }

    text.stats-value tspan.size, text.stats-value tspan.size {
        font-weight: normal;
    }

    text.stats-info {
        fill: #728E9B;
        font-size: 12px;
    }

    text.bulletin-icon {
        font-size: 13px;
        font-family: FontAwesome;
        fill: #ffffff;
    }

    rect.bulletin-background {
        fill: #ba554a;
    }

    text.active-thread-count-icon {
        font-family: flowfont;
        font-size: 12px;
        fill: #728e9b;
        text-anchor: end;
    }

    text.active-thread-count {
        fill: #775351;
        font-size: 12px;
        font-weight: bold;
    }

    path.component-comments {
        fill: #000;
        stroke: #000;
    }

    text.spin {
        -webkit-animation-name: rotate;
        -webkit-animation-duration: 2s;
        -webkit-animation-iteration-count: infinite;
        -webkit-animation-timing-function: linear;
        -moz-animation-name: rotate;
        -moz-animation-duration: 2s;
        -moz-animation-iteration-count: infinite;
        -moz-animation-timing-function: linear;
        animation-name: rotate;
        animation-duration: 2s;
        animation-iteration-count: infinite;
        animation-timing-function: linear;
    }

    @-webkit-keyframes rotate {
        from {
            -webkit-transform: rotate(0deg);
        }
        to {
            -webkit-transform: rotate(360deg);
        }
    }

    @-moz-keyframes rotate {
        from {
            -moz-transform: rotate(0deg);
        }
        to {
            -moz-transform: rotate(360deg);
        }
    }

    @keyframes rotate {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    /*
        Selection
    */

    g.component.connectable-destination rect.border {
        stroke: #00ff00;
        stroke-width: 3;
    }

    rect.component-selection, rect.drag-selection, rect.label-drag {
        stroke: #444444;
        stroke-opacity: 0.5;
        fill: transparent;
    }

    text.add-connect {
        cursor: pointer;
        font-family: flowfont;
        font-size: 28px;
        fill: #004849;
    }

    /*
        Processor
    */

    text.processor-name {
        fill: #262626;
        font-size: 14px;
    }

    text.processor-type {
        fill: #728e9b;
        font-size: 12px;
    }

    text.processor-bundle {
        fill: #666;
        font-size: 10px;
    }

    rect.processor-icon-container {
        fill: #ffffff;
    }

    text.processor-icon {
        font-family: flowfont;
        font-size: 30px;
    }

    circle.restricted-background, circle.is-primary-background {
        visibility: hidden;
        fill: rgba(255, 255, 255, 0.90);
    }

    text.restricted {
        visibility: hidden;
        font-family: FontAwesome;
        font-size: 12px;
        fill: #ba554a;
    }

    text.is-primary {
        visibility: hidden;
        font-size: 12px;
        font-weight: bold;
    }

    text.run-status-icon {
        font-size: 14px;
        transform-origin: 62px 18px 0;
    }

    /*
        Connection
    */

    g.connection {
        font-family: Roboto;
    }

    g.connection rect.body {
        fill: #ffffff;
    }

    g.connection rect.body.unauthorized {
        fill: #f4f6f7;
    }

    g.connection rect.border.unauthorized {
        stroke-width: 1.5;
        stroke: #ba554a;
        stroke-dasharray: 3,3;
    }

    g.connection rect.border.full {
        stroke: rgba(186, 85, 74, 0.65);
        stroke-width: 1;
    }

    g.connection.selected rect.border {
        /*stroke: #004849;*/
        stroke: #ffcc00;
        stroke-width: 3;
    }

    path.connector {
        fill: none;
        pointer-events: none;
        stroke: #ff0000;
        stroke-width: 3;
        stroke-opacity: 0.5;
        stroke-dasharray: 2;
    }

    path.connector.connectable {
        stroke: #00ff00;
        stroke-width: 3;
        stroke-dasharray: 4;
    }

    g.connection path.connection-path {
        fill: none;
        stroke: #000000;
        stroke-width: 2;
        cursor: pointer;
    }

    g.connection path.connection-path.full {
        stroke: #ba554a;
    }

    g.connection path.connection-path.unauthorized {
        stroke: #ba554a;
        stroke-dasharray: 3,3;
    }

    text.connection-from-run-status, text.connection-to-run-status, text.expiration-icon, text.load-balance-icon {
        fill: #728e9b;
        font-family: FontAwesome;
        font-size: 12px;
        text-shadow: 0 0 4px rgba(255,255,255,1);
    }

    text.load-balance-icon-active {
        fill: #44a3cf
    }

    text.load-balance-icon-184 {
        transform-origin: 197px 10px 0;
    }

    text.load-balance-icon-200 {
        transform-origin: 213px 10px 0;
    }

    text.connection-from-run-status.is-missing-port, text.connection-to-run-status.is-missing-port {
        fill: #cf9f5d;
    }

    g.connection rect.backpressure-tick {
        fill: #3e3e3e;
    }

    g.connection rect.backpressure-tick.not-configured {
        fill: #acacac;
    }

    g.connection rect.backpressure-object, g.connection rect.backpressure-data-size {
        fill: #d8d8d8;
    }

    g.connection rect.backpressure-object.not-configured, g.connection rect.backpressure-data-size.not-configured {
        fill: transparent;
    }

    g.connection rect.backpressure-percent {
        fill: #67b796;
        pointer-events: none;
    }

    g.connection rect.backpressure-percent.warning {
        fill: #cea958;
    }

    g.connection rect.backpressure-percent.error {
        fill: #ba554a;
    }

    /* grouped connection */

    g.connection.grouped path.connection-path, g.connection.grouped rect.connection-label {
        stroke-width: 3;
    }

    /* ghost connection */

    g.connection.ghost path.connection-path, g.connection.ghost rect.connection-label {
        stroke: #aaaaaa;
        stroke-dasharray: 4;
    }

    g.connection path.connection-selection-path {
        visibility: hidden;
        stroke-width: 1;
        stroke: #ffcc00;
        fill: none;
    }

    g.connection path.connection-path-selectable {
        visibility: hidden;
        stroke-width: 20;
        fill: none;
        cursor: pointer;
    }

    g.connection.selected path.connection-selection-path {
        visibility: visible;
    }

    g.connection rect.linepoint {
        visibility: hidden;
        stroke-width: 1;
    }

    g.connection.selected rect.linepoint {
        visibility: visible;
    }

    g.connection rect.startpoint {
        stroke: #ff0000;
        fill: #ff0000;
    }

    g.connection rect.midpoint {
        stroke: #ffcc00;
        fill: #ffcc00;
        cursor: pointer;
    }

    g.connection rect.endpoint {
        stroke: #0000ff;
        fill: #0000ff;
        cursor: pointer;
    }

    /* labels */

    g.label rect.labelpoint {
        display: none;
        stroke-width: 1;
        stroke: #ffcc00;
        fill: #ffcc00;
        cursor: se-resize;
    }

    g.label.selected rect.labelpoint {
        display: block;
    }

    /* funnels */

    text.funnel-icon {
        fill: #ad9897;
        font-family: flowfont;
        font-size: 30px;
    }

    /* ports */

    text.port-name {
        fill: #262626;
        font-size: 14px;
    }

    text.port-icon {
        fill: #ad9897;
        font-family: flowfont;
        font-size: 30px;
    }

    text.port-transmission-icon {
        font-size: 15px;
        fill: #728e9b
    }

    /* active thread count */

    text.active-thread-count {
        font-size: 10px;
    }

    /* process groups */

    text.process-group-name {
        fill: #262626;
        font-size: 14px;
    }

    text.version-control {
        font-family: FontAwesome;
        font-size: 18px;
        text-shadow: 0 0 4px rgba(255,255,255,1);
        visibility: hidden;
    }

    text.process-group-contents-count {
        fill: #775351;
        font-size: 15px;
        font-weight: 500;
        font-family: Roboto, sans-serif;
    }

    g.process-group.drop rect.border {
        stroke: #0000ff;
        stroke-width: 3;
    }

    text.process-group-contents-icon {
        font-size: 15px;
        fill: #728e9b;
    }

    /* remote process group */

    text.remote-process-group-name {
        fill: #262626;
        font-size: 14px;
    }

    text.remote-process-group-uri {
        fill: #004849;
        font-size: 12px;
    }

    text.remote-process-group-transmission-status {
        font-size: 15px;
        fill: #728e9b
    }

    text.remote-process-group-transmission-secure {
        font-family: FontAwesome;
        font-size: 13px;
        fill: #004849;
    }

    text.remote-process-group-last-refresh {
        fill: #728e9b;
    }
  }
</style>
