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

  var BackboneFactory = {

    factories: {},
    sequences: {},

    define: function(factory_name, klass, defaults){

      // Check for arguments' sanity
      if(factory_name.match(/[^\w_]+/)){
        throw "Factory name should not contain spaces or other funky characters";
      }

      if(defaults === undefined) defaults = function(){return {}};

      // The object creator
      this.factories[factory_name] = function(options){
        if(options === undefined) options = function(){return {}};
        var params =  _.extend({}, {id: BackboneFactory.next("_" + factory_name + "_id")}, defaults.call(), options.call());
        return new klass(params);
      };

      // Lets define a sequence for id
      BackboneFactory.define_sequence("_"+ factory_name +"_id", function(n){
        return n
      });
    },

    create: function(factory_name, options){
      if(this.factories[factory_name] === undefined){
        throw "Factory with name " + factory_name + " does not exist";
      }
      return this.factories[factory_name].apply(null, [options]);        
    },

    define_sequence: function (sequenceName, sequenceStrategy) {
      setSequence(sequenceName, sequenceStrategy)
    },

    next: function(sequenceName){
      var sequence = getSequence(sequenceName)
      if (sequence === undefined) {
        throw "Sequence with name " + sequenceName + " does not exist"
      }
      sequence['counter'] += 1
      return sequence['strategy'].call(null, sequence['counter']) 
    }
  }
  return BackboneFactory
}())
