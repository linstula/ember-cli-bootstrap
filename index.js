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
  var env             = app.env;
  var stylePath       = 'vendor/bootstrap/dist/css/';
  var javascriptsPath = 'node_modules/ember-cli-bootstrap/vendor/ember-addons.bs_for_ember/dist/js/';
  var envModifier     = env === 'production' ? '.min' : '.max';
  var jsFiles         = fs.readdirSync(javascriptsPath);

  // Import css from bootstrap
  app.import(stylePath + 'bootstrap-theme.css');
  app.import(stylePath + 'bootstrap.css');

  // Import javascript files from bootstrap_for_ember
  app.import('../../' + javascriptsPath + 'bs-core' + envModifier + '.js'); // Import bs-core first

  jsFiles.forEach(function(file) {
    var fileName = file.split('.')[0];
    app.import('../../' + javascriptsPath + fileName + envModifier + '.js');
  });
};

module.exports = EmberCLIBootstrap;
