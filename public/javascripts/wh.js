function ChartViewModel() {
  var self = this;
  self.series = ko.observableArray([]);
  self.showAggPanel = ko.observable(false);
  self.maybeAgg = ko.observable(undefined);

  self.addSeries = function() {
    self.series.push({
      name: "",
      aggregations: ko.observableArray([]),
      groupBy: undefined
    });
  }

  self.addAggregate = function(series) {
    var aggForm = $("#aggForm").serializeJSON();

    if(aggForm.name !== undefined && aggForm.name) {
      console.log(aggForm.name);
      if(aggForm.name === "div") {
        series.aggregations.push({
          name: aggForm.name,
          divisor: aggForm.divisor
        });
      } else if(aggForm.name === "percentile") {
        series.aggregations.push({
          name: aggForm.name,
          percentile: aggForm.percentile
        });
      } else if(aggForm.name === "rate") {
        series.aggregations.push({
          name: aggForm.name,
          unit: aggForm.unit
        });
      } else if(aggForm.name === "scale") {
        series.aggregations.push({
          name: aggForm.name,
          factor: aggForm.factor
        });
      } else {
        // All the other forms of aggregation
        // have a common sampling use and no arguments.
        series.aggregations.push({
          name: aggForm.name,
          sampling: {
            value: aggForm.samplingValue,
            unit: aggForm.samplingUnit
          }
        });
      }
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
      if(series.aggregations().length > 0) {
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

    $.ajax({
      type: "POST",
      url: "/data",
      contentType: "application/json; chartset=utf-8",
      data: JSON.stringify(query),
      dataTpe: "json"
    })
      .done(function(r) {
        var data = $.parseJSON(r);

        // We need to find the extents of the total set of all range and domain
        // values.
        var finalData = [];
        for(var i = 0; i < data.queries.length; i++) {
          var results = data.queries[i].results;
          for(var j = 0; j < results.length; j++) {
            var vals = results[j].values;
            finalData.push({
              name: results[j].name,
              data: vals
            });
          }
        }

      $("#chart").highcharts({
        plotOptions: {
          series: {
            animation: false
          }
        },
        series: finalData,
        xAxis: {
          type: 'datetime'
        }
      });
    });
  }

  self.removeAggregate = function(agg, series) {
    self.series.aggregations.remove(agg);
  }

  self.removeSeries = function(s) {
    self.series.remove(s);
    if(self.series().length > 0) {
      self.chart();
    }
  }

  self.toggleAggPanel = function() {
    self.showAggPanel(!self.showAggPanel());
    self.maybeAgg(undefined);
  }

  self.addSeries();
}
