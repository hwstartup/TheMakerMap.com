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
     * Window rendering handler.
     */
    function render () {
        var $map    = $('#map-wrapper');
        var calc    = $(window).height() - $map.position().top;

        $map.css('height', calc + 'px');
    }

    /**
     * Event handler for checkbox controls.
     *
     * @param {Object} Event
     *
     * @return {void}
     */
    function updateAnyCheckbox (e) {
        var $target = $(e.target);
        var $boxen  = $('#filter').find('input[type="checkbox"]').not('[value="any"]');
        var $any    = $('#filter').find('input[value="any"]');

        if ($target.val() == 'any') {
            // Update other checkboxes based on "any" state
            if ($any.is(':checked')) {
                $boxen.prop('checked', 'checked');
            } else {
                $boxen.removeAttr('checked');
            }
        } else {
            // Update "any" checkbox based on others' state
            if ($boxen.not(':checked').length) {
                $any.removeAttr('checked');
            } else {
                $any.prop('checked', 'checked');
            }
        }
    }

    /**
     * Generates a search query.
     *
     * @param {String} Search term
     *
     * @return {String}
     */
    function generateSearchQuery (term) {
        var q = term.replace(/^\s+|\s+$/g, "").replace(/'/g, '\\\'').toLowerCase();
            qp = "'Resource Name' CONTAINS IGNORING CASE '",
            qs = "'";

        if (q === '') return '';
        return qp + q + qs;
    }

    /**
     * Generates a filter query.
     *
     * @return {String}
     */
    function generateFilterQuery () {
        var q  = "",
            qp = "'Business Type' IN (",
            qs = ")",
            $filter = $('#filter');

        if ($filter.find('input[value="any"]:checked').length > 0) {
            return '';
        }

        $filter.find('input[type="checkbox"]:checked').each(function () {
            q += "'" + $(this).attr('value') + "', ";
        });

        q = q.slice(0, q.length - 2);
        if (q === '') return '';

        return qp + q + qs;
    }

    /**
     * Generates query object for the Google Fusion Tables API.
     *
     * @return {Object}
     */
    function generateQuery () {
        var search  = generateSearchQuery($('#search').find('input').val()),
            filter  = generateFilterQuery(),
            and     = (search !== '' && filter !== '') ? ' AND ' : '';

        return {
            select: 'Location',
            from:   dataProvider,
            where:  search + and + filter
        };
    }

    /**
     * Google Maps
     */
    function initMaps () {
        map = new google.maps.Map(document.getElementById('map-canvas'), {
            center: new google.maps.LatLng(39.50, -98.35),
            zoom: 4,
            disableDefaultUI: true,
            zoomControl: true,
						zoomControlOptions: {
							style: google.maps.ZoomControlStyle.LARGE,
							position: google.maps.ControlPosition.TOP_RIGHT
						},
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
            query:  generateQuery(),
            map:    map
        });

        if (navigator && navigator.geolocation) {
           locateMe();
        }
    }

		function locateMe () {
			navigator.geolocation.getCurrentPosition(function(position) {
	      var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	      map.setCenter(latlng);
	      map.setZoom(12);
	
				$('.locateMe').fadeIn(1000,function(){
					$(this).tooltip('show');
				}).css("display",'table');
				
	    });
	
			$('.locateMe').click(function(){
				locateMe();
			});
			
		}
		
		

    /**
     * UI events
     */
    function initEventListeners () {
        // Selectors
        var $window = $(window);
        var $nav    = $('#topnav a');
        var $search = $('#search');
        var $filter = $('#filter');

        // Resize handler
        $window.resize(render);

        // Top nav
        $.hovertips($nav, {
            delay_hide:     0,
            delay_hover:    0,
            delay_leave:    0,
            render: function($el, data, loading) {
                var $tooltip;
                var self = this;
                $tooltip = $('<div>');
                $tooltip.addClass('nav-tooltip')
                $tooltip.html($el.find('img').attr('alt'));
                $el.on('click', function() {
                    self.hide(0);
                });
                return $tooltip;
            }
        });

        // Search
        $search.submit(function () {
            return false;
        });

        $search.find('input').keyup(function () {
            layer.setQuery(generateQuery());
        });

        // Filter
        $filter.find('input').click(function (e) {
            updateAnyCheckbox(e);
            layer.setQuery(generateQuery());
        });
    }

		function filterMenu() {
			$('.filterIcon').click(function(){
				$('.filterWrap').slideToggle();
			});
		}
		
		function mobileMenu() {
			$('.menuToggle').click(function(){
				$('.aboutWrap').slideToggle();
			});
		}
		
		function aboutModal() {
			var aboutContent = $('.aboutWrap').html();
			$('#aboutModal .modal-body').html(aboutContent);
			
			$('.about .searchAction').click(function(){
				console.log('click');
				$('#aboutModal').modal('hide')
				$('#searchForm').focus();
			});
			
		}


    function initSocialite() {
        Socialite.load($('div.footer'));
    }

    /**
     * On load, init maps & start listening for UI events
     */
    render();
    initMaps();
    initEventListeners();
		filterMenu();
		mobileMenu();
		aboutModal();
    initSocialite();

})(jQuery);
