( function( factory ) {
  if ( typeof define === 'function' && define.amd ) {
    // AMD. Register as an anonymous module.
    define([ '../utils/map', '../utils/url', '../utils/assert' ], factory );
  } else if ( typeof exports === 'object' ) {
    // Node/CommonJS
    module.exports = factory(
      require( '../utils/map' ),
      require( '../utils/url' ),
      require( '../utils/assert' )
    );
  } else {
    // Browser globals
    factory( MapUtils, URLUtils, assert );
  }
})( function( MapUtils, URLUtils, assert ) {
  function EmbeddedMapLoader( type, options ) {
    var Loader = this;

    type = type || 'place';
    Loader.settings = options || {};
    Loader.urlOptions = new URLUtils.OptionSet();
    Loader.baseURL = 'https://www.google.com/maps/embed/v1/' + type;

    Loader.configure = function() {
      var location;

      if ( !Loader.settings.embedQuery ) {
        assert(
          Loader.settings.locations && Loader.settings.locations.length > 0,
          'No locations'
        );

        location = new MapUtils.Location( Loader.settings.locations[0]);
        assert(
          location.isValid(),
          'Location invalid: ' + JSON.stringify( location )
        );
      }

      var embedQuery =
        Loader.settings.embedQuery ||
        Loader.settings.locations[0].address ||
        Loader.settings.locations[0].title ||
        [
          Loader.settings.locations[0].lat,
          Loader.settings.locations[0].lng
        ].join( ',' );

      switch ( type ) {
        case 'place': {
          Loader.urlOptions.add( 'q', embedQuery );
          break;
        }
        case 'view': {
          Loader.urlOptions.add( 'center', location.coordinate.urlString());
          break;
        }
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

  return EmbeddedMapLoader;
});
