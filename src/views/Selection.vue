<template>
  <div class="selection">
    <div class="d3_sel_1 section">
      <h4>단일 요소 선택 후 텍스트 추가</h4>
      <div class="content"></div>
    </div>
    <div class="d3_sel_2 section">
      <h4>다중 요소 선택 후 텍스트 추가</h4>
      <div class="content"></div>
      <div class="content"></div>
      <div class="content"></div>
    </div>
    <div class="d3_sel_3 section">
      <h4>함수 연결</h4>
    </div>
    <div class="d3_sel_4 section">
      <h4>원시 선택 조작</h4>
      <table>
        <thead>
          <tr>
            <th>title 1</th>
            <th>title 2</th>
            <th>title 2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>content 1-1</td>
            <td>content 1-2</td>
            <td>content 1-3</td>
          </tr>
          <tr>
            <td>content 2-1</td>
            <td>content 2-2</td>
            <td>content 2-3</td>
          </tr>
          <tr>
            <td>content 3-1</td>
            <td>content 3-2</td>
            <td>content 3-3</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue';
import * as d3 from 'd3';

export default {
  name: 'selection',
  data() {
    return {
      
    };
  },
  methods: {
    singleSelection() {
      d3.select('.d3_sel_1 .content')
        .text('D3.js Example.')
        .style('font-size', '11px');
    },
    
    multiSelection() {
      d3.selectAll('.d3_sel_2 .content')
        .style('font-size', '11px')
        .style('color', 'green')
        .each(function(d, i) {
          d3.select(this)
            .append('p')
            .attr('class', 'text')
            .text('D3.js multiple-selection and append method');
        } );
    },
    
    funcPipeline() {
      const sel3Content = d3.select('.d3_sel_3');
      sel3Content.append('div')
        .attr('class', 'red_box')
        .style('width', '100px')
        .style('height', '50px')
        .append('div')
          .attr('class', 'inner')
          .style('width', '20px')
          .style('height', '20px')
          .attr('class', 'blue_box');
      
      sel3Content.append('div')
        .attr('class', 'red_box')
        .style('width', '100px')
        .style('height', '50px')
        .append('div')
          .attr('class', 'inner')
          .style('width', '20px')
          .style('height', '20px')
          .attr('class', 'blue_box');
    },
    
    selectionCtl() {
      const tableRows = d3.selectAll('.d3_sel_4 tr')['_groups'][0];
      const headerEl = tableRows[0];
      d3.select(headerEl)
        .attr('class', 'table_header');
      d3.select(tableRows[1])
        .attr('class', 'table_odd_row');
      d3.select(tableRows[3])
        .attr('class', 'table_odd_row');
      d3.select(tableRows[2])
        .attr('class', 'table_even_row');
    }
  },
  
  created() {
    
  },
  
  mounted() {
    
    this.singleSelection();
    this.multiSelection();
    this.funcPipeline();
    this.selectionCtl();
   
  }
};
</script>

<style lang="scss">
  .selection .section {
    padding: 10px;
    border: solid 1px gray;
    margin-bottom: 10px;
    &:last-child {
      margin-bottom: 0;
    }
    h4 {
      margin: 0;
    }
    .content {
      margin-top: 10px;
    }
    .red_box {
      margin: 0 auto;
      background-color: red;
      padding: 5px;
      margin-bottom: 5px;
      &:last-child {
        margin-bottom: 0;
      }
    }
    .blue_box {
      background-color: blue;
    }
    table {
      margin: 0 auto;
      width: 300px; 
      border: 1px solid gray;
      padding:5px;
      .table_header th {
        background-color:pink;
      }
      .table_odd_row td{
        background-color: wheat;
      }
      .table_even_row td{
        background-color: cornflowerblue;
      }
    }

  }
  
</style>