/**
 * @author mrdoob / http://mrdoob.com/
 * 2016.11.3 edited by ceng-hua
 */

var Loader = function ( editor ) {

	var scope = this;
	var signals = editor.signals;

	this.texturePath = '';

	this.loadFile = function ( file ) {

		var filename = file.name;
		editor.filename = filename;
		var extension = filename.split( '.' ).pop().toLowerCase();

		var reader = new FileReader();
		reader.addEventListener( 'progress', function ( event ) {

			var size = '(' + Math.floor( event.total / 1000 ).format() + ' KB)';
			var progress = Math.floor( ( event.loaded / event.total ) * 100 ) + '%';
			console.log( 'Loading', filename, size, progress );

		} );

		switch ( extension ) {

			case 'obj':

				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;
					if (contents === null) {
						alert("Files not exists");
						return false;
					}

					var object = new THREE.OBJLoader().parse( contents );
					object.name = filename;
					//object.visible = false;

					editor.execute( new AddObjectCommand( object ) );

				}, false );
				reader.readAsText( file );

				break;

			case 'off':
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;
					if (contents === null) {
						alert("Files not exists");
						return false;
					}

					var object = new THREE.OFFLoader().parse( contents );
					object.name = filename;
					//object.visible = false;

					editor.execute( new AddObjectCommand( object ) );

				}, false );
				reader.readAsText( file );
				break;

			case 'txt':
				reader.addEventListener( 'load', function ( event ) {

					var contents = event.target.result;
					if (contents === null) {
						alert("Files not exists");
						return false;
					}
					if ( contents.indexOf( '\r\n' ) !== - 1 ) {

						// This is faster than String.split with regex that splits on both
						contents = contents.replace( /\r\n/g, '\n' );

					}

					if ( contents.indexOf( '\\\n' ) !== - 1) {

						// join lines separated by a line continuation character (\)
						contents = contents.replace( /\\\n/g, '' );

					}

					var lines = contents.split( '\n' );
					//var colors = [];
					var max_color = 13;
					var fR = 0.1 / max_color, fG = 0.9 / max_color, fB = 0.6/ max_color;
					var color = new THREE.Color( 0xffffff );
					var geometry;
					var geometry_ = editor.scene.children[1].children[0].geometry;
					if (geometry_ instanceof THREE.BufferGeometry) {
						geometry = new THREE.Geometry().fromBufferGeometry( editor.scene.children[1].children[0].geometry);
					}
					else geometry = geometry_;
					var material = editor.scene.children[1].children[0].material;
					for ( var i = 0, l = lines.length; i < l; i ++ ) {
						line = lines[ i ];
						f = parseFloat(line);
						if (isNaN(f)) continue;
    					color.setRGB(f * fR, f * fG, f * fB );
    					if (i > 50000)console.log(i.toString(10) + " " + line);
						geometry.faces[i].color = new THREE.Color(color);
					}
					var bufferGeometry = new THREE.BufferGeometry().fromGeometry( geometry );
					var mesh1 = new THREE.Mesh(bufferGeometry, material);
					mesh1.visible = false;
					editor.execute( new AddObjectCommand( mesh1 ) );

					var color_label = [];
					for (var i = 0; i < 12; i++) {
						color_label.push(Math.random() * 0xffffff);
					};
					for ( var i = 0, l = lines.length; i < l; i ++ ) {
						line = lines[ i ];
						f = parseInt(line);
						if (isNaN(f)) continue;
						geometry.faces[i].color.setHex(color_label[f]);
					}
					bufferGeometry = new THREE.BufferGeometry().fromGeometry( geometry );
					var mesh2 = new THREE.Mesh(bufferGeometry, material);
					mesh2.visible = false;
					editor.execute( new AddObjectCommand( mesh2 ) );

					editor.color = true;
				}, false );
				reader.readAsText( file );

				break;

			default:

				alert( 'Unsupported file format (' + extension +  ').' );

				break;

		}
		return true;

	};

};
