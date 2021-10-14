var mflag = false;
document.getElementById("container").addEventListener("mouseover", mouseOver);
document.getElementById("container").addEventListener("mouseout", mouseOut);
function mouseOver() {
    mflag = true;
}

function mouseOut() {
    mflag = false;
}


"use strict";
import * as THREE from './three/build/three.module.js';

var camera, scene, renderer;

var isUserInteracting = false,
        onMouseDownMouseX = 0, onMouseDownMouseY = 0,
        lon = 0, onMouseDownLon = 0,
        lat = 0, onMouseDownLat = 0,
        phi = 0, theta = 0;

init();
animate();

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

var selected;

function inter() {
    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {         
        if (intersects[0].object.name.indexOf('mark') !== -1) {
            $('canvas').css('cursor', 'pointer');
            selected = intersects[0].object;
            intersects[0].object.scale.set(1.3, 1.3, 1.3);
            renderer.render(scene, camera);
        } else if (selected !== undefined) {
            $('canvas').css('cursor', 'default');
            selected.scale.set(1, 1, 1);
        }
    }
}

function find_id(name){
    for(let i = 0; i < Object.keys(json).length; i++){
        if(json[i]['name'] === name){
            return json[i];
        }
    }
    return false;
}

function inter_click() {
    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {         
        if (intersects[0].object.name.indexOf('mark') !== -1) {
            $('#modal').css('display', 'block');
            
            let el = find_id(intersects[0].object.name);
            $('#wimg').attr('src', el['html']['img']);
            $('#mp').html(el['html']['text'] );
            $('#modal').css('opacity', '1');
    }
}


function add_mark(scene) {
    
    let material = new THREE.MeshBasicMaterial({color: 0xffffff});
    for(let i = 0; i < Object.keys(json).length; i++){
        let sgeo = new THREE.SphereGeometry(json[i]['sphere']['size'][0], json[i]['sphere']['size'][1], json[i]['sphere']['size'][2]);
        let sphere = new THREE.Mesh(sgeo, material);
        sphere.position.set(json[i]['sphere']['position'][0], json[i]['sphere']['position'][1], json[i]['sphere']['position'][2]);
        sphere.name = json[i]['name'];
        scene.add(sphere);
        
        sgeo = new THREE.TorusGeometry(json[i]['tor']['size'][0], json[i]['tor']['size'][1], json[i]['tor']['size'][2], json[i]['tor']['size'][3]);
        sphere = new THREE.Mesh(sgeo, material);
        sphere.position.set(json[i]['tor']['position'][0], json[i]['tor']['position'][1], json[i]['tor']['position'][2]);
        sphere.rotation.set(json[i]['tor']['rotation'][0], json[i]['tor']['rotation'][1], json[i]['tor']['rotation'][2]);
        scene.add(sphere);
        
        sgeo = new THREE.BoxGeometry(json[i]['line']['size'][0], json[i]['line']['size'][1], json[i]['line']['size'][2]);
        sphere = new THREE.Mesh(sgeo, material);
        sphere.position.set(json[i]['line']['position'][0], json[i]['line']['position'][1], json[i]['line']['position'][2]);
        
        scene.add(sphere);
    }
}

function init() {
    var container, mesh;

    container = document.getElementById('container');

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
    camera.target = new THREE.Vector3(0, 0, 0);

    scene = new THREE.Scene();

    var geometry = new THREE.SphereBufferGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);

    var texture = new THREE.TextureLoader().load('/3d/m.jpg');
    var material = new THREE.MeshBasicMaterial({map: texture});

    mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.y = 40;
    scene.add(mesh);
    add_mark(scene);
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    document.addEventListener('mousedown', onPointerStart, false);
    document.addEventListener('mousemove', onPointerMove, false);
    document.addEventListener('mouseup', onPointerUp, false);
    document.addEventListener('wheel', onDocumentMouseWheel, false);
    document.addEventListener('touchstart', onPointerStart, false);
    document.addEventListener('touchmove', onPointerMove, false);
    document.addEventListener('touchend', onPointerUp, false);

    document.addEventListener('dragover', function (event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }, false);

    document.addEventListener('dragenter', function () {
        document.body.style.opacity = 0.5;
    }, false);

    document.addEventListener('dragleave', function () {
        document.body.style.opacity = 1;
    }, false);

    document.addEventListener('drop', function (event) {
        event.preventDefault();
        var reader = new FileReader();
        reader.addEventListener('load', function (event) {
            material.map.image.src = event.target.result;
            material.map.needsUpdate = true;
        }, false);
        reader.readAsDataURL(event.dataTransfer.files[ 0 ]);
        document.body.style.opacity = 1;

    }, false);
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerStart(event) {
    isUserInteracting = true;
    var clientX = event.clientX || event.touches[ 0 ].clientX;
    var clientY = event.clientY || event.touches[ 0 ].clientY;
    onMouseDownMouseX = clientX;
    onMouseDownMouseY = clientY;
    onMouseDownLon = lon;
    onMouseDownLat = lat;
}

function onPointerMove(event) {
    if (isUserInteracting === true) {
        var clientX = event.clientX || event.touches[ 0 ].clientX;
        var clientY = event.clientY || event.touches[ 0 ].clientY;
        lon = (onMouseDownMouseX - clientX) * 0.1 + onMouseDownLon;
        lat = (clientY - onMouseDownMouseY) * 0.1 + onMouseDownLat;
    }
}

function onPointerUp() {
    isUserInteracting = false;
}

function animate() {
    requestAnimationFrame(animate);
    update();
}

function update() {
    lat = Math.max(-85, Math.min(85, lat));
    phi = THREE.MathUtils.degToRad(90 - lat);
    theta = THREE.MathUtils.degToRad(lon);
    camera.target.x = 500 * Math.sin(phi) * Math.cos(theta);
    camera.target.y = 500 * Math.cos(phi);
    camera.target.z = 500 * Math.sin(phi) * Math.sin(theta);
    camera.lookAt(camera.target);
    renderer.render(scene, camera);
}


function floor_viz(f) {
    if (f === 'c1f') {
        floor = 1;
    } else {
        floor = 2;
    }
    f_css();
}

function f_css() {
    if (floor === 1) {
        $('#c1f').css({
            'opacity': 1,
            'z-index': 2000
        });
        $('#c2f').css({
            'opacity': 0.15,
            'z-index': 0
        });
    } else {
        $('#c2f').css({
            'opacity': 1,
            'z-index': 2000
        });
        $('#c1f').css({
            'opacity': 0.15,
            'z-index': 0
        });
    }
    marker_css();
}

function marker_css() {
    let fl = $('#marker').attr('floors');
    if (fl === 'c1f' && floor === 1 || fl === 'c2f' && floor === 2) {
        $('#marker').css('opacity', 1);
    } else {
        $('#marker').css('opacity', 0.15);
    }
}

function starway() {
    floor = (floor === 2) ? 1 : 2;
    f_css();
}

$("#container").mousemove(function (event) {
       mouse.x = (event.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / renderer.domElement.clientHeight) * 2 + 1;
inter();
});

$("#container").mousedown(function (e) {
    inter_click();
    return true;
});

$(document).keyup(function (e) {
    if (e.key === "Escape") { // escape key maps to keycode `27`
        $('#modal').css('display', 'none');
    }
});

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
    HTMLControlls.mobileIcon();
    $('#mobs').html('<h1>Некоторые функции могут быть недоступны с использованием телефона.</h1>');
            //$('#container').remove();
     mScene = null;
}
