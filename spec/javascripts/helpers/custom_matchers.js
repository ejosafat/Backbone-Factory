BackboneFactoryMatchers = {
  toBeInstanceOf : function (expected) {
      return this.actual instanceof expected
    }
}
beforeEach(function () {
  this.addMatchers(BackboneFactoryMatchers)
})