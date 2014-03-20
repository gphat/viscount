function renderChart(chartElem, serieses) {

  var metrics = [];
  for(var si = 0; si < serieses.length; si++) {
    var series = serieses[si];
    metrics[si] = {
      name: series.metric
    };
    var aggs = ko.unwrap(series.aggregations)
    if(aggs.length > 0) {
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

      $(chartElem).highcharts({
        plotOptions: {
          series: {
            animation: false
          },
          line: {
            marker: {
              enabled: false,
              states: {
                hover: {
                  radius: 4
                }
              }
            }
          }
        },
        credits: {
          enabled: false
        },
        legend: {
          enabled: false
        },
        series: finalData,
        xAxis: {
          type: 'datetime'
        },
        title: {
          text: null
        }
      });
    });
}

function DashboardViewModel(dash) {
  var self = this;
  self.dashboard = dash._source;
}

function ChartViewModel(dash, row, col) {
  var self = this;
  console.log(dash._source);
  self.series = ko.observableArray(dash._source.rows[row].charts[col].series);
  self.showAggPanel = ko.observable(false);
  self.maybeAgg = ko.observable(undefined);

  self.addSeries = function() {
    self.series.push({
      metric: "",
      aggregations: ko.observableArray([]),
      groupBy: undefined,
      filters: ko.observableArray([])
    });
  }

  self.addAggregate = function(series) {
    var aggForm = $("#aggForm").serializeJSON();

    if(aggForm.name !== undefined && aggForm.name) {
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

  self.removeAggregate = function(agg, series) {
    self.series.aggregations.remove(agg);
  }

  self.removeSeries = function(s) {
    if(self.series().length < 2) {
      // No no no. Should be a message? XXX
      return;
    }
    self.series.remove(s);
    self.chart();
  }

  self.toggleAggPanel = function() {
    self.showAggPanel(!self.showAggPanel());
    self.maybeAgg(undefined);
  }

  self.chart = function() {
    renderChart('#chart', self.series());
  }

  ko.bindingHandlers.typeahead = {
    init: function (element, valueAccessor, allBindingsAccessor) {
      var $e = $(element),
        allBindings = allBindingsAccessor();

      var metrics = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.nonword('name'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        limit: 10,
        prefetch: {
          url: '/metrics',
          filter: function(list) {
            return $.map(list.results, function(metric) { return { name: metric }; });
          }
        }
      });

      metrics.initialize();

      var updateValues = function(datum) {
        $e.change();
      };
      $e.typeahead({
        hint: false,
        highlight: true,
        minLength: 1
      }, {
        name: 'metrics',
        displayKey: 'name',
        source: metrics.ttAdapter()
      }).on('typeahead:selected', function (el, datum) {
        updateValues(datum);
      }).on('typeahead:autocompleted', function (el, datum) {
        updateValues(datum);
      });

      //if KO removes the element via templating, then destroy the typeahead
      ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
        $e.typeahead("destroy");
        $e = null;
      });
    }
  };

  if(self.series().length < 1) {
    self.addSeries();
  } else {
    self.chart();
  }
}

ko.bindingHandlers.chart = {
  init: function(element, valueAccessor) {
    var value = ko.unwrap(valueAccessor());
    renderChart(element, valueAccessor().series);
  }
}
