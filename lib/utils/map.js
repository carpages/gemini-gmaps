( function( factory ) {
  if ( typeof define === 'function' && define.amd ) {
    // AMD. Register as an anonymous module.
    define([ './url', './assert' ], factory );
  } else if ( typeof exports === 'object' ) {
    // Node/CommonJS
    module.exports = factory( require( './url' ), require( './assert' ));
  } else {
    // Browser globals
    factory( URLUtils, assert );
  }
})( function( URLUtils, assert ) {
  function MapLocation( options ) {
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
    this.settings = new URLUtils.OptionSet( '|', ':' );

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
    this.urlOptions = new URLUtils.OptionList( '|' );
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

  return {
    Location: MapLocation,
    Marker: Marker,
    MapStyle: MapStyle
  };
});
