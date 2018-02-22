/**
 * @fileoverview

A Gemini plugin to easily interact with the Google Maps API

### Notes
- The dom elements need to have a width and height

 *
 * @namespace gemini.gmaps
 * @copyright Carpages.ca 2014
 * @author Matt Rose <matt@mattrose.ca>
 *
 * @requires gemini
 * @requires require.async
 *
 * @prop {array} locations {@link gemini.gmaps#locations}
 * @prop {array} animation {@link gemini.gmaps#animation}
 * @prop {object} mapOptions {@link gemini.gmaps#mapOptions}
 * @prop {function} onMarkerActivated {@link gemini.gmaps#onMarkerActivated}
 * @prop {boolean} skipInit {@link gemini.gmaps#skipInit}
 *
 * @example
  <html>
    <div id="js-map" height="100px"></div>
  </html>
 *
 * @example
  G('#js-map').gmaps({
    locations: [
      {
        title: "Fake Location",
        lat: 0,
        lng: 0
      }
    ]
  });
 */
define(
  ['gemini', 'async!https://maps.googleapis.com/maps/api/js?v=3'],
  function($) {
    var _ = $._;

    $.boiler('gmaps', {
      defaults: {
        /**
         * Set the locations of the map with title, lat, lng, content
         *
         * @name gemini.gmaps#locations
         * @type array
         * @default []
         */
        locations: [
          {
            title: 'Some location',
            lat: 43.595884,
            lng: -79.594319,
            content: false
          },
          {
            title: 'Some location',
            lat: 43.595884,
            lng: -79.7,
            content: false
          }
        ],
        /**
         * The animation for the markers
         * See [the animation options](https://developers.google.com/maps/documentation/javascript/markers#animate).
         *
         * @name gemini.gmaps#animation
         * @type string
         * @default "DROP"
         */
        animation: 'DROP',
        /**
         * Pass custom maps options using Google Maps' API.
         * See [their API](https://developers.google.com/maps/documentation/javascript/reference?csw=1#MapOptions).
         *
         * @name gemini.gmaps#mapOptions
         * @type object
         * @default {}
         */
        mapOptions: {},
        /**
         * Callback function to run when a marker is clicked on.
         * *Note:* 'this' refers to the Marker and location is sent as a callback parameter
         *
         * @name gemini.gmaps#onMarkerActivated
         * @type function
         * @default false
         */
        onMarkerActivated: false,
        /**
         * Don't initiate map onload (for performance)
         *
         * @name gemini.gmaps#skipInit
         * @type boolean
         * @default false
         */
        skipInit: false,
        /**
         * Icons to load for custom map style
         *
         * @name gemini.gmaps#icons
         * @type object
         * @default {}
         */
        icons: {
          active: 'https://www.carpages.ca/images/primary/maps/active-icon.png',

          inactive:
            'https://www.carpages.ca/images/primary/maps/inactive-icon.png'
        }
      },

      style: [
        {
          stylers: [
            {
              visibility: 'off'
            }
          ]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [
            {
              visibility: 'on'
            },
            {
              color: '#ffffff'
            }
          ]
        },
        {
          featureType: 'road.arterial',
          elementType: 'geometry',
          stylers: [
            {
              visibility: 'on'
            },
            {
              color: '#fee379'
            }
          ]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [
            {
              visibility: 'on'
            },
            {
              color: '#fee379'
            }
          ]
        },
        {
          featureType: 'landscape',
          stylers: [
            {
              visibility: 'on'
            },
            {
              color: '#f3f4f4'
            }
          ]
        },
        {
          featureType: 'water',
          stylers: [
            {
              visibility: 'on'
            },
            {
              color: '#7fc8ed'
            }
          ]
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry.fill',
          stylers: [
            {
              visibility: 'on'
            },
            {
              color: '#83cead'
            }
          ]
        },
        {
          featureType: 'road',
          elementType: 'labels',
          stylers: [
            {
              visibility: 'on'
            }
          ]
        },
        {
          featureType: 'administrative',
          elementType: 'labels',
          stylers: [
            {
              visibility: 'on'
            }
          ]
        }
      ],

      data: ['title', 'latlng'],

      init: function() {
        if (!this.settings.skipInit) {
          this._initMap();
          this._addMarkers();
        } else {
          this.settings.skipInit = false;
        }
      },

      /**
       * Initiate the map
       *
       * @private
       * @method
       * @name gemini.gmaps#_initMap
       **/
      _initMap: function() {
        var P = this;

        //Extend mapoptions
        P.mapOptions = $.extend(
          {
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            scrollwheel: false,
            streetViewControl: false,
            zoom: 13
          },
          P.settings.mapOptions
        );

        P.map = new google.maps.Map(P.el, P.mapOptions);

        //Set styles
        //http://stackoverflow.com/questions/10857997/remove-the-report-a-map-error-from-google-map
        var mapType = new google.maps.StyledMapType(P.style, {
          name: 'Dummy Style'
        });
        P.map.mapTypes.set('Dummy Style', mapType);
        P.map.setMapTypeId('Dummy Style');

        //Setup marker icons
        P.icon = {
          active: P.settings.icons.active,
          inactive: P.settings.icons.inactive
        };
      },

      /**
       * Initiate the markers
       *
       * @private
       * @method
       * @name gemini.gmaps#_addMarkers
       **/
      _addMarkers: function() {
        var P = this;

        P.markers = [];

        var bounds = new google.maps.LatLngBounds();

        $.each(P.settings.locations, function(i, location) {
          var marker = new google.maps.Marker({
            position: new google.maps.LatLng(location.lat, location.lng),
            map: P.map,
            title: location.title,
            icon:
              i === 0 || !P.settings.onMarkerActivated
                ? P.icon.active
                : P.icon.inactive,
            animation: !!P.settings.animation
              ? google.maps.Animation[P.settings.animation]
              : null
          });

          P.markers.push(marker);

          bounds.extend(marker.position);

          // Load info window if content is sent
          if (!!location.content) {
            var infowindow = new google.maps.InfoWindow({
              content: location.content
            });

            infowindow.open(P.map, marker);
          }

          if (P.settings.onMarkerActivated) {
            google.maps.event.addListener(marker, 'click', function() {
              //Change the icons
              if (P.markers.length > 1) {
                $.each(P.markers, function(i, marker) {
                  marker.setIcon(P.icon.inactive);
                });
                marker.setIcon(P.icon.active);
              }

              P.settings.onMarkerActivated.call(marker, location);
            });

            //activate first icon
            if (i === 0) P.settings.onMarkerActivated.call(marker, location);
          }
        });

        P.map.fitBounds(bounds);

        google.maps.event.addListenerOnce(P.map, 'bounds_changed', function() {
          var zoom = P.map.getZoom();
          P.map.setZoom(Math.min(zoom, P.mapOptions.zoom));
        });
      },

      /**
       * Get the current version of IE
       *
       * @private
       * @method
       * @name gemini.gmaps#_getIEVersion
       **/
      _getIEVersion: function() {
        // Returns the version of Windows Internet Explorer or a -1
        // (indicating the use of another browser).
        var rv = -1; // Return value assumes failure.
        if (navigator.appName == 'Microsoft Internet Explorer') {
          var ua = navigator.userAgent;
          var re = new RegExp('MSIE ([0-9]{1,}[.0-9]{0,})');
          if (re.exec(ua) !== null) rv = parseFloat(RegExp.$1);
        }
        return rv;
      }
    });

    // Return the jquery object
    // This way you don't need to require both jquery and the plugin
    return $;
  }
);
