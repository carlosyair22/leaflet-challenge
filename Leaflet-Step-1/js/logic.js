var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";



// Perform a GET request to the query URL
d3.json(url, function(data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
});



function createFeatures(earthquakeData) {
    console.log(earthquakeData)
        // function to define the color of the bubles
    function magColor(mag) {
        switch (true) {
            case (mag < 2):
                return "chartreuse";
            case (mag < 3):
                return "greenyellow";
            case (mag < 4):
                return "gold";
            case (mag < 5):
                return "DarkOrange";
            case (mag < 6):
                return "Peru";
            default:
                return "red";
        };
    }
    // Define a function we want to run once for each feature in the features array
    function createCircleMarker(feature, latlng) {
        let options = {
            radius: (feature.properties.mag * feature.properties.mag) * .33,
            fillColor: magColor(feature.properties.mag),
            color: "white",
            weight: 1,
            opacity: 0.5,
            fillOpacity: 0.5
        }
        return L.circleMarker(latlng, options);
    }
    // Give each feature a popup describing the place, magnitude and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place + "<br> Magnitude: " + feature.properties.mag +
            "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
    }
    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: createCircleMarker
    });
    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);
}

function createMap(earthquakes) {
    // Define layers
    var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.streets",
        accessToken: API_KEY
    });

    var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.dark",
        accessToken: API_KEY
    });

    var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap,
        "Light map": lightmap
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create a new map
    var myMap = L.map("map", {
        center: [0, 0],
        zoom: 2,
        layers: [streetmap, earthquakes]
    });

    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false,
        position: "topright"
    }).addTo(myMap);

    // Set up the legend
    var legend = L.control({
        position: "bottomright"
    });

    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var limits = [0, 2, 3, 4, 5, 6];
        var colors = ["chartreuse", "greenyellow", "gold", "DarkOrange", "Peru", "red"];

        div.innerHTML = "<h3>Magnitude</h3><hr>"

        limits.forEach(function(limit, index) {
            div.innerHTML += '<i style="background:' + colors[index] + '"></i>' + limit + (limits[index + 1] ? '&ndash;' + limits[index + 1] + '<br>' : '+');
        });
        return div;
    }

    // Adding legend to the map
    legend.addTo(myMap);

}