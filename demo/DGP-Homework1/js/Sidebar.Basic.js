/**
 * 2016.11.3 edited by ceng-hua
 */

Sidebar.Basic = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();

	container.setBorderTop( '0' );
	container.setPaddingTop( '20px' );

	var fileInput = document.createElement( 'input' );
	fileInput.type = 'file';
	fileInput.addEventListener( 'change', function ( event ) {
		editor.clear();
		editor.loader.loadFile( fileInput.files[ 0 ] );
	} );

	var openFileRow = new UI.Row();
	openFileRow.add( new UI.Text( 'File' ).setWidth( '120px' ) );
	var openFIleButton = new UI.Button('Select File').setWidth( '100px' );;
	openFIleButton.onClick( function () {
		fileInput.click();

	} );
	openFileRow.add(openFIleButton);

	container.add( openFileRow );

	container.add( new UI.HorizontalRule() );	

	var colorFileInput = document.createElement( 'input' );
	colorFileInput.type = 'file';
	colorFileInput.addEventListener( 'change', function ( event ) {
		if ( editor.loader.loadFile( colorFileInput.files[ 0 ] )){
			displayModeSelect.dom.disabled = false;
		}
	} );

	var openColorFileRow = new UI.Row();
	openColorFileRow.add( new UI.Text( 'Dispaly' ).setWidth( '120px' ) );
	var openColorFIleButton = new UI.Button('Select Color File').setWidth( '120px' );;
	openColorFIleButton.onClick( function () {
		colorFileInput.click();
	} );

	openColorFileRow.add(openColorFIleButton);

	container.add( openColorFileRow );

	function onDisplayChanged() {
		signals.objDisplayChanged.dispatch(
			displayModeSelect.getValue()
		);
	}
	var dispalyModeRow = new UI.Row();
	dispalyModeRow.add( new UI.Text( '' ).setWidth( '120px' ) );
	var displayModeSelect = new UI.Select().setOptions( {

		'Default': 'Default',
		'Continuous': 'Continuous',
		'Discrete': 'Discrete'

	} ).setWidth( '150px' );
	displayModeSelect.onChange(function(){
		onDisplayChanged();
	});
	//displayModeSelect.dom.setAttribute("id", "displayModeSelect");
	displayModeSelect.dom.disabled = true;
	dispalyModeRow.add(displayModeSelect);

	container.add( dispalyModeRow );

	container.add( new UI.HorizontalRule() );

	var adjVertexRow = new UI.Row();
	adjVertexRow.add( new UI.Text( 'Adj. of Vertex' ).setWidth( '90px' ) );
	adjVertexRow.add( new UI.Text( 'ID' ).setWidth( '30px' ) );
	var adjVertexInput = new UI.Input('Vertex Id').setWidth( '100px' ).setFontSize( '12px' );
	adjVertexInput.onChange( function () {
		signals.findAdjOfVertex.dispatch(
				adjVertexInput.getValue()
			);
	} );
	adjVertexInput.onClick( function(){
		this.setValue("");
	});
	adjVertexRow.add(adjVertexInput);

	container.add( adjVertexRow );

	var adjFaceVRow = new UI.Row();
	adjFaceVRow.add( new UI.Text( 'Adj. of Face' ).setWidth( '90px' ) );
	adjFaceVRow.add( new UI.Text( 'ID' ).setWidth( '30px' ) );
	var adjFaceVInput = new UI.Input('Face Id').setWidth( '100px' ).setFontSize( '12px' );
	adjFaceVInput.onChange( function () {
		signals.findAdjOfFace.dispatch(
				adjFaceVInput.getValue()
			);
	} );
	adjFaceVInput.onClick( function(){
		this.setValue("");
	});
	adjFaceVRow.add(adjFaceVInput);

	container.add( adjFaceVRow );

	// var adjFaceFRow = new UI.Row();
	// adjFaceFRow.add( new UI.Text( '' ).setWidth( '90px' ) );
	// adjFaceFRow.add( new UI.Text( 'F.id' ).setWidth( '30px' ) );
	// var adjFaceFInput = new UI.Input('Face Id').setWidth( '100px' ).setFontSize( '12px' );
	// adjVertexInput.onChange( function () {
	// 	signals.findAdjOfFace.dispatch(
	// 			adjVertexInput.getValue()
	// 		);
	// } );
	// adjFaceFInput.onClick( function(){
	// 	this.setValue("");
	// });
	// adjFaceFRow.add(adjFaceFInput);

	//container.add( adjFaceFRow );

	var showRegionRow = new UI.Row();
	var showRegionData = new UI.TextArea().setWidth( '150px' ).setHeight( '40px' ).setFontSize( '12px' ).setValue('[]');
	showRegionData.onKeyUp( function () {

		try {

			JSON.parse( showRegionData.getValue() );

			showRegionData.dom.classList.add( 'success' );
			showRegionData.dom.classList.remove( 'fail' );

		} catch ( error ) {

			showRegionData.dom.classList.remove( 'success' );
			showRegionData.dom.classList.add( 'fail' );

		}

	} );

	showRegionRow.add( new UI.Text( 'User data' ).setWidth( '90px' ) );
	showRegionRow.add( showRegionData );

	container.add( showRegionRow );

	var showRegionConfirmRow = new UI.Row();
	showRegionConfirmRow.add( new UI.Text( '' ).setWidth( '90px' ) );
	var showRigionButton1 = new UI.Button('Strict').setWidth( '75px' );;
	showRigionButton1.onClick( function () {
		signals.showRegionStrict.dispatch(
				showRegionData.getValue()
			);
	} );
	var showRigionButton2 = new UI.Button('Relaxed').setWidth( '75px' );;
	showRigionButton2.onClick( function () {
		signals.showRegionRelaxed.dispatch(
				showRegionData.getValue()
			);
	} );
	showRegionConfirmRow.add( showRigionButton1 );
	showRegionConfirmRow.add( showRigionButton2 );

	container.add( showRegionConfirmRow );


	

	var normalFaceRow = new UI.Row();
	normalFaceRow.add( new UI.Text( 'Normal of Face' ).setWidth( '90px' ) );
	normalFaceRow.add( new UI.Text( 'ID' ).setWidth( '30px' ) );
	var normalFaceInput = new UI.Input('Face Id').setWidth( '100px' ).setFontSize( '12px' );
	normalFaceInput.onChange( function () {
		signals.findNormalOfFace.dispatch(
				normalFaceInput.getValue()
			);
	} );
	normalFaceInput.onClick( function(){
		this.setValue("");
	});
	normalFaceRow.add(normalFaceInput);

	container.add( normalFaceRow );

	return container;
};
