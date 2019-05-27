<template>
  <div class="data_ctl">
    <div class="d3_data_1 section">
      <h4>데이터 바인딩</h4>
      <div class="content w_300"></div>
    </div>
    <div class="d3_data_2 section">
      <h4>스케일링</h4>
      <div class="content">
        <div id="linear" class="clear">
          <span>n</span>
          </div>
        <div id="linear-capped" class="clear">
            <span>1 &lt;= a*n + b &lt;= 20</span>
        </div>
        <div id="pow" class="clear"><span>n^2</span></div>
        <div id="pow-capped" class="clear">
            <span>1 &lt;= a*n^2 + b &lt;= 10</span>
        </div>
        <div id="log" class="clear"><span>log(n)</span></div>
        <div id="log-capped" class="clear">
            <span>1 &lt;= a*log(n) + b &lt;= 10</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from '@/components/HelloWorld.vue';
import * as d3 from 'd3';

export default {
  name: 'dataControl',
  data() {
    return {
      interval: null
    };
  },
  methods: {
    arrDataBind() {
      const data = [1, 2, 3, 4, 20, 19, 18, 17, 16, 15];
      const render = (data) => {
        //enter
        d3.select('.d3_data_1 .content').selectAll('div.h-bar')
          .data(data)
          .enter()
          .append('div')
            .attr('class', 'h-bar')
            .append('span');
        
        //update
        d3.select('.d3_data_1 .content').selectAll('div.h-bar')
          .data(data)
          .style('width', d => (d * 3) + 'px')
          .select('span')
            .text(d => d);
        
        //exit
        d3.select('.d3_data_1 .content').selectAll('div.h-bar')
          .data(data)
          .exit()
          .remove();
      }
      
      render(data);
      
      this.interval = setInterval(() => {
        data.shift();
        data.push(Math.round(Math.random() * 100));
        render(data);
      }, 1500);
      
    },
    
    scaling() {
      const max = 11, data = [];
      for (let i = 1; i < max; ++i) data.push(i);
      const linear = d3.scaleLinear() // <-A
        .domain([1, 10]) // <-B
        .range([1, 10]); // <-C        
        
      const linearCapped = d3.scaleLinear()
        .domain([1, 10])        
        .range([1, 20]); // <-D
          
      const pow = d3.scalePow().exponent(2); // <-E
      const powCapped = d3.scalePow() // <-F
        .exponent(2)
        .domain([1, 10])
        .rangeRound([1, 10]); // <-G
          
      const log = d3.scaleLog(); // <-H
      const logCapped = d3.scaleLog() // <-I
        .domain([1, 10])
        .rangeRound([1, 10]);
        
      function render(data, scale, selector) {
          d3.select(selector).selectAll("div.cell")
            .data(data)
            .enter().append("div").classed("cell", true);
            
          d3.select(selector).selectAll("div.cell")
            .data(data)
            .exit().remove();
            
          d3.select(selector).selectAll("div.cell")
            .data(data)
            .style("display", "inline-block")
            .text(function (d) {
              return scale(d) % 1 != 0 ? scale(d).toFixed(2) : scale(d);
            });
      }
      
      render(data, linear, "#linear");
      render(data, linearCapped, "#linear-capped");
      render(data, pow, "#pow");
      render(data, powCapped, "#pow-capped");
      render(data, log, "#log");
      render(data, logCapped, "#log-capped");
    }    
  },
  created() {
    
  },
  mounted() {
    this.arrDataBind();
    this.scaling();
  },
  destroyed() {
    clearInterval(this.interval);
  }
};
</script>

<style lang="scss">
  .data_ctl .section {
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
      margin: 0 auto;
      margin-top: 10px;
      &.w_300 {
       width: 300px; 
      }
    }
    .h-bar {
      background-color: cornflowerblue;
      margin-bottom: 5px;
      &:last-child {
        margin-bottom: 0;
      }
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
    button {
        margin: 0 7px 0 0;
        background-color: #f5f5f5;
        border: 1px solid #dedede;
        border-top: 1px solid #eee;
        border-left: 1px solid #eee;

        font-size: 12px;
        line-height: 130%;
        text-decoration: none;
        font-weight: bold;
        color: #565656;
        cursor: pointer;
    }

    .box {
        width: 200px;
        height: 200px;
        margin: 40px;
        float: left;
        text-align: center;
        border: #969696 solid thin;
        padding: 5px;
    }

    .red {
        background-color: #e9967a;
        color: #f0f8ff;
    }

    .blue {
        background-color: #add8e6;
        color: #f0f8ff;
    }

    .cell {
        min-width: 40px;
        min-height: 20px;
        margin: 5px;
        float: left;
        text-align: center;
        font-size:11px;
        border: #969696 solid thin;
        padding: 5px;
    }

    .fixed-cell {
        min-width: 40px;
        min-height: 20px;
        margin: 5px;
        position: fixed;
        text-align: center;
        border: #969696 solid thin;
        padding: 5px;
    }

    .h-bar {
        min-height: 15px;
        min-width: 10px;
        background-color: steelblue;
        margin-bottom: 2px;
        font-size: 11px;
        color: #f0f8ff;
        text-align: right;
        padding-right: 2px;
    }

    .v-bar {
        min-height: 1px;
        min-width: 30px;
        background-color: #4682b4;
        margin-right: 2px;
        font-size: 10px;
        color: #f0f8ff;
        text-align: center;
        width: 10px;
        display: inline-block;
    }

    .baseline {
        height: 1px;
        background-color: black;
    }

    .clear {
        clear: both;
    }

    .selected {
        background-color: #f08080;
    }

    .control-group {
        padding-top: 10px;
        margin: 10px;
    }

    .table {
        width: 70%;
    }

    .table td, th {
        padding: 5px;
    }

    .table-header {
        background-color: #00AFEF;
        font-weight: bold;
    }

    .table-row-odd {
        background-color: #f0f8ff;
    }

    .table-row-odd {
        background-color: #d3d3d3;
    }

    .code {
        display: inline-block;
        font-style: italic;
        background-color: #d3d3d3;
        border: #969696 solid thin;
        padding: 10px;
        margin-top: 10px;
        margin-bottom: 10px;
    }

    .countdown{
        width: 150px;
        height: 150px;
        font-size: 5em;
        font-weight: bold;
    }

    .axis path, .axis line {
        fill: none;
        stroke: #000;
        shape-rendering: crispEdges;
    }

    .axis text {
        font: 10px sans-serif;
    }

    .axis .grid-line{
        stroke: black;
        shape-rendering: crispEdges;
        stroke-opacity: .2;
    }

    .line{
        fill: none;    
        stroke: steelblue;
        stroke-width: 2;
    }

    .dot {
      fill: #fff;
      stroke: steelblue;
    }

    .area {
        stroke: none;
        fill: steelblue;
        fill-opacity: .2;
    }

    .pie text{
        fill: white;
        font-weight: bold;
    }

    .circle {
        stroke: none;
        fill: red;
        fill-opacity: .7;
    }

    .cross {
        stroke: none;
        fill: blue;
        fill-opacity: .7;
    }

    .diamond {
        stroke: none;
        fill: green;
        fill-opacity: .7;
    }

    .square{
        stroke: none;
        fill: yellow;
        fill-opacity: .7;
    }

    .triangle-down{
        stroke: none;
        fill: blueviolet;
        fill-opacity: .7;
    }

    .triangle-up{
        stroke: none;
        fill: darkred;
        fill-opacity: .7;
    }

    .bubble{
        fill-opacity: .3;
    }

    .bar{
        stroke: none;
        fill: steelblue;
    }
  }
</style>
