( function( factory ) {
  if ( typeof define === 'function' && define.amd ) {
    // AMD. Register as an anonymous module.
    define([ 'google-maps', '../utils/map', '../utils/url' ], factory );
  } else if ( typeof exports === 'object' ) {
    // Node/CommonJS
    module.exports = factory(
      require( 'google-maps' ),
      require( '../utils/map' ),
      require( '../utils/url' )
    );
  } else {
    // Browser globals
    factory( GoogleMapsLoader, MapUtils, URLUtils );
  }
})( function( GoogleMapsLoader, MapUtils, URLUtils ) {
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

  return DynamicMapLoader;
});
