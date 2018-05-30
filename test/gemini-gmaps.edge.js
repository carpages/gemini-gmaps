requirejs.config({
  baseUrl: '../',
  paths: {
    underscore: 'bower_components/underscore/underscore',
    jquery: 'bower_components/jquery/dist/jquery',
    'google-maps': 'bower_components/google-maps/lib/Google',
    handlebars: 'bower_components/handlebars/handlebars.runtime',
    'jquery.boiler': 'bower_components/jquery-boiler/jquery.boiler',
    'gemini.support': 'bower_components/gemini-support/gemini.support',
    gemini: 'bower_components/gemini-loader/gemini'
  }
});

require([ 'gemini', 'gemini.gmaps' ], function( G ) {
  var $map = G( '#js-map' );
  var $mapStatic = G( '#js-map-static' );
  var $mapDynamic = G( '#js-map-dynamic' );

  var pluginOptions = {
    apiKey: '<enter testing api key here>',
    locations: [
      {
        title: 'Carpages.ca',
        lat: 43.59591,
        lng: -79.5956759
      }
    ],
    mapOptions: {
      zoom: 15
    }
  };

  $map.gmaps( G.extend( pluginOptions ));
  $mapStatic.gmaps( G.extend( pluginOptions, { type: 'static' }));
  $mapDynamic.gmaps( G.extend( pluginOptions, { type: 'dynamic' }));
});
