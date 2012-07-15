// Backbone Factory JS
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

  // Strategy of creation
  function defaultStrategy (factoryName, klass, defaults, options) {
      if (options === undefined) {
        options = function () {return {}}
      } 
      var params =  _.extend({}, { id: BackboneFactory.next(idSequenceName(factoryName)) }, defaults.call(), options.call())
      return new klass(params)
  }
  function idSequenceName (factoryName) {
    return "_" + factoryName + "_id"
  }

  // PUBLIC API

  var BackboneFactory = {}

  BackboneFactory.define = function (factoryName, klass, defaults) {

    // Check for arguments' sanity
    if(factoryName.match(/[^\w_]+/)){
      throw "Factory name should not contain spaces or other funky characters";
    }

    if(defaults === undefined) defaults = function(){return {}}

    // The object creator
    setFactory(factoryName, _.bind(defaultStrategy, null, factoryName, klass, defaults))

    // Lets define a sequence for id
    BackboneFactory.define_sequence(idSequenceName(factoryName), function (n) {
      return n
    })
  }

  BackboneFactory.create = function (factoryName, options) {
    var factory = getFactory(factoryName)
    if (factory === undefined) {
      throw "Factory with name " + factoryName + " does not exist"
    }
    return factory.call(null, options)  
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
