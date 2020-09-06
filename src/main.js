import {Scene,OrthographicCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, Mesh, PerspectiveCamera, PlaneBufferGeometry, Plane, AxesHelper} from 'three';
import {Memory} from './Memory';
import {GUI} from 'dat.gui';
import CONFIG from './Config';
import { execute } from './Program';
let gui = new GUI();
let guiParams = {
    x: 0,
};
var scene = new Scene();
var camera = new OrthographicCamera( -window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, -window.innerHeight / 2, 1, 1000);
camera.position.z = 500; 
let axes = new AxesHelper(window.innerWidth);
axes.position.z = 200;
scene.add(axes);
var renderer = new WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

let bgMatetrial = new MeshBasicMaterial( { color: 0xffffff } );
let bgGeometry = new PlaneBufferGeometry(window.innerWidth*2/3, window.innerHeight-CONFIG.MARGIN);
let bgPlane = new Mesh(bgGeometry, bgMatetrial);
bgPlane.position.x = -(window.innerWidth/2-window.innerWidth / 3) + CONFIG.MARGIN/2;
scene.add( bgPlane );

let memRegWidth = bgPlane.geometry.parameters.width;
let memRegHeight = bgPlane.geometry.parameters.height
let x0 = bgPlane.position.x;
let y0 = bgPlane.position.y;

let m = new Memory(scene, memRegWidth, memRegHeight, x0, y0);
execute(m);
console.log(CONFIG.MARGIN)

// gui.add(plane.position, "x", -1000, 1000, 1);
// plane.position.x = -window.innerWidth/2;
var animate = function () {
    requestAnimationFrame( animate );


    renderer.render( scene, camera );
};
animate();