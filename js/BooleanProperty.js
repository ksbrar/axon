// Copyright 2002-2013, University of Colorado

/**
 * Subclass of Property that adds methods specific to boolean values
 *
 * @author Sam Reid
 */
define( function( require ) {
  "use strict";

  var Property = require( 'AXON/Property' );
  var inherit = require( 'PHET_CORE/inherit' );
  var axon = require( 'AXON/axon' );

  axon.BooleanProperty = function BooleanProperty( value ) {
    Property.call( this, value );
  };

  inherit( axon.BooleanProperty, Property, {
    toggle: function() {this.set( !this.get() );}
  } );

  return axon.BooleanProperty;
} );