describe("Backbone Factory", function() {

  describe("Defining and using Sequences", function(){

    beforeEach(function() {
      var emailSequence = BackboneFactory.define_sequence('email', function (n) {
        return "person" + n + "@example.com"
      })
    })

    it("should increment the sequence on successive calls", function(){
      expect(BackboneFactory.next('email')).toBe('person1@example.com')
      expect(BackboneFactory.next('email')).toBe('person2@example.com')
    })

  })

  describe("Defining and using Factories", function () {

    beforeEach(function () {
      BackboneFactory.define_sequence('person_email', function (n) {
        return "person" + n + "@example.com"
      })
      BackboneFactory.define('user', User, function () {
        return {
          name : 'Backbone User',
          email: BackboneFactory.next('person_email')
        }
      })
      BackboneFactory.define('post', Post, { author: BackboneFactory.create('user') })
      
      this.postObject = BackboneFactory.create('post')
      this.userObject = BackboneFactory.create('user')
    })
    

    it("return an instance of the Backbone Object requested", function() {
      expect(this.postObject instanceof Post).toBeTruthy()
      expect(this.userObject instanceof User).toBeTruthy()
    })
          
    // Not sure if this test is needed. But what the hell!
    it("should preserve the defaults if not overriden", function() {
      expect(this.postObject.get('title')).toBe('Default Title')
    })

    

    it("should use the defaults supplied when creating objects", function() {
      expect(this.userObject.get('name')).toBe('Backbone User')
    })

    xit("should work with sequences", function(){
      expect(this.userObject.get('email')).toBe('person2@example.com')
      var anotherUser = BackboneFactory.create('user')
      expect(anotherUser.get('email')).toBe('person3@example.com')
    })

    it("should work if other factories are passed", function(){
      expect(this.postObject.get('author') instanceof User).toBeTruthy()
    })

    it("should override defaults if arguments are passed on creation", function(){
      var userWithEmail = BackboneFactory.create('user', { email: 'overriden@example.com' })
      expect(userWithEmail.get('email')).toBe('overriden@example.com')
    })

    it("should have an id", function() {
      expect(this.userObject.id).toBeDefined()
    })

    it("should have an id that increments on creation", function(){
      var firstID = BackboneFactory.create('user').id
      var secondID = BackboneFactory.create('user').id
      expect(secondID).toBe(firstID + 1)
    })
    
    describe("Error Messages", function() {

      it("should throw an error if factory_name is not proper", function() {
        expect(function(){BackboneFactory.define('wrong name', Post)}).toThrow("Factory name should not contain spaces or other funky characters");
      })

      it("should throw an error if you try to use an undefined factory", function() {
        expect(function(){BackboneFactory.create('undefined_factory')}).toThrow("Factory with name undefined_factory does not exist");
      })

      it("should throw an error if you try to use an undefined sequence", function() {
        expect(function(){BackboneFactory.next('undefined_sequence')}).toThrow("Sequence with name undefined_sequence does not exist");
      })
      
    })
    
  }) 
  
  describe("Adding options to Backbone initializers", function() {
    it("could be omitted", function() {
      var objectFactory = BackboneFactory.define("with_options", ObjectWithOptions)
      var myObject = BackboneFactory.create("with_options")
      expect(myObject.collection).toBeUndefined()
    })
    it("should pass options to model initializer", function() {
      var myCollection = []
      BackboneFactory.define("with_options", ObjectWithOptions)
      var myObject = BackboneFactory.create("with_options", null, { collection : myCollection })
      expect(myObject.collection).toBe(myCollection)
    })
    it("should allow default options when defined", function () {
      var myCollection = []
      BackboneFactory.define("with_options", ObjectWithOptions, undefined, { collection : myCollection })
      var myObject = BackboneFactory.create("with_options")
      expect(myObject.collection).toBe(myCollection)
    })
    it("should override default options", function() {
      var defaultCollection = []
      var myCollection = []
      BackboneFactory.define("with_options", ObjectWithOptions, undefined, { collection : defaultCollection })
      var myObject = BackboneFactory.create("with_options", undefined, { collection : myCollection })
      expect(myObject.collection).not.toBe(defaultCollection)
      expect(myObject.collection).toBe(myCollection)
    })
  })

  describe("Backbone Collection Factories", function() {
    it("should allow to be defined without any defaults nor options", function() {
      BackboneFactory.define("myCollection", Collection)
      var myObjects = BackboneFactory.create("myCollection")
      expect(myObjects).toBeInstanceOf(Collection)
    })
    it("should allow to define a default collection", function() {
      //debugger
      BackboneFactory.define("myCollection", Collection, [{ id : 1, name : "test1" }, { id : 2, name : "test2" }])
      var myObjects = BackboneFactory.create("myCollection")
      expect(myObjects).toBeInstanceOf(Collection)
      expect(myObjects.length).toEqual(2)
    })
    it("should allow to define default options", function() {
      BackboneFactory.define("myCollection", Collection, [{ id : 1, name : "test1" }, { id : 2, name : "test2" }], { model : User })
      var myObjects = BackboneFactory.create("myCollection")
      expect(myObjects).toBeInstanceOf(Collection)
      expect(myObjects.length).toEqual(2)
      expect(myObjects.model).toEqual(User)
      myObjects.each(function (user) {
        expect(user).toBeInstanceOf(User)
      })
      expect(myObjects.get(1).get("name")).toEqual("test1")
    })
    it("should allow to override default collection", function() {
      BackboneFactory.define("myCollection", Collection, [{ id : 1, name : "test1" }, { id : 2, name : "test2" }], { model : User })
      var myObjects = BackboneFactory.create("myCollection", [{ id : 3, name : "test3" }])
      expect(myObjects).toBeInstanceOf(Collection)
      expect(myObjects.length).toEqual(1)
      expect(myObjects.model).toEqual(User)
      myObjects.each(function (user) {
        expect(user).toBeInstanceOf(User)
      })
      expect(myObjects.get(1)).toBeUndefined()
      expect(myObjects.get(3).get("name")).toEqual("test3")
    })
    it("should allow to override default options", function() {
      defaultComparator = function (object) {
        return object
      }
      newComparator = function (object) {
        return 3
      }
      BackboneFactory.define("myCollection", Collection, [{ id : 1, name : "test1" }, { id : 2, name : "test2" }], { model : User, comparator : defaultComparator })
      var myObjects = BackboneFactory.create("myCollection", undefined, { comparator : newComparator })
      expect(myObjects).toBeInstanceOf(Collection)
      expect(myObjects.length).toEqual(2)
      expect(myObjects.comparator).toEqual(newComparator)
    })
  })

  describe("creating lists of models", function() {
    it("should build an array with 10 (default) models", function() {
      var userList = BackboneFactory.createList("user")
      expect(userList).toBeInstanceOf(Array)
      expect(userList.length).toEqual(10)
      _(userList).all(function (user) {
        expect(user).toBeInstanceOf(User)
      })
    })
    it("should build an array with the specified amount of models", function() {
      var userList = BackboneFactory.createList("user", 30)
      expect(userList.length).toEqual(30)
    })
  })
})       

