'use strict';

var path = require('path');
var fs   = require('fs');

function EmberCLIBootstrap(project) {
  this.project = project;
  this.name    = 'Ember CLI Bootstrap';
}

function unwatchedTree(dir) {
  return {
    read:    function() { return dir; },
    cleanup: function() { }
  };
}

EmberCLIBootstrap.prototype.treeFor = function treeFor(name) {
  var treePath = path.join('node_modules/ember-cli-bootstrap', name);

  if (fs.existsSync(treePath)) {
    return unwatchedTree(treePath);
  }
};

EmberCLIBootstrap.prototype.included = function included(app) {
  var env = app.env;
  var stylePath = 'vendor/bootstrap/dist/css/';
  var javascriptsPath = 'vendor/ember-addons.bs_for_ember/dist/js/';

  // Import css from bootstrap
  app.import(stylePath + 'bootstrap-theme.css');
  app.import(stylePath + 'bootstrap.css');

  // set modifier for unminified or minified js files.
  var envModifier = env !== 'production' ? '.max' : '.min';

  var fullJavascriptsPath = path.join('node_modules/ember-cli-bootstrap', javascriptsPath);
  var jsFiles = fs.readdirSync(fullJavascriptsPath);

  // Import bootstrap_for_ember bs-core before other components
  app.import(javascriptsPath + 'bs-core' + envModifier + '.js');

  // Import remaining bootstrap_for_ember components
  jsFiles.forEach(function(file) {
    var fileName = file.split('.')[0];
    if (fileName !== 'bs-core') {
      app.import(javascriptsPath + fileName + envModifier + '.js');
    }
  })

  // Import fonts
  app.import('vendor/bootstrap/dist/fonts/glyphicons-halflings-regular.eot', { destDir: 'fonts' });
  app.import('vendor/bootstrap/dist/fonts/glyphicons-halflings-regular.svg', { destDir: 'fonts' });
  app.import('vendor/bootstrap/dist/fonts/glyphicons-halflings-regular.ttf', { destDir: 'fonts' });
  app.import('vendor/bootstrap/dist/fonts/glyphicons-halflings-regular.woff', { destDir: 'fonts' });
};

module.exports = EmberCLIBootstrap;
