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
  return function assert( condition, message ) {
    if ( condition === false ) throw new Error( message || 'Failed assertion' );
  };
});
