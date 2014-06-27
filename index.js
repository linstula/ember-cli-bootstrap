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
  var rootPath = 'vendor/bootstrap/dist/css/';

  app.import(rootPath + 'bootstrap-theme.css');
  app.import(rootPath + 'bootstrap.css');
};

module.exports = EmberCLIBootstrap;
