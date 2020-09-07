import {Scene,OrthographicCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial, Mesh, PerspectiveCamera, PlaneBufferGeometry, Plane, AxesHelper} from 'three';
import {Memory} from './Memory';
import {GUI} from 'dat.gui';
import CONFIG from './Config';
// import { program } from './Program';
import 'ace-builds/src-min-noconflict/ace' // Load Ace Editor

// Import initial theme and mode so we don't have to wait for 2 extra HTTP requests
import 'ace-builds/src-min-noconflict/theme-chrome'
import 'ace-builds/src-min-noconflict/mode-javascript'

function initEditor() {
    let editor = ace.edit("ide");
    editor.setTheme('ace/theme/chrome');
    editor.session.setMode('ace/mode/javascript');

    editor.commands.on("exec", function(e) { 
        var rowCol = editor.selection.getCursor();
        if ((rowCol.row == 0) || ((rowCol.row + 1) == editor.session.getLength())) {
        e.preventDefault();
        e.stopPropagation();
        }
    });
    return editor;
}

/* GUI is intentionally global so others can easily add parameters to track */
let gui = new GUI();
let guiParams = {
    tickTime: 0.01,
    fadeRate: 1,
};
let cpuParams = gui.addFolder("CPU Parameters");
cpuParams.open();
cpuParams.add(guiParams, "tickTime", 0.001, 0.4, 0.01);
cpuParams.add(guiParams, "fadeRate", 0.1, 3, 0.2);

function initMemoryCanvas() {
    var scene = new Scene();
    let canvas = document.getElementById("memCanvas");

    var camera = new OrthographicCamera( -canvas.clientWidth / 2, canvas.clientWidth / 2, canvas.clientHeight / 2, -canvas.clientHeight / 2, 1, 1000);
    camera.position.z = 500; 

    var renderer = new WebGLRenderer({canvas: canvas});
    renderer.setSize( canvas.clientWidth, canvas.clientHeight );

    let bgMatetrial = new MeshBasicMaterial( { color: 0xffffff } );
    let bgGeometry = new PlaneBufferGeometry(canvas.clientWidth, canvas.clientHeight);
    let bgPlane = new Mesh(bgGeometry, bgMatetrial);
    scene.add( bgPlane );

    let memRegWidth = bgPlane.geometry.parameters.width;
    let memRegHeight = bgPlane.geometry.parameters.height
    let x0 = bgPlane.position.x;
    let y0 = bgPlane.position.y;
    let memory = new Memory(scene, memRegWidth, memRegHeight, x0, y0);
    return [scene, camera,  renderer, memory];
}



let lastFrame = -1;
var animate = function (cpu_work_queue, memory, scene, camera,  renderer) {
    let tick = () => {
        requestAnimationFrame( tick );
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
        memory.refresh(guiParams);

        renderer.render( scene, camera );
    }
    tick();
};

// start them all!
let editor = initEditor();
let [scene, camera, renderer, memory] = initMemoryCanvas();
let cpu_work_queue = [];
// cpu consumes things like `
function *noop() {yield 0};
let cpu = (g) => {cpu_work_queue.push(g)}

// editor ---> program(cpu, memory)
document.getElementById("run").onclick = () => {
    let code = editor.getValue();
    var script = document.createElement('script');
    try {
        script.appendChild(document.createTextNode(code));
        document.body.appendChild(script);
    } catch (e) {
        script.text = code;
        document.body.appendChild(script);
    }
    memory.reset();
    cpu_work_queue.length = 0;
    program(memory, cpu);
};

animate(cpu_work_queue, memory, scene, camera, renderer);