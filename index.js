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

    if (options.importBootstrapCSS !== false) {
      app.import({
        development: path.join(bootstrapPath, 'css/bootstrap.css'),
        production: path.join(bootstrapPath, 'css/bootstrap.min.css')
      });
      app.import({
        development: path.join(bootstrapPath, 'css/bootstrap.css.map'),
        production: false
      }, { destDir: 'assets' });
      app.import(path.join(emberBsPath, 'css/bs-growl-notifications.min.css'));
    }

    // Import css from bootstrap
    if (options.importBootstrapTheme) {
      app.import({
        development: path.join(bootstrapPath, 'css/bootstrap-theme.css'),
        production: path.join(bootstrapPath, 'css/bootstrap-theme.min.css')
      });
      app.import({
        development: path.join(bootstrapPath, 'css/bootstrap-theme.css.map'),
        production: false
      }, { destDir: 'assets' });
    }

    // Import javascript files
    app.import({
      development: path.join(javascriptsPath, 'bs-core.max.js'),
      production: path.join(javascriptsPath, 'bs-core.min.js')
    }); // Import bs-core first

    jsFiles.forEach(function(file) {
      var fileName = file.split('.')[0];
      app.import({
        development: path.join(javascriptsPath, fileName + '.max.js'),
        production: path.join(javascriptsPath, fileName + '.min.js')
      });
    });

    if (options.importBootstrapJS) {
      app.import({
        development: path.join(bootstrapPath, 'js/bootstrap.js'),
        production: path.join(bootstrapPath, 'js/bootstrap.min.js')
      });
    }

    // Import glyphicons
    if (options.importBootstrapFont !== false) {
      app.import(path.join(bootstrapPath, 'fonts/glyphicons-halflings-regular.eot'), { destDir: '/fonts' });
      app.import(path.join(bootstrapPath, 'fonts/glyphicons-halflings-regular.svg'), { destDir: '/fonts' });
      app.import(path.join(bootstrapPath, 'fonts/glyphicons-halflings-regular.ttf'), { destDir: '/fonts' });
      app.import(path.join(bootstrapPath, 'fonts/glyphicons-halflings-regular.woff'), { destDir: '/fonts' });
    }
  }
};
