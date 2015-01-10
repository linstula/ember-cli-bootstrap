var fs   = require('fs');
var path = require('path');

module.exports = {
  name: 'ember-cli-bootstrap',
  included: function included(app) {
    this._super.included(app);

    var emberCLIVersion = app.project.emberCLIVersion();
    if (emberCLIVersion < '0.0.41') {
      throw new Error('ember-cli-bootstrap requires ember-cli version 0.0.41 or greater.\n');
    }

    var options         = app.options['ember-cli-bootstrap'] || {};
    var bootstrapPath   = app.bowerDirectory + '/bootstrap/dist';
    var emberBsPath     = app.bowerDirectory + '/ember-addons.bs_for_ember/dist';
    var javascriptsPath = path.join(emberBsPath, 'js/');
    var jsFiles         = options.components ? options.components : fs.readdirSync(path.join(javascriptsPath));

    // remove underscore from bs-popover component's template name
    if (jsFiles.indexOf('bs-popover') > -1 || jsFiles.indexOf('bs-popover.max.js') > -1 ) {
      var popoverPath = path.join(javascriptsPath, 'bs-popover.max.js');
      var data = fs.readFileSync(popoverPath, { 'encoding': 'utf8' });
      var modifiedFile = data.replace(/\/_partial-content-/g, '/partial-content-');

      fs.writeFileSync(popoverPath, modifiedFile, { 'encoding': 'utf8' });
    }

    // Import css from bootstrap
    if (options.importBootstrapTheme) {
      app.import(path.join(bootstrapPath, 'css/bootstrap-theme.css'));
    }

    if (options.importBootstrapCSS !== false) {
      app.import(path.join(bootstrapPath, 'css/bootstrap.css'));
      app.import(path.join(bootstrapPath, 'css/bootstrap.css.map'), { destDir: 'assets' });
      app.import(path.join(emberBsPath, 'css/bs-growl-notifications.min.css'));
    }

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
    if (options.importBootstrapFont !== false) {
      app.import(path.join(bootstrapPath, 'fonts/glyphicons-halflings-regular.eot'), { destDir: '/fonts' });
      app.import(path.join(bootstrapPath, 'fonts/glyphicons-halflings-regular.svg'), { destDir: '/fonts' });
      app.import(path.join(bootstrapPath, 'fonts/glyphicons-halflings-regular.ttf'), { destDir: '/fonts' });
      app.import(path.join(bootstrapPath, 'fonts/glyphicons-halflings-regular.woff'), { destDir: '/fonts' });
    }

    // import bootstrap module
    app.import(path.join('vendor/ember-cli-bootstrap/shim.js'), {
      type: 'vendor',
      exports: { 'bootstrap': ['default'] }
    });
  }
};
