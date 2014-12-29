module.exports = {
  normalizeEntityName: function() {
    // allows us to run ember -g ember-cli-bootstrap and not blow up
    // because ember cli normally expects the format
    // ember generate <entitiyName> <blueprint>
  },

  afterInstall: function() {
    var addonContext = this;

    // Ability to add multiple bower packages introduced in ember-cli 0.1.2
    if (this.addBowerPackagesToProject) {
      return this.addBowerPackagesToProject([
        {name: 'bootstrap', target: '~3.3'},
        {name: 'ember-addons.bs_for_ember', target: '~0.7.0'}
      ]);
    } else { // Else need to add them individually
      return this.addBowerPackageToProject('bootstrap', '~3.3').then(function(){
        return addonContext.addBowerPackageToProject('ember-addons.bs_for_ember', '~0.7.0');
      });
    }

  }
};
