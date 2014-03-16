# Waterhouse

![Screenshot](screen.png "Waterhouse")

Waterhouse is an application for dashboard creation and management for [KairosDB](https://code.google.com/p/kairosdb/).

# Status

At present Waterhouse provides a UI for building charts. The ultimate goal is to
facilitate the creation and management of any number of dashboards.

# Features

* Export of PNG, PDF and SVG charts.
* UI for composing charts for KairosDB
* Query aggregation, aggregation chaining and sampling support

# How It Works

Waterhouse proxies requests to KairosDB to avoid any problems with [CORS](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing).
This will become optional in the future.

# TODO

* autocomplete metric & tags
* group by inputs
* tag filtering & exclusion
* time window
* chart options
* dashboard saving
* dashboard browsing
* auto-update
* configurable proxy behavior for KairosDB

# Name

 It is named for
[John William Waterhouse](http://en.wikipedia.org/wiki/John_William_Waterhouse),
the painter of [Gather Ye Rosebuds While Ye May](http://en.wikipedia.org/wiki/Gather_Ye_Rosebuds_While_Ye_May_(Waterhouse_painting_1909)).

# Credits

* [KairosDB](https://code.google.com/p/kairosdb/)
* [Play Framework](http://www.playframework.com/)
* [Bootstrap](http://getbootstrap.com/)
* [jQuery](http://jquery.com/)
* [jQuery.serializeJSON](https://github.com/marioizquierdo/jquery.serializeJSON)
* [Knockout](http://knockoutjs.com/)
* [Highcharts](http://www.highcharts.com/), free for non-profit under the [Creative Commons Attribution-NonCommercial 3.0 License](http://creativecommons.org/licenses/by-nc/3.0/)
