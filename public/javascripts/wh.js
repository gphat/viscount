function ChartViewModel() {
  var self = this;
  self.series = ko.observableArray([]);
  self.showAggPanel = ko.observable(false);
  self.maybeAgg = ko.observable(undefined);

  self.series.push({
    name: "",
    aggregations: ko.observableArray([]),
    groupBy: undefined
  });

  self.addAggregate = function(series) {
    var aggForm = $("#aggForm").serializeJSON();
    if(aggForm.name === "sum") {
      var newAgg = {
        name: aggForm.name,
        sampling: {
          value: aggForm.samplingValue,
          unit: aggForm.samplingUnit
        }
      }
      series.aggregations.push(newAgg);
    }
    self.showAggPanel(false);
  }

  self.chart = function() {

    var metrics = [];
    for(var si = 0; si < self.series().length; si++) {
      var series = self.series()[si];

      metrics[si] = {
        name: series.name
      };
      console.log("!!!");
      console.log(series.aggregations());
      if(series.aggregations().length > 0) {
        console.log("ASDASDSD");
        metrics[si].aggregators = series.aggregations()
      }
    }

    var query = {
      start_relative: {
        value: 1,
        unit: "hours"
      },
      metrics: metrics
    }

    console.log(query);

    $.ajax({
      type: "POST",
      url: "/data",
      contentType: "application/json; chartset=utf-8",
      data: JSON.stringify(query),
      dataTpe: "json"
    })
      .done(function(r) {
        console.log(r);
        var data = $.parseJSON(r);

        // We need to find the extents of the total set of all range and domain
        // values.
        var finalData = [];
        var domainExtents = [];
        var rangeExtents = [];
        for(var i = 0; i < data.queries.length; i++) {
          var results = data.queries[i].results;
          for(var j = 0; j < results.length; j++) {
            var vals = results[j].values;
            finalData.push(vals);
            domainExtents = domainExtents.concat(d3.extent(vals, function(d) { return d[0]; }));
            rangeExtents = rangeExtents.concat(d3.extent(vals, function(d) { return d[1]; }));
          }
        }

        var margin = {top: 20, right: 20, bottom: 30, left: 50},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        var domainScale = d3.time.scale()
          .range([0, width])
          .domain(d3.extent(domainExtents));

        var rangeScale = d3.scale.linear()
          .range([height, 0])
          .domain(d3.extent(rangeExtents));

        var xAxis = d3.svg.axis()
            .scale(domainScale)
            .orient("bottom");

        var yAxis = d3.svg.axis()
            .scale(rangeScale)
            .orient("left");

        var line = d3.svg.line()
          .x(function(d, i) {
            return domainScale(d[0])
          })
          .y(function(d, i) {
            return rangeScale(d[1])
          });

        var svg = d3.select("svg").selectAll("path")
          .data(finalData)
          .enter()
          .append("svg:path")
          .attr("d", line)
          .style("fill", "none")
          .style("stroke", "steelblue")
          .style("stroke-width", "2px")
    });
  }

  self.removeAggregate = function(agg, series) {
    series.aggregations.remove(agg);
  }

  self.toggleAggPanel = function() {
    self.showAggPanel(!self.showAggPanel());
    self.maybeAgg(undefined);
  }
}
