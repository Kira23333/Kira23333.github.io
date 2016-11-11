/**
 * @author mrdoob / http://mrdoob.com/
 * 2016.11.3 edited by ceng-hua
 */

var Viewport = function ( editor ) {

	var signals = editor.signals;

	var container = new UI.Panel();
	container.setId( 'viewport' );
	container.setPosition( 'absolute' );

	container.add( new Viewport.Info( editor ) );

	//

	var renderer = null;

	var camera = editor.camera;
	var scene = editor.scene;
	var sceneHelpers = editor.sceneHelpers;

	var objects = [];
	var cubeSize = 0.002;

	//


	// helpers

	var grid = new THREE.GridHelper( 30, 60 );
	sceneHelpers.add( grid );

	//

	var box = new THREE.Box3();

	var selectionBox = new THREE.BoxHelper();
	selectionBox.material.depthTest = false;
	selectionBox.material.transparent = true;
	selectionBox.visible = false;
	sceneHelpers.add( selectionBox );

	var objectPositionOnDown = null;
	var objectRotationOnDown = null;
	var objectScaleOnDown = null;

	var transformControls = new THREE.TransformControls( camera, container.dom );
	transformControls.addEventListener( 'change', function () {

		var object = transformControls.object;

		if ( object !== undefined ) {

			selectionBox.update( object );

			if ( editor.helpers[ object.id ] !== undefined ) {

				editor.helpers[ object.id ].update();

			}

			signals.refreshSidebarObject3D.dispatch( object );

		}

		render();

	} );
	transformControls.addEventListener( 'mouseDown', function () {

		var object = transformControls.object;

		objectPositionOnDown = object.position.clone();
		objectRotationOnDown = object.rotation.clone();
		objectScaleOnDown = object.scale.clone();

		controls.enabled = false;

	} );
	transformControls.addEventListener( 'mouseUp', function () {

		var object = transformControls.object;

		if ( object !== undefined ) {

			switch ( transformControls.getMode() ) {

				case 'translate':

					if ( ! objectPositionOnDown.equals( object.position ) ) {

						editor.execute( new SetPositionCommand( object, object.position, objectPositionOnDown ) );

					}

					break;

				case 'rotate':

					if ( ! objectRotationOnDown.equals( object.rotation ) ) {

						editor.execute( new SetRotationCommand( object, object.rotation, objectRotationOnDown ) );

					}

					break;

				case 'scale':

					if ( ! objectScaleOnDown.equals( object.scale ) ) {

						editor.execute( new SetScaleCommand( object, object.scale, objectScaleOnDown ) );

					}

					break;

			}

		}

		controls.enabled = true;

	} );

	sceneHelpers.add( transformControls );

	// object picking

	var raycaster = new THREE.Raycaster();
	var mouse = new THREE.Vector2();

	// events

	function getIntersects( point, objects ) {

		mouse.set( ( point.x * 2 ) - 1, - ( point.y * 2 ) + 1 );

		raycaster.setFromCamera( mouse, camera );

		return raycaster.intersectObjects( objects );

	}

	var onDownPosition = new THREE.Vector2();
	var onUpPosition = new THREE.Vector2();
	var onDoubleClickPosition = new THREE.Vector2();

	function getMousePosition( dom, x, y ) {

		var rect = dom.getBoundingClientRect();
		return [ ( x - rect.left ) / rect.width, ( y - rect.top ) / rect.height ];

	}

	function handleClick() {

		if ( onDownPosition.distanceTo( onUpPosition ) === 0 ) {

			var intersects = getIntersects( onUpPosition, objects );

			if ( intersects.length > 0 ) {

				var object = intersects[ 0 ].object;

				if ( object.userData.object !== undefined ) {

					// helper

					editor.select( object.userData.object );

				} else {

					editor.select( object );

				}

			} else {

				editor.select( null );

			}

			render();

		}

	}

	function onMouseDown( event ) {

		event.preventDefault();

		var array = getMousePosition( container.dom, event.clientX, event.clientY );
		onDownPosition.fromArray( array );

		document.addEventListener( 'mouseup', onMouseUp, false );

	}

	function onMouseUp( event ) {

		var array = getMousePosition( container.dom, event.clientX, event.clientY );
		onUpPosition.fromArray( array );

		handleClick();

		document.removeEventListener( 'mouseup', onMouseUp, false );

	}

	function onTouchStart( event ) {

		var touch = event.changedTouches[ 0 ];

		var array = getMousePosition( container.dom, touch.clientX, touch.clientY );
		onDownPosition.fromArray( array );

		document.addEventListener( 'touchend', onTouchEnd, false );

	}

	function onTouchEnd( event ) {

		var touch = event.changedTouches[ 0 ];

		var array = getMousePosition( container.dom, touch.clientX, touch.clientY );
		onUpPosition.fromArray( array );

		handleClick();

		document.removeEventListener( 'touchend', onTouchEnd, false );

	}

	function onDoubleClick( event ) {

		var array = getMousePosition( container.dom, event.clientX, event.clientY );
		onDoubleClickPosition.fromArray( array );

		var intersects = getIntersects( onDoubleClickPosition, objects );

		if ( intersects.length > 0 ) {

			var intersect = intersects[ 0 ];

			signals.objectFocused.dispatch( intersect.object );

		}

	}

	container.dom.addEventListener( 'mousedown', onMouseDown, false );
	container.dom.addEventListener( 'touchstart', onTouchStart, false );
	container.dom.addEventListener( 'dblclick', onDoubleClick, false );

	// controls need to be added *after* main logic,
	// otherwise controls.enabled doesn't work.

	var controls = new THREE.EditorControls( camera, container.dom );
	controls.addEventListener( 'change', function () {

		transformControls.update();
		signals.cameraChanged.dispatch( camera );

	} );

	// signals

	signals.editorCleared.add( function () {

		controls.center.set( 0, 0, 0 );
		render();

	} );

	var currentDisplayType = null;
	signals.objDisplayChanged.add( function ( displayType ) {
		editor.clearResult();
		if (editor.color === false) {
			alert("Color file has not loaded");
			return;
		}
		if ( currentDisplayType !== displayType ) {

			currentFogType = displayType;

			var scene = editor.scene;

			for ( var i = 0, l = scene.children.length; i < l; i ++ ) {

				var object = scene.children[ i ];

				object.traverseVisible( function ( object ) {

					if ( object instanceof THREE.Mesh ) {
						object.visible =false;

					}

				} );


			}
			switch ( displayType ) {

				case 'Default':
					scene.children[1].children[0].visible = true;
					break;
				case 'Continuous':
					scene.children[2].visible = true;
					break;
				case 'Discrete':
					scene.children[3].visible = true;
					break;

			}
		}


		render();

	} );


	signals.findAdjOfFace.add( function ( id ) {
		var index = parseInt( id ) - 1;
		if (isNaN(index)) {
			alert("It's not a number");
			return;
		}
		editor.clearResult();
		var scene = editor.scene;

		for ( var i = 0, l = scene.children.length; i < l; i ++ ) {

			var object = scene.children[ i ];


			object.traverse( function ( object ) {

				if ( object instanceof THREE.Mesh ) {
					geometry = object.geometry;
					if (geometry instanceof THREE.BufferGeometry) {
						object.visible = false;
					}
					else if (geometry instanceof THREE.Geometry){
						object.visible = true;
						var adjFaceColor = 0x0000ff;
						var farFaceColor = 0xffffff;
						var selFaceColor = 0xff0000;
						var f = geometry.faces[index];
						if (f.color === undefined) {
							f.color = new THREE.Color(selFaceColor);
						}
						else {
							f.color.setHex(selFaceColor);
						}
						//if (v === undefined) {return};
						function isAdj( face1, face2 ) {
							var commonVertex = 0;
							if (face1.a == face2.a) commonVertex++;
							if (face1.a == face2.b) commonVertex++;
							if (face1.a == face2.c) commonVertex++;
							if (face1.b == face2.a) commonVertex++;
							if (face1.b == face2.b) commonVertex++;
							if (face1.b == face2.c) commonVertex++;
							if (face1.c == face2.a) commonVertex++;
							if (face1.c == face2.b) commonVertex++;
							if (face1.c == face2.c) commonVertex++;
							if (commonVertex == 2) return true; else return false;
						}
						for (var i = 0; i < geometry.faces.length; i++) {
							if (i === index) continue;
							face = geometry.faces[i];
							if (isAdj(f, face)) {
								if (face.color === undefined) {
									face.color = new THREE.Color(adjFaceColor);
								}
								else {
									face.color.setHex(adjFaceColor);
								}
							}
							else if (face.color === undefined) {
								face.color = new THREE.Color(farFaceColor);
							}
							else {
								face.color.setHex(farFaceColor);
							}
						}
						geometry.colorsNeedUpdate = true;
					}
				}
			} );
		}

		render();
	});

	signals.findAdjOfVertex.add( function ( id ) {
		var index = parseInt( id ) - 1;
		if (isNaN(index)) {
			alert("It's not a number");
			return;
		}
		editor.clearResult();
		var scene = editor.scene;

		for ( var i = 0, l = scene.children.length; i < l; i ++ ) {

			var object = scene.children[ i ];


			object.traverse( function ( object ) {

				if ( object instanceof THREE.Mesh ) {
					geometry = object.geometry;
					if (geometry instanceof THREE.BufferGeometry) {
						object.visible = false;
					}
					else if (geometry instanceof THREE.Geometry){
						object.visible = true;
						var adjVertex = new Set();
						var adjFaceColor = 0x0000ff;
						var farFaceColor = 0xffffff;
						var v = geometry.vertices[index];
						//if (v === undefined) {return};
						for (var i = 0; i < geometry.faces.length; i++) {
							face = geometry.faces[i];
							if (index === face.a || index === face.b || index ===face.c) {
								if (index !== face.a) adjVertex.add(geometry.vertices[face.a]);
								if (index !== face.b) adjVertex.add(geometry.vertices[face.b]);
								if (index !== face.c) adjVertex.add(geometry.vertices[face.c]);
								if (face.color === undefined) {
									face.color = new THREE.Color(adjFaceColor);
								}
								else {
									face.color.setHex(adjFaceColor);
								}
							}
							else if (face.color === undefined) {
								face.color = new THREE.Color(farFaceColor);
							}
							else {
								face.color.setHex(farFaceColor);
							}
						}
						geometry.colorsNeedUpdate = true;
						var boxgeometry = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
						var material = new THREE.MeshBasicMaterial( {color: 0xff0000} );
						var cube = new THREE.Mesh( boxgeometry, material );

						cube.translateX ( v.x );
						cube.translateY ( v.y );
						cube.translateZ ( v.z );
						editor.result[cube.uuid] = cube;
						scene.add( cube );
						adjVertex.forEach(function ( vertex ){
							var geometry = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
							var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
							var cube = new THREE.Mesh( geometry, material );
							cube.translateX ( vertex.x );
							cube.translateY ( vertex.y );
							cube.translateZ ( vertex.z );
							editor.result[cube.uuid] = cube;
							scene.add( cube );
						});
					}
				}
			} );
		}

		render();
	});

	signals.findNormalOfFace.add( function ( id ) {
		var index = parseInt( id ) - 1;
		if (isNaN(index)) {
			alert("It's not a number");
			return;
		}
		editor.clearResult();
		var scene = editor.scene;

		for ( var i = 0, l = scene.children.length; i < l; i ++ ) {

			var object = scene.children[ i ];


			object.traverse( function ( object ) {

				if ( object instanceof THREE.Mesh ) {
					geometry = object.geometry;
					if (geometry instanceof THREE.BufferGeometry) {
						object.visible = false;
					}
					else if (geometry instanceof THREE.Geometry){
						object.visible = true;
						var f = geometry.faces[index];
						var a = geometry.vertices[f.a], b = geometry.vertices[f.b], c = geometry.vertices[f.c];
						var v = new THREE.Vector3((a.x + b.x + c.x)/3, (a.y + b.y + c.y)/3, (a.z + b.z + c.z)/3);
						var n = f.normal;
						geometry.colorsNeedUpdate = true;
						var cylinderGeometry = new THREE.CylinderGeometry( 0.001, 0.001, 0.1, 4);
						var material = new THREE.MeshBasicMaterial( {color: 0x00ffff} );
						var cylinder = new THREE.Mesh( cylinderGeometry, material );


						cylinder.translateX ( v.x );
						cylinder.translateY ( v.y );
						cylinder.translateZ ( v.z );
						cylinder.rotateX(Math.asin(n.z));
						cylinder.rotateZ(Math.asin(-n.x/Math.sqrt(1 - n.z * n.z)));
						console.log(v);
						editor.result[cylinder.uuid] = cylinder;
						scene.add( cylinder );


						var adjFaceColor = 0x0000ff;
						var farFaceColor = 0xffffff;
						var selFaceColor = 0xff0000;
						if (f.color === undefined) {
							f.color = new THREE.Color(selFaceColor);
						}
						else {
							f.color.setHex(selFaceColor);
						}
						for (var i = 0; i < geometry.faces.length; i++) {
							if (i === index) continue;
							face = geometry.faces[i];
							if (face.color === undefined) {
								face.color = new THREE.Color(farFaceColor);
							}
							else {
								face.color.setHex(farFaceColor);
							}
						}
						geometry.colorsNeedUpdate = true;
					}
				}
			} );
		}

		render();
	});

	signals.showRegionStrict.add( function ( text ) {
		try {

			var list = JSON.parse( text );
			var set = new Set(list);

			editor.clearResult();
			var scene = editor.scene;

			for ( var i = 0, l = scene.children.length; i < l; i ++ ) {

				var object = scene.children[ i ];


				object.traverse( function ( object ) {

					if ( object instanceof THREE.Mesh ) {
						geometry = object.geometry;
						if (geometry instanceof THREE.BufferGeometry) {
							object.visible = false;
						}
						else if (geometry instanceof THREE.Geometry){
							object.visible = true;

							var adjFaceColor = 0x0000ff;
							var farFaceColor = 0xffffff;
							var selFaceColor = 0xff0000;
							for (var i = 0; i < geometry.faces.length; i++) {
								face = geometry.faces[i];
								if (set.has(face.a + 1) && set.has(face.b + 1) && set.has(face.c + 1)) {
									if (face.color === undefined) {
									face.color = new THREE.Color(adjFaceColor);
									}
									else {
										face.color.setHex(adjFaceColor);
									}
								}
								else if (face.color === undefined) {
									face.color = new THREE.Color(farFaceColor);
								}
								else {
									face.color.setHex(farFaceColor);
								}
							}
							geometry.colorsNeedUpdate = true;
						}
					}
				} );
			}
			set.forEach(function ( id ){
				var _geometry = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
				var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
				var cube = new THREE.Mesh( _geometry, material );
				cube.translateX ( geometry.vertices[id - 1].x );
				cube.translateY ( geometry.vertices[id - 1].y );
				cube.translateZ ( geometry.vertices[id - 1].z );
				editor.result[cube.uuid] = cube;
				scene.add( cube );
			});

			render();

		} catch ( error ) {

			alert("Invalid input");
			return;

		}
	});

	signals.showRegionRelaxed.add( function ( text ) {
		try {

			var list = JSON.parse( text );
			var set = new Set(list);

			editor.clearResult();
			var scene = editor.scene;

			for ( var i = 0, l = scene.children.length; i < l; i ++ ) {

				var object = scene.children[ i ];


				object.traverse( function ( object ) {

					if ( object instanceof THREE.Mesh ) {
						geometry = object.geometry;
						if (geometry instanceof THREE.BufferGeometry) {
							object.visible = false;
						}
						else if (geometry instanceof THREE.Geometry){
							object.visible = true;

							var adjFaceColor = 0x0000ff;
							var farFaceColor = 0xffffff;
							var selFaceColor = 0xff0000;
							for (var i = 0; i < geometry.faces.length; i++) {
								face = geometry.faces[i];
								var count = 0;
								if (set.has(face.a + 1)) count++;
								if (set.has(face.b + 1)) count++;
								if (set.has(face.c + 1)) count++;
								if (count >= 2) {
									if (face.color === undefined) {
									face.color = new THREE.Color(adjFaceColor);
									}
									else {
										face.color.setHex(adjFaceColor);
									}
								}
								else if (face.color === undefined) {
									face.color = new THREE.Color(farFaceColor);
								}
								else {
									face.color.setHex(farFaceColor);
								}
							}
							set.forEach(function ( id ){
								var _geometry = new THREE.BoxGeometry( cubeSize, cubeSize, cubeSize );
								var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
								var cube = new THREE.Mesh( _geometry, material );
								cube.translateX ( geometry.vertices[id - 1].x );
								cube.translateY ( geometry.vertices[id - 1].y );
								cube.translateZ ( geometry.vertices[id - 1].z );
								editor.result[cube.uuid] = cube;
								scene.add( cube );
							});
							geometry.colorsNeedUpdate = true;
						}
					}
				} );
			}

			render();

		} catch ( error ) {

			alert("Invalid input");
			return;

		}
	});

	signals.runICP.add( function ( maxIterations, LOG ) {
		var icp = new ICP();
		object = editor.scene.children[1];
		object.traverse( function (child) {
			if ( child instanceof THREE.Mesh ) {
				var geometry = child.geometry;
				if (geometry instanceof THREE.Geometry) {
					icp.loadSource(geometry.vertices);
				}
			}
		});
		object = editor.scene.children[2];
		object.traverse( function (child) {
			if ( child instanceof THREE.Mesh ) {
				var geometry = child.geometry;
				if (geometry instanceof THREE.Geometry) {
					icp.loadTarget(geometry.vertices);
				}
			}
		});
		if (icp.source === undefined || icp.target === undefined) {
				alert("File has not loaded");
				return;
		}
		var iterations = parseInt(maxIterations)
		if (isNaN(iterations)) {
				alert("iteration is not a number");
				return;
		}
		icp.ICP(iterations);
		LOG.setValue(icp.log);
	});

	signals.transformModeChanged.add( function ( mode ) {

		transformControls.setMode( mode );

	} );

	signals.snapChanged.add( function ( dist ) {

		transformControls.setTranslationSnap( dist );

	} );

	signals.spaceChanged.add( function ( space ) {

		transformControls.setSpace( space );

	} );

	signals.rendererChanged.add( function ( newRenderer ) {

		if ( renderer !== null ) {

			container.dom.removeChild( renderer.domElement );

		}

		renderer = newRenderer;

		renderer.autoClear = false;
		renderer.autoUpdateScene = false;
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );

		container.dom.appendChild( renderer.domElement );


		render();

	} );

	signals.sceneGraphChanged.add( function () {

		render();

	} );

	var saveTimeout;

	signals.cameraChanged.add( function () {

		render();

	} );

	signals.objectSelected.add( function ( object ) {

		selectionBox.visible = false;
		transformControls.detach();

		if ( object !== null ) {

			box.setFromObject( object );

			if ( box.isEmpty() === false ) {

				selectionBox.update( box );
				selectionBox.visible = true;

			}

			transformControls.attach( object );

		}

		render();

	} );

	signals.objectFocused.add( function ( object ) {

		controls.focus( object );

	} );

	signals.geometryChanged.add( function ( object ) {

		if ( object !== undefined ) {

			selectionBox.update( object );

		}

		render();

	} );

	signals.objectAdded.add( function ( object ) {

		object.traverse( function ( child ) {

			objects.push( child );

		} );

	} );

	signals.objectChanged.add( function ( object ) {

		if ( editor.selected === object ) {

			selectionBox.update( object );
			transformControls.update();

		}

		if ( object instanceof THREE.PerspectiveCamera ) {

			object.updateProjectionMatrix();

		}

		if ( editor.helpers[ object.id ] !== undefined ) {

			editor.helpers[ object.id ].update();

		}

		render();

	} );

	signals.objectRemoved.add( function ( object ) {

		object.traverse( function ( child ) {

			objects.splice( objects.indexOf( child ), 1 );

		} );

	} );

	signals.helperAdded.add( function ( object ) {

		objects.push( object.getObjectByName( 'picker' ) );

	} );

	signals.helperRemoved.add( function ( object ) {

		objects.splice( objects.indexOf( object.getObjectByName( 'picker' ) ), 1 );

	} );

	signals.materialChanged.add( function ( material ) {

		render();

	} );

	// fog


	var currentFogType = null;


	//

	signals.windowResize.add( function () {

		// TODO: Move this out?

		editor.DEFAULT_CAMERA.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
		editor.DEFAULT_CAMERA.updateProjectionMatrix();

		camera.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( container.dom.offsetWidth, container.dom.offsetHeight );

		render();

	} );

	signals.showGridChanged.add( function ( showGrid ) {

		grid.visible = showGrid;
		render();

	} );

	//

	function animate() {

		requestAnimationFrame( animate );

		/*

		// animations

		if ( THREE.AnimationHandler.animations.length > 0 ) {

			THREE.AnimationHandler.update( 0.016 );

			for ( var i = 0, l = sceneHelpers.children.length; i < l; i ++ ) {

				var helper = sceneHelpers.children[ i ];

				if ( helper instanceof THREE.SkeletonHelper ) {

					helper.update();

				}

			}

		}
		*/

	}

	function render() {

		sceneHelpers.updateMatrixWorld();
		scene.updateMatrixWorld();

		{

			renderer.render( scene, camera );

			if ( renderer instanceof THREE.RaytracingRenderer === false ) {

				renderer.render( sceneHelpers, camera );

			}

		}


	}

	requestAnimationFrame( animate );

	return container;

};
