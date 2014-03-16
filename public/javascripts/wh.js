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

    console.log(query);

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
        series: finalData,
        xAxis: {
          type: 'datetime'
        }
      });
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
