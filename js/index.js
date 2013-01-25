/**
 * Application logic.
 *
 * @package themakermap
 */

(function($){
    /**
     * Configuration
     */
    var dataProvider = '1tteiG-HYAlsmh3ef5U-XVDEWu5QXqDxqWwDx-pc';

    /**
     * Storage objects
     */
    var map, layer;

    /**
     * Generates a filter query for the Google Fusion Tables API.
     *
     * @return {Object}
     */
    function generateFilterQuery () {
        var q  = '',
            qp = "'Business Type' IN (",
            qs = ")";

        // Build query
        $('#filter').find('input[type="checkbox"]:checked').each(function () {
            q += "'" + $(this).attr('value') + "', ";
        });

        // Trim & catch null
        q = q.slice(0, q.length - 2);
        if (q === '') q = "'undefined'";

        return {
            select: 'Location',
            from:   dataProvider,
            where:  qp + q + qs
        };
    }

    /**
     * Google Maps
     */
    function initMaps () {
        map = new google.maps.Map(document.getElementById('map-canvas'), {
            center: new google.maps.LatLng(37.65, -122.25),
            zoom: 10,
            disableDefaultUI: true,
            zoomControl: true,
            streetViewControl: true
        });

        var style = [
            {
                elementType: 'geometry',
                stylers: [
                    { saturation: -100 },
                    { weight: 0.4 }
                ]
            },
            {
                featureType: 'poi',
                stylers: [
                    { visibility: "off" }
                ]
            },
            {
                featureType: 'administrative.land_parcel',
                elementType: 'all',
                stylers: [
                    { visibility: 'off' }
                ]
            }
        ];

        var styledMapType = new google.maps.StyledMapType(style, {
            map: map,
            name: 'Styled Map'
        });

        map.mapTypes.set('map-style', styledMapType);
        map.setMapTypeId('map-style');

        layer = new google.maps.FusionTablesLayer({
            query:  generateFilterQuery(),
            map:    map
        });
    }

    /**
     * UI events
     */
    function initEventListeners () {
        // Selectors
        $search = $('#search');
        $filter = $('#filter');

        // Search
        $search.submit(function () {
            return false;
        });

        // Filter
        $filter.find('input').click(function () {
            layer.setQuery(generateFilterQuery());
        });
    }

    /**
     * On load, init maps & start listening for UI events
     */
    initMaps();
    initEventListeners();

})(jQuery);