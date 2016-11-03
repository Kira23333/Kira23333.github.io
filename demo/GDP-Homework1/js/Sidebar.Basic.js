/**
 * 2016.11.3 edited by ceng-hua
 */

Sidebar.Basic = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();

	container.setBorderTop( '0' );
	container.setPaddingTop( '20px' );

	var openFileRow = new UI.Row();
	var materialColor = new UI.Color().onChange( update );

	openFileRow.add( new UI.Text( 'Open' ).setWidth( '90px' ) );
	openFileRow.add( materialColor );

	container.add( materialColorRow );
};
