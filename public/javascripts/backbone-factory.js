// Backbone Factory JS
// https://github.com/ejosafat/Backbone-Factory
// You can find the origina repo at:
// https://github.com/SupportBee/Backbone-Factory

"use strict"


window.BackboneFactory = (function () {

  var _factories = {};
  var _sequences = {};

  var DEFAULT_LIST_SIZE = 10

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

  // Strategies of creation and auxiliary methods
  function idSequenceName (factoryName) {
    return "_" + factoryName + "_id"
  }

  function normalizedParams (params) {
    _(params).each(function (paramValue, paramName) {
      if (_.isFunction(paramValue)) {
        params[paramName] = paramValue.call(null)
      }
    })
    return params
  }

  function defaultStrategy (factoryName, klass, defaults, runtimeOptions) {
      var params = normalizedParams(_.extend({}, defaults, runtimeOptions))

      var attributesParams =  _.extend({}, { id: BackboneFactory.next(idSequenceName(factoryName)) }, params.defaultAttributes, params.attributes)
      var optionsParams = _.extend({}, params.defaultOptions, params.options)
      return new klass(attributesParams, optionsParams)
  }

  function collectionStrategy (factoryName, klass, defaults, runtimeOptions) {
      var params = normalizedParams(_.extend({}, defaults, runtimeOptions))

      var modelsParam = params.attributes || params.defaultAttributes || null
      var optionsParams = _.extend({}, params.defaultOptions, params.options)
      return new klass(modelsParam, optionsParams)
  }

  

  // PUBLIC API

  var BackboneFactory = {}

  // Lists
  BackboneFactory.createList = function (factoryName, size) {
    var list = []
    size = size || DEFAULT_LIST_SIZE
    for (var i = 0; i < size; i++) {
      list.push(BackboneFactory.create(factoryName))
    }
    return list
  }
  
  BackboneFactory.setDefaultListSize = function (size) {
    if (_.isNumber(size) && size > 0) {
      DEFAULT_LIST_SIZE = size
    }
  }


  // Factories
  BackboneFactory.define = function (factoryName, klass, defaultAttributes, defaultOptions) {

    // Check for arguments' sanity
    if(factoryName.match(/[^\w_]+/)){
      throw "Factory name should not contain spaces or other funky characters";
    }

    var defaults = {
      defaultAttributes : defaultAttributes,
      defaultOptions : defaultOptions
    }

    if (_.isUndefined(klass.prototype.reset)) {
      // Backbone model
      // Lets define a sequence for id
      BackboneFactory.define_sequence(idSequenceName(factoryName), function (n) {
        return n
      })
      // The object creator
      setFactory(factoryName, _.bind(defaultStrategy, null, factoryName, klass, defaults))
    } else {
      setFactory(factoryName, _.bind(collectionStrategy, null, factoryName, klass, defaults))
    }  
  }

  BackboneFactory.create = function (factoryName, attributes, options) {
    var factory = getFactory(factoryName)
    if (factory === undefined) {
      throw "Factory with name " + factoryName + " does not exist"
    }
    var runtimeOptions = {
      attributes : attributes,
      options : options
    }
    return factory.call(null, runtimeOptions)  
  }


  // Sequences
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
