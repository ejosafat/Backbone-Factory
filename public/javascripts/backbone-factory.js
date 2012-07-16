// Backbone Factory JS
// https://github.com/ejosafat/Backbone-Factory
// You can find the origina repo at:
// https://github.com/SupportBee/Backbone-Factory

"use strict"


window.BackboneFactory = (function () {

  var _factories = {};
  var _sequences = {};

  // PRIVATE API
  // Getters and setters
  function getFactory (factoryName) {
    return _factories[factoryName]
  }

  function getSequence (sequenceName) {
    return _sequences[sequenceName]
  }

  function setFactory (factoryName, creationStrategy) {
    _factories[factoryName] = creationStrategy
  }

  function setSequence (sequenceName, sequenceStrategy) {
    _sequences[sequenceName] = {}
    _sequences[sequenceName]['counter'] = 0
    _sequences[sequenceName]['strategy'] = sequenceStrategy
  }

  // Strategies of creation
  function defaultStrategy (factoryName, klass, defaultAttributes, defaultOptions, attributes, options) {
      if (_.isFunction(defaultAttributes)) {
        defaultAttributes = defaultAttributes.call(null)
      } 
      if (_.isFunction(defaultOptions)) {
        defaultOptions = defaultOptions.call(null)
      }
      if (_.isFunction(attributes)) {
        attributes = attributes.call(null)
      }
      if (_.isFunction(options)) {
        options = options.call(null)
      }

      var attributesParams =  _.extend({}, { id: BackboneFactory.next(idSequenceName(factoryName)) }, defaultAttributes, attributes)
      var optionsParams = _.extend({}, defaultOptions ,options)
      return new klass(attributesParams, optionsParams)
  }

  function collectionStrategy (factoryName, klass, defaultModels, defaultOptions, models, options) {
    if (_.isFunction(defaultModels)) {
        defaultModels = defaultModels.call(null)
      } 
      if (_.isFunction(defaultOptions)) {
        defaultOptions = defaultOptions.call(null)
      }
      if (_.isFunction(models)) {
        models = models.call(null)
      }
      if (_.isFunction(options)) {
        options = options.call(null)
      }

      var modelsParam = models || defaultModels || null
      var optionsParams = _.extend({}, defaultOptions ,options)
      return new klass(modelsParam, optionsParams)
  }

  function idSequenceName (factoryName) {
    return "_" + factoryName + "_id"
  }

  // PUBLIC API

  var BackboneFactory = {}

  BackboneFactory.define = function (factoryName, klass, defaultAttributes, defaultOptions) {

    // Check for arguments' sanity
    if(factoryName.match(/[^\w_]+/)){
      throw "Factory name should not contain spaces or other funky characters";
    }

    if (_.isUndefined(klass.prototype.reset)) {
      // Backbone model
      // Lets define a sequence for id
      BackboneFactory.define_sequence(idSequenceName(factoryName), function (n) {
        return n
      })
      // The object creator
      setFactory(factoryName, _.bind(defaultStrategy, null, factoryName, klass, defaultAttributes, defaultOptions))
    } else {
      setFactory(factoryName, _.bind(collectionStrategy, null, factoryName, klass, defaultAttributes, defaultOptions))
    }  
  }

  BackboneFactory.create = function (factoryName, attributes, options) {
    var factory = getFactory(factoryName)
    if (factory === undefined) {
      throw "Factory with name " + factoryName + " does not exist"
    }
    return factory.call(null, attributes, options)  
  }

  BackboneFactory.define_sequence = function (sequenceName, sequenceStrategy) {
    setSequence(sequenceName, sequenceStrategy)
  }

  BackboneFactory.next = function (sequenceName) {
    var sequence = getSequence(sequenceName)
    if (sequence === undefined) {
      throw "Sequence with name " + sequenceName + " does not exist"
    }
    sequence['counter'] += 1
    return sequence['strategy'].call(null, sequence['counter']) 
  }

  return BackboneFactory
}())
