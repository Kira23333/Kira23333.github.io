/**
 * 2016.11.3 edited by ceng-hua
 */

Sidebar.Advanced = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();

	container.setBorderTop( '0' );
	container.setPaddingTop( '20px' );

	var fileInput1 = document.createElement( 'input' );
	fileInput1.type = 'file';
	fileInput1.addEventListener( 'change', function ( event ) {
		editor.clear();
		if(editor.loader.loadFile( fileInput1.files[ 0 ] )) {
			//fileInput1.value = undefined;
			openFIleButton2.dom.disabled = false;
		}
	} );

	var openFileRow1 = new UI.Row();
	openFileRow1.add( new UI.Text( 'Source File' ).setWidth( '120px' ) );
	var openFIleButton1 = new UI.Button('Select File').setWidth( '100px' );;
	openFIleButton1.onClick( function () {
		fileInput1.click();
	} );
	openFileRow1.add(openFIleButton1);

	container.add( openFileRow1 );

	//container.add( new UI.HorizontalRule() );

	var fileInput2 = document.createElement( 'input' );
	fileInput2.type = 'file';
	fileInput2.addEventListener( 'change', function ( event ) {
		if (editor.scene.children[2] !==undefined)
			editor.removeObject(editor.scene.children[2]);
		editor.loader.loadFile( fileInput2.files[ 0 ] );
	} );

	var openFileRow2 = new UI.Row();
	openFileRow2.add( new UI.Text( 'Target File' ).setWidth( '120px' ) );
	var openFIleButton2 = new UI.Button('Select File').setWidth( '100px' );
	openFIleButton2.dom.disabled = true;
	openFIleButton2.onClick( function () {
		fileInput2.click();

	} );
	openFileRow2.add(openFIleButton2);

	container.add( openFileRow2 );

	var iterationRows = new UI.Row();
	iterationRows.add( new UI.Text( 'Max iteration' ).setWidth( '120px' ) );
	var iterationInput = new UI.Input('3').setWidth( '100px' ).setFontSize( '12px' );
	iterationRows.add(iterationInput);

	container.add( iterationRows );

	var showlogRow = new UI.Row();
	var showlogText = new UI.TextArea().setWidth( '180px' ).setHeight( '100px' ).setFontSize( '12px' ).setValue('');
	showlogText.dom.disabled = true;

	showlogRow.add( new UI.Text( 'Log' ).setWidth( '80px' ) );
	showlogRow.add( showlogText );

	container.add( showlogRow );

	var icpRow = new UI.Row();
	icpRow.add( new UI.Text( '' ).setWidth( '120px' ) );
	var icpButtun = new UI.Button('Run ICP').setWidth( '100px' );;
	icpButtun.onClick( function () {
		signals.runICP.dispatch(
			iterationInput.getValue(),
			showlogText
			);
	} );
	icpRow.add(icpButtun);

	container.add( icpRow );

	return container;
};
