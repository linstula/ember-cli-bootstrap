var fs   = require('fs');
var path = require('path');

module.exports = {
  name: 'ember-cli-bootstrap',
  included: function included(app) {
    this.app = app;

    var emberCLIVersion = app.project.emberCLIVersion();
    if (emberCLIVersion < '0.0.41') {
      throw new Error('ember-cli-bootstrap requires ember-cli version 0.0.41 or greater.\n');
    }

    var options         = app.options['ember-cli-bootstrap'] || {};
    var modulePath      = path.relative(app.project.root, __dirname);
    var bootstrapPath   = 'vendor/bootstrap/dist/';
    var emberBsPath     = 'vendor/ember-addons.bs_for_ember/dist'
    var javascriptsPath = path.join(emberBsPath, 'js');
    var jsFiles         = options.components ? options.components : fs.readdirSync(path.join(modulePath, javascriptsPath));

    // Import css from bootstrap
    app.import(path.join(bootstrapPath, 'css/bootstrap-theme.css'));
    app.import(path.join(bootstrapPath, 'css/bootstrap.css'));
    app.import(path.join(emberBsPath, 'css/bs-growl-notifications.min.css'));

    // Import javascript files
    app.import(path.join(javascriptsPath, 'bs-core.max.js')); // Import bs-core first

    jsFiles.forEach(function(file) {
      var fileName = file.split('.')[0];
      app.import(path.join(javascriptsPath, fileName + '.max.js'));
    });

    if (options.importBootstrapJS) {
      app.import(path.join(bootstrapPath, 'js/bootstrap.js'));
    }

    // Import glyphicons
    app.import(path.join(bootstrapPath, 'fonts/glyphicons-halflings-regular.eot'), { destDir: '/fonts' });
    app.import(path.join(bootstrapPath, 'fonts/glyphicons-halflings-regular.svg'), { destDir: '/fonts' });
    app.import(path.join(bootstrapPath, 'fonts/glyphicons-halflings-regular.ttf'), { destDir: '/fonts' });
    app.import(path.join(bootstrapPath, 'fonts/glyphicons-halflings-regular.woff'), { destDir: '/fonts' });
  }
};
