module.exports = {
  normalizeEntityName: function() {
    // allows us to run ember -g ember-cli-bootstrap and not blow up
    // because ember cli normally expects the format
    // ember generate <entitiyName> <blueprint>
  },

  afterInstall: function() {
    var addonContext = this;

    return this.addBowerPackageToProject('bootstrap', '~3.3')
      .then(function() {
        return addonContext.addBowerPackageToProject('ember-addons.bs_for_ember', '~0.7.0');
      });
  }
};
