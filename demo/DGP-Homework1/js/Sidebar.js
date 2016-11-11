/**
 * @author mrdoob / http://mrdoob.com/
 * 2016.11.3 edited by ceng-hua
 */

var Sidebar = function ( editor ) {

	var container = new UI.Panel();
	container.setId( 'sidebar' );

	//

	var basicTab = new UI.Text( 'BASIC' ).onClick( onClick );
	var advancedTab = new UI.Text( 'ADVANCED' ).onClick( onClick );

	var tabs = new UI.Div();
	tabs.setId( 'tabs' );
	tabs.add( basicTab, advancedTab );
	container.add( tabs );

	function onClick( event ) {

		select( event.target.textContent );

	}

	//

	var basic = new UI.Span();
	basic.add(
		new Sidebar.Basic(editor)
	);
	container.add( basic );

	var advanced = new UI.Span();
	advanced.add(
		new Sidebar.Advanced(editor)
	);
	container.add( advanced );


	//

	function select( section ) {

		basicTab.setClass( '' );
		advancedTab.setClass( '' );

		basic.setDisplay( 'none' );
		advanced.setDisplay( 'none' );

		switch ( section ) {
			case 'BASIC':
				basicTab.setClass( 'selected' );
				basic.setDisplay( '' );
				break;
			case 'ADVANCED':
				advancedTab.setClass( 'selected' );
				advanced.setDisplay( '' );
				break;
		}

	}

	select( 'BASIC' );

	return container;

};
