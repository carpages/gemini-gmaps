( function( factory ) {
  if ( typeof define === 'function' && define.amd ) {
    // AMD. Register as an anonymous module.
    define([ '../utils/map', '../utils/url' ], factory );
  } else if ( typeof exports === 'object' ) {
    // Node/CommonJS
    module.exports = factory( require( '../utils/map' ), require( '../utils/url' ));
  } else {
    // Browser globals
    factory( MapUtils, URLUtils );
  }
})( function( MapUtils, URLUtils ) {
  function StaticMapLoader( options ) {
    var Loader = this;

    Loader.settings = options || {};
    Loader.baseURL = 'https://maps.googleapis.com/maps/api/staticmap';
    Loader.directionsBaseURL = 'https://www.google.com/maps/dir/';
    Loader.urlOptions = new URLUtils.OptionSet();
    Loader.markers = [];
    Loader.mapStyle = new MapUtils.MapStyle();
    Loader.directionsUrlOptions = new URLUtils.OptionSet();

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
      var marker = new MapUtils.Marker({ locations: locations });
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

  return StaticMapLoader;
});
