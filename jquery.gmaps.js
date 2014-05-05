define(['jquery.boiler', 'underscore', 'async!https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false'], function($, _){

	$.boiler('gmaps', {
		defaults: {
			locations: [{
				title: 'Some location',
				lat: 43.595884,
				lng: -79.594319
			},
			{
				title: 'Some location',
				lat: 43.595884,
				lng: -79.7
			}],
			mapOptions: {},
			onMarkerActivated: false,
			skipInit: false
		},

		style: [{
			"stylers": [{
				"visibility": "off"
			}]
		}, {
			"featureType": "road",
			"elementType": "geometry",
			"stylers": [{
				"visibility": "on"
			}, {
				"color": "#ffffff"
			}]
		}, {
			"featureType": "road.arterial",
			"elementType": "geometry",
			"stylers": [{
				"visibility": "on"
			}, {
				"color": "#fee379"
			}]
		}, {
			"featureType": "road.highway",
			"elementType": "geometry",
			"stylers": [{
				"visibility": "on"
			}, {
				"color": "#fee379"
			}]
		}, {
			"featureType": "landscape",
			"stylers": [{
				"visibility": "on"
			}, {
				"color": "#f3f4f4"
			}]
		}, {
			"featureType": "water",
			"stylers": [{
				"visibility": "on"
			}, {
				"color": "#7fc8ed"
			}]
		}, {
			"featureType": "poi.park",
			"elementType": "geometry.fill",
			"stylers": [{
				"visibility": "on"
			}, {
				"color": "#83cead"
			}]
		}, {
			"featureType": "road",
			"elementType": "labels",
			"stylers": [{
				"visibility": "on"
			}]
		}, {
			"featureType": "administrative",
			"elementType": "labels",
			"stylers": [{
				"visibility": "on"
			}]
		}],

		data: ['title', 'latlng'],

		init: function(){
			if(!this.settings.skipInit){
				this.initMap();
				this.addMarkers();
			} else {
				this.settings.skipInit = false;
			}
		},

		initMap: function(){
			var P = this;

			//Extend mapoptions
			P.mapOptions = $.extend({
				mapTypeId: google.maps.MapTypeId.ROADMAP,
				scrollwheel: false,
				streetViewControl: false,
				zoom: 13
			}, P.settings.mapOptions);

			P.map = new google.maps.Map(P.el, P.mapOptions);

			//Set styles
			//http://stackoverflow.com/questions/10857997/remove-the-report-a-map-error-from-google-map
			var mapType = new google.maps.StyledMapType(P.style, {name: 'Dummy Style'});
			P.map.mapTypes.set('Dummy Style', mapType);
			P.map.setMapTypeId('Dummy Style');

			//Setup marker icons
			P.icon = {
				active: '/images/primary/maps/active-icon.png',
				inactive: '/images/primary/maps/inactive-icon.png'
			};
		},

		addMarkers: function(){
			var P = this;

			P.markers = [];

			var bounds = new google.maps.LatLngBounds();

			$.each(P.settings.locations, function(i, location){
				var marker = new google.maps.Marker({
					position: new google.maps.LatLng(location.lat, location.lng),
					map: P.map,
					title: location.title,
					icon: i === 0 || !P.settings.onMarkerActivated ? P.icon.active : P.icon.inactive,
					animation: google.maps.Animation.DROP
				});

				P.markers.push(marker);

				bounds.extend(marker.position);

				if (P.settings.onMarkerActivated) {
					google.maps.event.addListener(marker, 'click', function() {
						//Change the icons
						if(P.markers.length > 1){
							$.each(P.markers, function(i, marker){
								marker.setIcon(P.icon.inactive);
							});
							marker.setIcon(P.icon.active);
						}

						P.settings.onMarkerActivated.call(marker, location);
					});

					//activate first icon
					if (i===0) P.settings.onMarkerActivated.call(marker, location);
				}
				
				
			});

			P.map.fitBounds(bounds);

			google.maps.event.addListenerOnce(P.map, "bounds_changed", function () {
				var zoom = P.map.getZoom();
				P.map.setZoom(Math.min(zoom, P.mapOptions.zoom));
			});
		},

		_getIEVersion: function(){
			// Returns the version of Windows Internet Explorer or a -1
			// (indicating the use of another browser).
			var rv = -1; // Return value assumes failure.
			if (navigator.appName == 'Microsoft Internet Explorer')
			{
				var ua = navigator.userAgent;
				var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
				if (re.exec(ua) !== null)
					rv = parseFloat( RegExp.$1 );
			}
			return rv;
		}
	});

	// Return the jquery object
	// This way you don't need to require both jquery and the plugin
	return $;

});