import $ from 'jquery';
import * as d3 from 'd3';

let snapEnabled = true;
let drag = null;

export default {
  init() {
    // handle component drag events
    // 구성 요소 드래그 이벤트 처리
    drag = d3.drag()
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
          const selection = d3.selectAll('.selected');

          // determine the appropriate bounding box
          // 적절한 경계 상자를 결정한다.
          let minX = null, maxX = null, minY = null, maxY = null;
          selection.each(function (d) {
            // console.log('selection.each -> d::',d);
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
            snapEnabled = !d3.event.sourceEvent.shiftKey;
            dragSelection.attr('x', function(d) {
              console.log('dragSelection -> d::', d);
              if(d3.event.dx)
              d.x += d3.event.dx;
              return snapEnabled ? (Math.round(d.x/app.snapAlignmentPixels) * app.snapAlignmentPixels) : d.x;
            }).attr('y', (d) => {
              d.y += d3.event.dy;
              return snapEnabled ? (Math.round(d.y/app.snapAlignmentPixels) * app.snapAlignmentPixels) : d.y;
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
    console.log('delta::',delta);
    // if the component didn't move, return
    if (delta.x === 0 && delta.y === 0) {
        return;
    }

    const selectedConnections = d3.selectAll('g.connection.selected');
    const selectedComponents = d3.selectAll('.selected');

    // // go through each selected connection
    // selectedConnections.each(function (d) {
    //     const connectionUpdate = nfDraggable.updateConnectionPosition(d, delta);
    //     if (connectionUpdate !== null) {
    //         updates.set(d.id, connectionUpdate);
    //     }
    // }.bind(this));

    // // go through each selected component
    selectedComponents.each(function (d) {
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
        // updates.set(d.id, this.updateComponentPosition(d, delta));
    });

    // nfDraggable.refreshConnections(updates);
  },
  activate(components) {
    components.classed('moveable', true).call(drag);
  }
};