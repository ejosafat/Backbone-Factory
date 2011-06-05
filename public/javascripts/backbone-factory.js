// Backbone Factory JS
//

(function(){
  window.BackboneFactory = {

    factories: {},
    sequences: {},

    define: function(factory_name, klass, defaults){
      //this.factories[factory_name] = {};
      this.factories[factory_name] = function(){
        return new klass(defaults);
      };
      //this.factories[factory_name]['defaults'] = defaults;
    },

    create: function(factory_name){
      if(this.factories[factory_name] === undefined){
        throw "Factory with name " + factory_name + " does not exist";
      }
      return (this.factories[factory_name].call());        
    },

    define_sequence: function(sequence_name, callback){
      this.sequences[sequence_name] = {}
      this.sequences[sequence_name]['counter'] = 0;
      this.sequences[sequence_name]['callback'] = callback; 
    },

    next: function(sequence_name){
      console.log(this.sequences[sequence_name]['counter']);
      this.sequences[sequence_name]['counter'] += 1;
      return this.sequences[sequence_name]['callback'].apply(null, [this.sequences[sequence_name]['counter']]); //= callback; 
    }
  }
})();
