function Series(data) {
  this.metric       = ko.observable(data.metric),
  this.aggregations = ko.observableArray(data.aggregations);
  this.group_by     = ko.observable(data.group_by);
  this.filters      = ko.observable(data.filters);
}

function Timeframe(data) {
  this.id       = ko.observable(data.id);
  this.name     = ko.observable(data.name);
  this.nameI18N = ko.observable(data.nameI18N);
}

function TimeUnit(data) {
  this.id       = ko.observable(data.id);
  this.name     = ko.observable(data.name);
  this.nameI18N = ko.observable(data.nameI18N);
}

function renderChart(chartElem, query, serieses) {
  var metrics = [];
  for(var si = 0; si < serieses.length; si++) {
    var series = ko.toJS(serieses[si]);
    metrics[si] = {
      name: series.metric
    };
    var aggs = series.aggregations
    if(aggs.length > 0) {
      metrics[si].aggregators = aggs
    }
    if(series.filters != null) {
      metrics[si].tags = {};
      // This is a hack to use equal signs as the delimiter of a single
      // name value pair for tag filters.
      var parts = series.filters.split("=");
      metrics[si].tags[parts[0]] = [ parts[1] ]
    }
  }

  query.metrics = metrics;

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

function IndexViewModel(dashes) {
  var self = this;
  self.dashboards = ko.observableArray([]);
  for(var i = 0; i < dashes.hits.hits.length; i++) {
    var dash = dashes.hits.hits[i]._source;
    dash["id"] = dashes.hits.hits[i]._id;
    self.dashboards.push(dash);
  }
}

function DashboardViewModel(dash) {
  var self = this;
  self.dashboard = dash._source;
  self.timeframes = ko.observableArray([]);
  self.timeframe = ko.observable(null);
  self.timeunits = ko.observableArray([]);
  self.absoluteStart = ko.observable(null);
  self.absoluteEnd = ko.observable(null);
  self.relativeUnit = ko.observable("hours");
  self.relativeValue = ko.observable(1);

  $.getJSON("/api/v1/timeframes")
    .done(function(data) {
      self.timeframes($.map(data, function(item) { return new Timeframe(item) }))
    });

  $.getJSON("/api/v1/timeunits")
    .done(function(data) {
      self.timeunits($.map(data, function(item) { return new TimeUnit(item) }))
    });
}

function ChartViewModel(dash, row, col) {
  var self = this;
  self.timeframes = ko.observableArray([]);
  self.timeframe = ko.observable(null);
  self.timeunits = ko.observableArray([]);
  self.absoluteStart = ko.observable(null);
  self.absoluteEnd = ko.observable(null);
  self.relativeUnit = ko.observable("hours");
  self.relativeValue = ko.observable(1);

  $.getJSON("/api/v1/timeframes")
    .done(function(data) {
      self.timeframes($.map(data, function(item) { return new Timeframe(item) }))
    });

  $.getJSON("/api/v1/timeunits")
    .done(function(data) {
      self.timeunits($.map(data, function(item) { return new TimeUnit(item) }))
      self.relativeUnit("hours");
    });

  if(dash == null) {
    self.series = ko.observableArray([]);
  } else {
    self.series = ko.observableArray(
      $.map(dash._source.rows[row].charts[col].series, function(item) { return new Series(item) })
    );
  }
  self.timeframe = ko.observable("relative"); // XXX Look at incoming dashboard
  self.showAggPanel = ko.observable(false);
  self.maybeAgg = ko.observable(undefined);

  self.addSeries = function() {
    self.series.push(new Series({
      metric: "",
      aggregations: [],
      group_by: null,
      filters: null
    }));
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
    var qframe = {};
    if(self.timeframe() === "absolute") {
      qframe.start_absolute = self.absoluteStart();
      qframe.end_absolute = self.absoluteEnd();
    } else {
      qframe.start_relative = {
        "value": self.relativeValue(),
        "unit": self.relativeUnit()
      }
    }
    renderChart('#chart', qframe, self.series());
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
  init: function(element, valueAccessor, allBindings) {
    var value = ko.unwrap(valueAccessor());
    renderChart(element, allBindings().timeframe, valueAccessor().series);
  }
}
