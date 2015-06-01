requirejs.config({
  baseUrl: '../',
  paths: {
    'underscore':                'bower_components/underscore/underscore',
    'jquery':                    'bower_components/jquery/dist/jquery',
    'handlebars':                'bower_components/handlebars/handlebars.runtime',
    'jquery.boiler':             'bower_components/jquery-boiler/jquery.boiler',
    'gemini.support':            'bower_components/gemini-support/gemini.support',
    'gemini':                    'bower_components/gemini-loader/gemini',
    'async' :                    'bower_components/requirejs-plugins/src/async'
  }
});

require(['gemini', 'gemini.gmaps'], function(G){
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
});
