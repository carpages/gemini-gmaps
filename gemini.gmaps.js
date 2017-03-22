/* global GoogleMapsLoader, google */
/**
 * @fileoverview

A Gemini plugin to easily interact with the Google Maps API

### Notes
- The dom elements need to have a width and height
- Set `G.D.GOOGLE_MAPS_API_KEY` or `window.GOOGLE_MAPS_API_KEY` to use an api key

 *
 * @namespace gemini.gmaps
 * @copyright Carpages.ca 2014
 * @author Matt Rose <matt@mattrose.ca>
 *
 * @requires gemini
 * @requires require.async
 *
 * @prop {array} apiKey {@link gemini.gmaps#apiKey}
 * @prop {array} locations {@link gemini.gmaps#locations}
 * @prop {array} animation {@link gemini.gmaps#animation}
 * @prop {object} mapOptions {@link gemini.gmaps#mapOptions}
 * @prop {function} onMarkerActivated {@link gemini.gmaps#onMarkerActivated}
 * @prop {boolean} skipInit {@link gemini.gmaps#skipInit}
 *
 * @example
  <html>
    <div id="js-map" style="height: 300px;"></div>
  </html>
 *
 * @example
  G('#js-map').gmaps({
    locations: [
      {
        title: "Mississauga",
        lat: 43.58821,
        lng: -79.64172
      }
    ],
    mapOptions: {
      zoom: 11
    }
  });
 */
( function( factory ) {
  if ( typeof define === 'function' && define.amd ) {
    // AMD. Register as an anonymous module.
    define([
      'gemini',
      'google-maps'
    ], factory );
  } else if ( typeof exports === 'object' ) {
    // Node/CommonJS
    module.exports = factory(
      require( 'gemini-loader' ),
      require( 'google-maps' )
    );
  } else {
    // Browser globals
    factory( G, GoogleMapsLoader );
  }
}( function( $, GoogleMapsLoader ) {
  $.boiler( 'gmaps', {
    defaults: {
      /**
       * Set a key for the API. Google requires this as of June 22, 2016.
       * http://googlegeodevelopers.blogspot.ca/2016/06/building-for-scale-updates-to-google.html
       *
       * @name gemini.gmaps#apiKey
       * @type string
       * @default false
       */
      apiKey: false,

      /**
       * Set the locations of the map by passing objects with a title, lat, lng, and content
       *
       * @name gemini.gmaps#locations
       * @type array
       * @default []
       */
      locations: [],

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
       * Add custom styling to map
       *
       * @name gemini.gmaps#style
       * @type array
       * @default []
       */
      style: [],

      /**
       * Add custom marker icon. The object expects an 'active' and 'inactive'
       * key value which points to a png.
       *
       * @name gemini.gmaps#icon
       * @type object
       * @default {}
       */
      icon: {}
    },

    data: [ 'title', 'latlng' ],

    init: function() {
      var P = this;

      // Set key
      if ( P.settings.apiKey ) {
        GoogleMapsLoader.KEY = P.settings.apiKey;
      }

      // Launch da map
      if ( !P.settings.skipInit ) {
        GoogleMapsLoader.load( function( g ) {
          P._initMap();
        });
      } else {
        P.settings.skipInit = false;
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

      // Extend mapoptions
      P.mapOptions = $.extend({
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        scrollwheel: false,
        streetViewControl: false,
        zoom: 13
      }, P.settings.mapOptions );

      P.map = new google.maps.Map( P.el, P.mapOptions );

      // Set styles
      // http://stackoverflow.com/questions/10857997/remove-the-report-a-map-error-from-google-map
      var mapType = new google.maps.StyledMapType( P.settings.style, { name: 'Dummy Style' });
      P.map.mapTypes.set( 'Dummy Style', mapType );
      P.map.setMapTypeId( 'Dummy Style' );

      P._addMarkers();
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

      $.each( P.settings.locations, function( i, location ) {
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng( location.lat, location.lng ),
          map: P.map,
          title: location.title,
          icon: i === 0 || !P.settings.onMarkerActivated ? P.settings.icon.active : P.settings.icon.inactive,
          animation: P.settings.animation
            ? google.maps.Animation[P.settings.animation]
            : null
        });

        P.markers.push( marker );

        bounds.extend( marker.position );

        // Load info window if content is sent
        if ( location.content ) {
          var infowindow = new google.maps.InfoWindow({
            content: location.content
          });

          infowindow.open( P.map, marker );
        }

        if ( P.settings.onMarkerActivated ) {
          google.maps.event.addListener( marker, 'click', function() {
            // Change the icons
            if ( P.markers.length > 1 ) {
              $.each( P.markers, function( i, marker ) {
                marker.setIcon( P.settings.icon.inactive );
              });
              marker.setIcon( P.settings.icon.active );
            }

            P.settings.onMarkerActivated.call( marker, location );
          });

          // activate first icon
          if ( i === 0 ) P.settings.onMarkerActivated.call( marker, location );
        }
      });

      P.map.fitBounds( bounds );

      google.maps.event.addListenerOnce( P.map, 'bounds_changed', function() {
        var zoom = P.map.getZoom();
        P.map.setZoom( Math.min( zoom, P.mapOptions.zoom ));
      });
    }
  });

  // Return the jquery object
  // This way you don't need to require both jquery and the plugin
  return $;
}));
