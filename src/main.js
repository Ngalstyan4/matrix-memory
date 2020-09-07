import {Scene,OrthographicCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, Mesh, PerspectiveCamera, PlaneBufferGeometry, Plane, AxesHelper} from 'three';
import {Memory} from './Memory';
import {GUI} from 'dat.gui';
import CONFIG from './Config';
import { program } from './Program';
let gui = new GUI();
let guiParams = {
    tickTime: 0.4,
    fadeRate: 1,
};
gui.add(guiParams, "tickTime", 0.001, 0.4, 0.01);
gui.add(guiParams, "fadeRate", 0.1, 3, 0.2);

var scene = new Scene();
var camera = new OrthographicCamera( -window.innerWidth / 2, window.innerWidth / 2, window.innerHeight / 2, -window.innerHeight / 2, 1, 1000);
camera.position.z = 500; 

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

let memory = new Memory(scene, memRegWidth, memRegHeight, x0, y0);
function memoryRefresh() {
    for (let c of memory.cells) {
        let color =  c.material.color.getHex();
        let redChannel = color >> 16;
        let bluChannel = color & 0xff;
        redChannel -= guiParams.fadeRate * 10;
        bluChannel -= guiParams.fadeRate * 10;
        redChannel = Math.max(redChannel, (CONFIG.MEMORY.UNINIT & 0xff0000) >> 16);
        bluChannel = Math.max(bluChannel, (CONFIG.MEMORY.UNINIT & 0x00000ff));

        redChannel <<= 16;
        c.material.color.set((color & 0x00ff00) | redChannel| bluChannel);
    }
}
function *noop() {yield 0};
// give some time for things to start up
let cpu_work_queue = [noop()];
let cpu = (g) => {cpu_work_queue.push(g)}
program(memory, cpu);
console.log(CONFIG.MARGIN)

// gui.add(plane.position, "x", -1000, 1000, 1);
// plane.position.x = -window.innerWidth/2;
let lastFrame = -1;
var animate = function () {
    
    requestAnimationFrame( animate );
    let now = Date.now();
    if (now - lastFrame < 1000 * guiParams.tickTime) return;
    lastFrame = now;
    // emulates a CPU loop
    if (cpu_work_queue.length != 0) {
        let g = cpu_work_queue[0];
        let res = g.next();
        if (res.done) {
            cpu_work_queue.shift();
        }
    }

    // dim memory access colors
    memoryRefresh();

    renderer.render( scene, camera );
};
animate();