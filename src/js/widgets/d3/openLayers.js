// Openlayers Map widget
var openLayers = {
    // Widget name.
    name: "Open Street Map",
    // Widget description.
    description: "An Openlayers Map that shows shapes info",
    // Path to the image of the widget.
    img: "img/widgets/widgetMap.png",
    // Type of the widget.
    type: "openLayers",
    // Help display on the widget
    help: "OpenLayersMap help",
    // Category of the widget (1: textFilter, 2: numericFilter, 3: graph, 5:results, 4: other, 6:map)
    cat: 6,

    render: function (loc) {

        loc = typeof loc !== 'undefined' ? loc : "Left";

        var id = 'A' + Math.floor(Math.random() * 10001);
        var configid = 'A' + Math.floor(Math.random() * 10001);
        var field = openLayers.field || "";
        var properties = {
            "id": ko.observable(id),
            "configid": ko.observable(configid),
            "title": ko.observable(openLayers.name),
            "type": ko.observable(openLayers.type),
            "field": ko.observable(field),
            "collapsed": ko.observable(false),
            "showWidgetHelp": ko.observable(false),
            "help": ko.observable(openLayers.help),
            "showWidgetConfiguration": ko.observable(false)
        };
        vm.addNewWidget(properties, loc);

        openLayers.paintConfig(configid);
        openLayers.paint(id);
    },

    paintConfig: function (configid) {
        d3.select('#' + configid).selectAll('div').remove();
        var div = d3.select('#' + configid);
        div.attr("align", "center");

    },

    paint: function (id) {
        d3.select('#' + id).selectAll('div').remove();
        var div = d3.select('#' + id);
        div.attr("align", "center");

        //Elements for showing
        if (vm.sparql) {
            var data = vm.filteredData();
        } else {
            var data = vm.filteredData();
        }

        //Update filtered polygons
        var geometries = new Array();
        var geojson = new Object();
        //supplied by sparql-geojson on https://github.com/erfgoed-en-locatie/sparql-geojson
        geojson = sparqlToGeoJSON(vm.filteredData(), false);

        //Create the map div
        var map_div = div.append("div")
            .attr("id", "layersmap")
            .attr("style", "height:400px");

        layersmap = new OpenLayers.Map('layersmap');

        //OpenStreetMap
        osm = new OpenLayers.Layer.OSM("");
        layersmap.addLayer(osm);

        //BasicLayer
        //layer = new OpenLayers.Layer.WMS("OpenLayers WMS",
        //    "http://vmap0.tiles.osgeo.org/wms/vmap0", {
        //        layers: 'basic'
        //    });
        //layersmap.addLayer(layer);

        // markers
        var markers = new OpenLayers.Layer.Markers("Markers");
        var size = new OpenLayers.Size(21, 25);
        var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
        var icon = new OpenLayers.Icon('http://dev.openlayers.org/img/marker.png', size, offset);

        $.each(data, function (index, item) {
            markers.addMarker(new OpenLayers.Marker(new OpenLayers.LonLat(item.long.value(), item.lat.value()).transform('EPSG:4326', layersmap.getProjectionObject().projCode), icon.clone()));
        });

        layersmap.addLayer(markers);

        // Transform polyons projection
        var geojson_format = new OpenLayers.Format.GeoJSON({
            internalProjection: layersmap.getProjectionObject().projCode,
            externalProjection: new OpenLayers.Projection("EPSG:32628")
        });

        // Not transform polygons projection
        var vector_layer = new OpenLayers.Layer.Vector();
        layersmap.addLayer(vector_layer);
        vector_layer.addFeatures(geojson_format.read(geojson));
        layersmap.zoomToExtent(vector_layer.getDataExtent());
    }

};

// Openlayers Map variables
var layersmap;
var layer;
