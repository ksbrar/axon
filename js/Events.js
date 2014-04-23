// Copyright 2002-2013, University of Colorado Boulder

/**
 * Lightweight event & listener abstraction.
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  var axon = require( 'AXON/axon' );

  /**
   * @class Events
   * @constructor
   * @param values an object hash with the initial values for the properties
   */
  axon.Events = function Events() {
    this.eventListeners = {};
    this.staticEventListeners = {};
  };

  axon.Events.prototype = {

    /////////////////////////////////////////////
    // Below this point are the functions for event handling, basically orthogonal to property value change notifications

    /**
     * Register a listener when the specified eventName is triggered. Use off() to remove.
     * Concurrent modification of listeners (on/off) from within the callback is acceptable.
     * @param eventName {String} the name for the event channel
     * @param callback {Function}
     */
    on: function( eventName, callback ) {
      assert && assert( typeof eventName === 'string', 'eventName should be a string' );
      assert && assert( typeof callback === 'function', 'callback should be a function' );
      
      phetAllocation && phetAllocation( 'Array' );
      this.eventListeners[eventName] = this.eventListeners[eventName] || [];
      this.eventListeners[eventName].push( callback );
    },

    /**
     * Register a listener when the specified eventName is triggered. Listener should be "static", meaning:
     *   1. It shall not add/remove any "static" listeners (including itself) while it is being called (as any type of side-effect), and
     *   2. "static" listeners should not be added while a non-static listener (on the same object) is being called.
     * These restrictions allow us to guarantee that all listeners attached when an event is triggered are called.
     * Since static listeners are stored separately, use offStatic() to remove listeners added with onStatic()
     * @param eventName {String} the name for the event channel
     * @param callback {Function}
     */
    onStatic: function( eventName, callback ) {
      assert && assert( typeof eventName === 'string', 'eventName should be a string' );
      assert && assert( typeof callback === 'function', 'callback should be a function' );
      
      phetAllocation && phetAllocation( 'Array' );
      this.staticEventListeners[eventName] = this.staticEventListeners[eventName] || [];
      this.staticEventListeners[eventName].push( callback );
    },

    /**
     * Adds a function which will only be called back once, after which it is removed as a listener.
     * If you need to remove a function added with 'once' you will have to remove its handle, which is returned by the function.
     * NOTE: Listeners added with once() cannot be removed with off()!
     * @param eventName {String} the name for the event channel
     * @param callback function to be called back once (if at all)
     */
    once: function( eventName, callback ) {
      assert && assert( typeof eventName === 'string', 'eventName should be a string' );
      assert && assert( typeof callback === 'function', 'callback should be a function' );
      
      var events = this;
      var wrappedCallback = function() {
        events.off( eventName, wrappedCallback );

        //If no arguments being passed through, call back without processing arguments, for possible speed
        if ( arguments.length === 0 ) {
          callback();
        }
        else {

          //General case of passing events through to the wrapped callback function
          callback.apply( this, Array.prototype.slice.call( arguments, 0 ) );
        }
      };
      this.on( eventName, wrappedCallback );

      //Return the handle in case it needs to be removed.
      return wrappedCallback;
    },

    /**
     * Remove a listener added with on() from the specified event type.  Does nothing if the listener did not exist.
     * @param eventName {String} the name for the event channel
     * @param callback
     */
    off: function( eventName, callback ) {
      assert && assert( typeof eventName === 'string', 'eventName should be a string' );
      assert && assert( typeof callback === 'function', 'callback should be a function' );
      
      if ( this.eventListeners[eventName] ) {
        var index = this.eventListeners[eventName].indexOf( callback );
        if ( index !== -1 ) {
          this.eventListeners[eventName].splice( index, 1 );
        }
      }
    },

    /**
     * Remove a listener added with onStatic() from the specified event type.  Does nothing if the listener did not exist.
     * @param eventName {String} the name for the event channel
     * @param callback
     */
    offStatic: function( eventName, callback ) {
      assert && assert( typeof eventName === 'string', 'eventName should be a string' );
      assert && assert( typeof callback === 'function', 'callback should be a function' );
      
      if ( this.staticEventListeners[eventName] ) {
        var index = this.staticEventListeners[eventName].indexOf( callback );
        if ( index !== -1 ) {
          this.staticEventListeners[eventName].splice( index, 1 );
        }
      }
    },
    
    /**
     * Trigger an event with the specified name and arguments.
     * @param eventName {String} the name for the event channel
     * @param args... optional arguments to pass to the listeners
     */
    trigger: function( eventName ) {
      assert && assert( typeof eventName === 'string', 'eventName should be a string' );
      
      var listeners = this.eventListeners[eventName];
      var staticListeners = this.staticEventListeners[eventName];

      // listener quantities for normal and static
      var count = listeners ? listeners.length : 0;
      var staticCount = staticListeners ? staticListeners.length : 0;

      // only compute our arguments suffix once, instead of in our inner loop
      var suffix;
      var hasNoArguments = arguments.length === 1;
      if ( !hasNoArguments && ( count > 0 || staticCount > 0 ) ) {
        phetAllocation && phetAllocation( 'Array' );
        suffix = Array.prototype.slice.call( arguments, 1 );
      }

      // make a copy of non-static listeners, in case callback removes listener
      if ( count > 0 ) {
        listeners = listeners.slice();
      }

      var i;

      for ( i = 0; i < count; i++ ) {
        var listener = listeners[i];

        //Simple case of no arguments, call it separately for improved performance in case it is faster (untested)
        if ( hasNoArguments ) {
          listener( arguments );
        }
        else {
          listener.apply( this, suffix );
        }

        assert && assert( !staticListeners || staticListeners.length === staticCount, 'Concurrent modifications of static listeners from within non-static listeners are forbidden' );
      }

      for ( i = 0; i < staticCount; i++ ) {
        var staticListener = staticListeners[i];

        //Simple case of no arguments, call it separately for improved performance in case it is faster (untested)
        if ( hasNoArguments ) {
          staticListener( arguments );
        }
        else {
          staticListener.apply( this, suffix );
        }

        assert && assert( staticListeners.length === staticCount, 'Concurrent modifications from static listeners are forbidden' );
      }
    }
  };

  return axon.Events;
} );
