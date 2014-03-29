# Viscount

![Screenshot](https://raw.github.com/gphat/viscount/master/shot.png "Viscount")

Viscount is an application for dashboard creation and management for [KairosDB](https://code.google.com/p/kairosdb/).

# Status

At present Viscount provides a UI for building charts. The ultimate goal is to
facilitate the creation and management of any number of dashboards.

# Features

* REST API
* Export of PNG, PDF and SVG charts.
* UI for composing charts for KairosDB
* Query aggregation, aggregation chaining and sampling support
* Metric auto-completion in queries

# How It Works

Viscount proxies requests to KairosDB to avoid any problems with [CORS](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing).
This will become optional in the future.

# Post a Dashboard

```
curl -XPUT "http://localhost:9200/dashboards/dashboard/1" -d @dashboards/dashboard.json
```

# TODO

* UI help & guidance for new users
* autocomplete tags
* group by inputs
* tag filtering & exclusion
* time window in saved dashboards
  * absolute time picker
* chart options
* dashboard saving
* dashboard browsing
* auto-update
* configurable proxy behavior for KairosDB
* auth

# Credits

* [KairosDB](https://code.google.com/p/kairosdb/)
* [Play Framework](http://www.playframework.com/)
* [Bootstrap](http://getbootstrap.com/)
* [jQuery](http://jquery.com/)
* [jQuery.serializeJSON](https://github.com/marioizquierdo/jquery.serializeJSON)
* [Knockout](http://knockoutjs.com/)
* [Highcharts](http://www.highcharts.com/), free for non-profit under the [Creative Commons Attribution-NonCommercial 3.0 License](http://creativecommons.org/licenses/by-nc/3.0/)
