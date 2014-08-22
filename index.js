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
  var emberCLIVersion = app.project.emberCLIVersion();
  if (emberCLIVersion < '0.0.41') {
    throw new Error('ember-cli-bootstrap requires ember-cli version 0.0.41 or greater.\n');
  }

  var options         = app.options['ember-cli-bootstrap'];
  var bootstrapPath   = 'vendor/bootstrap/dist/'
  var javascriptsPath = 'node_modules/ember-cli-bootstrap/vendor/ember-addons.bs_for_ember/dist/js/';
  var jsFiles         = fs.readdirSync(javascriptsPath);

  // Import css from bootstrap
  app.import(bootstrapPath + 'css/bootstrap-theme.css');
  app.import(bootstrapPath + 'css/bootstrap.css');

  // Import javascript files from bootstrap_for_ember
  app.import('../../' + javascriptsPath + 'bs-core.max.js'); // Import bs-core first

  jsFiles.forEach(function(file) {
    var fileName = file.split('.')[0];
    app.import('../../' + javascriptsPath + fileName + '.max.js');
  });

  if (options.importBootstrapJS) {
    app.import(bootstrapPath + 'js/bootstrap'  + '.js');
  }

  // Import glyphicons
  app.import(bootstrapPath + 'fonts/glyphicons-halflings-regular.eot', { destDir: '/fonts' });
  app.import(bootstrapPath + 'fonts/glyphicons-halflings-regular.svg', { destDir: '/fonts' });
  app.import(bootstrapPath + 'fonts/glyphicons-halflings-regular.ttf', { destDir: '/fonts' });
  app.import(bootstrapPath + 'fonts/glyphicons-halflings-regular.woff', { destDir: '/fonts' });
};

module.exports = EmberCLIBootstrap;
