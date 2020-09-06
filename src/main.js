import {Scene,PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, Mesh} from 'three';

import {GUI} from 'dat.gui';

let gui = new GUI();
let guiParams = {
    x: 0,
};
var scene = new Scene();
var camera = new PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

var renderer = new WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry = new BoxGeometry();
var material = new MeshBasicMaterial( { color: 0xfff000 } );
var cube = new Mesh( geometry, material );

gui.add(guiParams, "x", 0, 1, 0.01);
scene.add( cube );

camera.position.z = 5; 

var animate = function () {
    requestAnimationFrame( animate );

    cube.rotation.x += guiParams.x;
    cube.rotation.y += 0.01;

    renderer.render( scene, camera );
};
animate();