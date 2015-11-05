/**
 * Created by Reem on 10/23/2015.
 */
define(['exports', 'd3', '../caleydo_d3/d3util'], function (exports, d3, d3utils) {
    //force directed graph
    function drawFDGraph($parent, data, nodes, links, size){
      //todo use size instead
      var width = $parent.node().getBoundingClientRect().width,
        height = $parent.node().getBoundingClientRect().height;
      var svg = $parent.append("svg")
        .attr("width", width)
        .attr("height", height);
      svg = drawGraphNodes(svg, data, nodes, links, width, height);
      return svg;
    }

    function drawGraphNodes(svg, data, nodes_table, links, width, height){
      //todo the value should represent the similarity ?
      /*
      //http://bl.ocks.org/d3noob/5141278
      var nodes = {};

      // Compute the distinct nodes from the links.
      links.forEach(function(link) {
          link.source = nodes[link.source] ||
              (nodes[link.source] = {name: link.source});
          link.target = nodes[link.target] ||
              (nodes[link.target] = {name: link.target});
          link.value = +link.value;
      });
      */

      var force = d3.layout.force()
        .charge(-150)
        .size([width, height])
        //.nodes(d3.values(nodes))
        .nodes(nodes_table)
        .links(links);
        //.start();

      // http://jsdatav.is/visuals.html?id=83515b77c2764837aac2
      // here the value represent the distance -> diff
      force.linkDistance(function(link) {
        return link.value * 3;
      });
      //force.linkDistance(width/2);

      // http://jsdatav.is/visuals.html?id=774d02a21dc1c714def8
      // here the value represent the attraction force? but the distance should be static
      //force.linkStrength(function(link){
         //should return [0,1], 1 is the default which is repulsive
        //todo we assume that the value we get is [0,100]
        //todo better to divide it on the largest value -> do some sort of normalization here
       // return link.value/100;
      //});

      //it's important to start at the end
      force.start();

      var onClick = d3utils.selectionUtil(data, svg, '.node');

      var node = svg.selectAll(".node")
        .data(force.nodes())
        .enter()
        .append("g")
        .attr("class", "node");
        //.call(force.drag);

      var circles = node.append("circle")
        .attr("r", 7)
        .attr("class", "fd-circle")
        .on('click', onClick);

      node.append("text")
        .attr("dx", 10)
        .attr("dy", ".35em")
        .text(function (d, i) {
          return d[0];
        });

      //var onClick = d3utils.selectionUtil(nodes_table, node, 'circle');
      //circles.on('click', function(n){
      //  d3.selectAll(".fd-circle-selected").classed("fd-circle-selected", false);
      //  d3.select(this).classed("fd-circle-selected", true);
      //  //console.log("selected node", n.name);
      //  console.log("selected node", n[0], n[1]);
      //});

      force.on("tick", function () {
        node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
      });
      return node;
    }

    //end of fd graph
    exports.MDSVis = d3utils.defineVis('MDSVis', {
        dim: ['column']
      }, [200, 200],
      function ($parent, data, size) {
        var o = this.options;
        data.data().then(function(nodes){
          drawFDGraph($parent, data, nodes, o.links, size);
        });
        return $parent;
      });

    exports.create = function (data, parent, options) {
      return new exports.MDSVis(data, parent, options);
    };
  }
);
