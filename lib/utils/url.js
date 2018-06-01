( function( factory ) {
  if ( typeof define === 'function' && define.amd ) {
    // AMD. Register as an anonymous module.
    define([], factory );
  } else if ( typeof exports === 'object' ) {
    // Node/CommonJS
    module.exports = factory();
  } else {
    // Browser globals
    factory();
  }
})( function() {
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

  return {
    OptionSet: OptionSet,
    OptionList: OptionList
  };
});
