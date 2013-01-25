/**
 * Application logic.
 *
 * @package themakermap
 */

(function($){
    /**
     * Configuration
     */
    var formUri = 'https://docs.google.com/spreadsheet/viewform?formkey=dFFZc2hBY1h3M3hPM1B2bVphZmhsY0E6MA#gid=0';

    /**
     * Storage objects
     */
    var map, layer;

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
            query: {
                select: 'Location',
                from: '1tteiG-HYAlsmh3ef5U-XVDEWu5QXqDxqWwDx-pc',
                // where: '\'Category Tags\' IN(\'#electronics\') AND \'Provider Tags\' IN(\'supplier\')'
            },
            map: map
        });
    }

    /**
     * UI events
     */
    function initEventListeners () {
        // Cache selectors
        var $modal = $('#modal');

        // Modal
        $modal.modal({
            backdrop:   false,
            show:       false,
            remote:     formUri
        });

        $modal.on('show', function () {
            $(this).find('head').html('');
            $(this).find('form').submit(function () {
                var action = $(this).attr('action');
                console.log(action);
                return false;
            });
        });
    }

    /**
     * On load, init maps & start listening for UI events
     */
    initMaps();
    initEventListeners();

})(jQuery);