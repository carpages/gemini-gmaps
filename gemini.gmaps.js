/* global GoogleMapsLoader */
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
    define([ 'gemini', 'google-maps' ], factory );
  } else if ( typeof exports === 'object' ) {
    // Node/CommonJS
    module.exports = factory( require( 'gemini-loader' ), require( 'google-maps' ));
  } else {
    // Browser globals
    factory( G, GoogleMapsLoader );
  }
})( function( G, GoogleMapsLoader ) {
  function OptionList( optionSeparator ) {
    this.options = [];
    this.optionSeparator = optionSeparator || '&';

    this.add = function( value ) {
      this.options.push( value );
      return this;
    };

    this.urlEncode = function() {
      return this.options.join( this.optionSeparator );
    };
  }

  function OptionSet( optionSeparator, keyValueSeparator ) {
    this.options = {};
    this.optionSeparator = optionSeparator || '&';
    this.keyValueSeparator = keyValueSeparator || '=';

    this.add = function( key, value ) {
      this.options[key] = value;
      return this;
    };

    this.urlEncode = function() {
      var optionSet = this;
      var keyValuePairs = Object.keys( optionSet.options ).map( function( key ) {
        return (
          encodeURIComponent( key ) +
          optionSet.keyValueSeparator +
          encodeURIComponent( optionSet.options[key])
        );
      });

      return keyValuePairs.join( this.optionSeparator );
    };
  }

  function Coordinate( latitude, longitude ) {
    try {
      assert( latitude && longitude );
    } catch ( error ) {
      return null;
    }

    this.lat = parseFloat( latitude );
    this.lng = parseFloat( longitude );

    this.urlString = function() {
      return [ this.lat, this.lng ].join( ',' );
    };
  }

  function MapLocation( options ) {
    this.title = options.title || '';
    this.address = options.address || '';
    this.coordinate = new Coordinate( options.lat, options.lng ) || null;

    this.isValid = function() {
      assert(
        this.coordinate || ( this.title || this.address ),
        'No title or address, or invalid coordinates for this location.' +
          JSON.stringify( this )
      );

      return true;
    };
  }

  function MapStyle() {
    this.features = [];
    this.addFeature = function( feature ) {
      this.features.push( feature );
    };
  }

  function MarkerStyle( style ) {
    this.settings = new OptionSet( '|', ':' );

    this.setSize = function( size ) {
      if ( !size ) return;
      this.settings.add( 'size', size );
    };

    this.setColor = function( color ) {
      if ( !color ) return;
      this.settings.add( 'color', color.replace( '#', '0x' ));
    };

    this.setLabel = function( label ) {
      if ( !label ) return;
      this.settings.add( 'label', label );
    };

    this.urlEncode = function() {
      return this.settings.urlEncode();
    };
  }

  function Marker( options ) {
    this.settings = options || {};
    this.urlOptions = new OptionList( '|' );
    this.locations = this.settings.locations || [];
    this.style = new MarkerStyle();

    this.addLocation = function( location ) {
      this.locations.push( location );
    };

    this.urlEncode = function() {
      var marker = this;
      this.locations.map( function( location ) {
        if ( location.style ) {
          marker.style.setSize( location.style.size );
          marker.style.setColor( location.style.color );
        }

        marker.style.setLabel( location.title );
        marker.urlOptions
          .add( marker.style.urlEncode())
          .add([ location.lat, location.lng ].join( ',' ));
      });
      return this.urlOptions.urlEncode();
    };
  }

  function StaticMapLoader( options ) {
    var Loader = this;

    Loader.settings = options || {};
    Loader.baseURL = 'https://maps.googleapis.com/maps/api/staticmap';
    Loader.directionsBaseURL = 'https://www.google.com/maps/dir/';
    Loader.urlOptions = new OptionSet();
    Loader.markers = [];
    Loader.mapStyle = new MapStyle();
    Loader.directionsUrlOptions = new OptionSet();

    Loader.configure = function() {
      Loader.settings.width =
        Loader.settings.width > 640 ? 640 : Loader.settings.width;
      Loader.settings.height =
        Loader.settings.height > 640 ? 640 : Loader.settings.height;

      Loader.directionsUrlOptions.add( 'api', '1' );
      Loader.directionsUrlOptions.add(
        'destination',
        Loader.getQueryForLocation( Loader.settings.locations[0])
      );
    };

    Loader.addMarkers = function( locations ) {
      var marker = new Marker({ locations: locations });
      Loader.markers.push( marker );
      Loader.urlOptions.add( 'markers', marker.urlEncode());
    };

    Loader.getQueryForLocation = function( location ) {
      if ( location.address ) {
        return location.address;
      }

      if ( location.lat && location.lng ) {
        return [ location.lat, location.lng ].join( ',' );
      }

      return '';
    };

    Loader.load = function() {
      Loader.urlOptions.add(
        'center',
        [
          Loader.settings.locations[0].lat,
          Loader.settings.locations[0].lng
        ].join( ',' )
      );

      if ( Loader.settings.mapOptions.zoom ) {
        Loader.urlOptions.add( 'zoom', Loader.settings.mapOptions.zoom );
      }

      Loader.urlOptions.add(
        'size',
        Loader.settings.width + 'x' + Loader.settings.height
      );

      Loader.urlOptions.add( 'format', Loader.settings.imageFormat );

      if ( Loader.settings.locations ) {
        Loader.addMarkers( Loader.settings.locations );
      }

      if ( Loader.settings.apiKey ) {
        Loader.urlOptions.add( 'key', Loader.settings.apiKey );
      }

      var mapURL = Loader.buildMapURL();

      var $imageElement = G( '<img>' );
      $imageElement.attr( 'src', mapURL );

      var $directionsLinkElement = null;

      if ( Loader.settings.linkToDirections ) {
        $directionsLinkElement = G( '<a>' );

        $directionsLinkElement.attr( 'href', Loader.buildDirectionsURL());

        $directionsLinkElement.prepend( $imageElement );
        Loader.settings.$el.prepend( $directionsLinkElement );
        return;
      }

      Loader.settings.$el.prepend( $imageElement );
    };

    Loader.buildDirectionsURL = function() {
      return (
        Loader.directionsBaseURL + '?' + Loader.directionsUrlOptions.urlEncode()
      );
    };

    Loader.buildMapURL = function() {
      return Loader.baseURL + '?' + Loader.urlOptions.urlEncode();
    };

    Loader.configure();
  }

  function assert( condition, message ) {
    if ( condition === false ) throw new Error( message || 'Failed assertion' );
  }

  function EmbeddedMapLoader( type, options ) {
    var Loader = this;

    type = type || 'place';
    Loader.settings = options || {};
    Loader.urlOptions = new OptionSet();
    Loader.baseURL = 'https://www.google.com/maps/embed/v1/' + type;

    Loader.configure = function() {
      var location;

      if ( !Loader.settings.embedQuery ) {
        assert(
          Loader.settings.locations && Loader.settings.locations.length > 0,
          'No locations'
        );

        location = new MapLocation( Loader.settings.locations[0]);
        assert(
          location.isValid(),
          'Location invalid: ' + JSON.stringify( location )
        );
      }

      var embedQuery =
        Loader.settings.embedQuery ||
        location.address ||
        location.title ||
        location.coordinate.urlString();

      switch ( type ) {
        case 'place': {
          Loader.urlOptions.add( 'q', embedQuery );
          break;
        }
      }

      if ( Loader.settings.mapOptions.center ) {
        var center = Loader.settings.mapOptions.center;
        var coordinate = new Coordinate( center.lat, center.lng );
        Loader.urlOptions.add( 'center', coordinate.urlString());
      }

      if ( Loader.settings.mapOptions.zoom ) {
        Loader.urlOptions.add( 'zoom', Loader.settings.mapOptions.zoom );
      }

      if ( Loader.settings.apiKey ) {
        Loader.urlOptions.add( 'key', Loader.settings.apiKey );
      }
    };

    Loader.load = function() {
      var mapURL = Loader.buildMapURL();
      var $iframe = G( '<iframe style="border:0">' )
        .attr( 'src', mapURL )
        .attr( 'frameborder', '0' )
        .attr( 'height', Loader.settings.height );

      Loader.settings.$el.html( $iframe );
    };

    Loader.buildMapURL = function() {
      return Loader.baseURL + '?' + Loader.urlOptions.urlEncode();
    };

    Loader.configure();
  }

  function DynamicMapLoader( options ) {
    var Loader = this;

    Loader.settings = options || {};

    Loader.configure = function() {
      // Set key
      if ( Loader.settings.apiKey ) {
        GoogleMapsLoader.KEY = Loader.settings.apiKey;
      }

      GoogleMapsLoader.VERSION = Loader.settings.mapsVersion || '3';
    };

    Loader.load = GoogleMapsLoader.load;

    Loader.configure();
  }

  G.boiler( 'gmaps', {
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
      icon: {},

      /**
       * The map type to initialize.
       * Accepts any of 'embed', 'static', 'dynamic'.
       *
       * @name gemini.gmaps#type
       * @type string
       * @default 'embed'
       */
      type: 'embed',

      /**
       * The type of embedded map to load.
       * Accepts any of 'place', 'directions', 'search', 'view', or 'streetview'.
       *
       * @name gemini.gmaps#embedType
       * @type string
       * @default 'place'
       */
      embedType: 'place',

      /**
       * The address / business name query to send to the Google Maps Embed API.
       *
       * @name gemini.gmaps#embedQuery
       * @type string
       * @default null
       */
      embedQuery: null,

      /**
       * The map height to initialize.
       *
       * @name gemini.gmaps#height
       * @type integer
       * @default null
       */
      height: null,

      /**
       * The map width to initialize.
       *
       * @name gemini.gmaps#width
       * @type integer
       * @default null
       */
      width: null,

      /**
       * Set the static maps image format.
       *
       * @name gemini.gmaps#imageFormat
       * @type string
       * @default 'png'
       */
      imageFormat: 'png',

      /**
       * Whether or not to wrap the static image in an anchor that links to
       * Google Maps for directions to the address.
       *
       * Note: Applies to 'static' MapType.
       *
       * @name gemini.gmaps#linkToDirections
       * @type boolean
       * @default false
       */
      linkToDirections: false
    },

    data: [ 'title', 'latlng', 'height', 'width' ],

    init: function() {
      var P = this;

      if ( P.settings.height ) {
        P.$el.css( 'height', P.settings.height + 'px' );
      }

      if ( P.settings.width ) {
        P.$el.css( 'width', P.settings.width + 'px' );
      }

      switch ( P.settings.type ) {
        case 'static': {
          P._initStaticMap();
          break;
        }

        case 'dynamic': {
          P._initDynamicMap();
          break;
        }

        default: {
          P._initEmbeddedMap();
        }
      }
    },

    /**
     * Initiate the map
     *
     * @private
     * @method
     * @name gemini.gmaps#_initMap
     **/
    _setGoogleObject: function( google ) {
      var P = this;
      P.google = google;
    },

    _initEmbeddedMap: function() {
      var P = this;

      // If no height is given, set a sensible default
      P.settings.height = P.settings.height || 350;

      var loader = new EmbeddedMapLoader(
        P.settings.embedType,
        G.extend({ el: P.el, $el: P.$el }, P.settings )
      );

      loader.load();
    },

    _initStaticMap: function() {
      var P = this;

      // 640 is the largest an non-Premium Static Map can be.
      P.settings.height = P.settings.height || 640;
      P.settings.width = P.settings.width || 640;

      var loader = new StaticMapLoader(
        G.extend({ el: P.el, $el: P.$el }, P.settings )
      );

      loader.load();
    },

    _initDynamicMap: function() {
      var P = this;

      var loader = new DynamicMapLoader( P.settings );

      // Launch da map
      if ( !P.settings.skipInit ) {
        loader.load( function( google ) {
          P._setGoogleObject( google );
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
      P.mapOptions = G.extend(
        {
          mapTypeId: P.google.maps.MapTypeId.ROADMAP,
          scrollwheel: false,
          streetViewControl: false,
          zoom: 13
        },
        P.settings.mapOptions
      );

      P.map = new P.google.maps.Map( P.el, P.mapOptions );

      // Set styles
      // http://stackoverflow.com/questions/10857997/remove-the-report-a-map-error-from-google-map
      var mapType = new P.google.maps.StyledMapType( P.settings.style, {
        name: 'Dummy Style'
      });

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

      var bounds = new P.google.maps.LatLngBounds();

      G.each( P.settings.locations, function( i, location ) {
        var marker = new P.google.maps.Marker({
          position: new P.google.maps.LatLng( location.lat, location.lng ),
          map: P.map,
          title: location.title,
          icon:
            i === 0 || !P.settings.onMarkerActivated
              ? P.settings.icon.active
              : P.settings.icon.inactive,
          animation: P.settings.animation
            ? P.google.maps.Animation[P.settings.animation]
            : null
        });

        P.markers.push( marker );

        bounds.extend( marker.position );

        // Load info window if content is sent
        if ( location.content ) {
          var infowindow = new P.google.maps.InfoWindow({
            content: location.content
          });

          infowindow.open( P.map, marker );
        }

        if ( P.settings.onMarkerActivated ) {
          P.google.maps.event.addListener( marker, 'click', function() {
            // Change the icons
            if ( P.markers.length > 1 ) {
              G.each( P.markers, function( i, marker ) {
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

      P.map.setCenter( bounds.getCenter());

      P.google.maps.event.addListenerOnce( P.map, 'bounds_changed', function() {
        P.map.setZoom( Math.min( P.map.getZoom(), P.mapOptions.zoom ));
      });
    }
  });

  // Return the jquery object
  // This way you don't need to require both jquery and the plugin
  return $;
});
