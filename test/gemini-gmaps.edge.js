requirejs.config({
  baseUrl: '../',
  paths: {
    'underscore':                'bower_components/underscore/underscore',
    'jquery':                    'bower_components/jquery/dist/jquery',
    'google-maps':               'bower_components/google-maps/lib/Google',
    'handlebars':                'bower_components/handlebars/handlebars.runtime',
    'jquery.boiler':             'bower_components/jquery-boiler/jquery.boiler',
    'gemini.support':            'bower_components/gemini-support/gemini.support',
    'gemini':                    'bower_components/gemini-loader/gemini',
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
