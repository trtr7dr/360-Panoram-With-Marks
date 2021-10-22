"use strict";
import * as THREE from './three/build/three.module.js';

class Marks360 {
    constructor(id, json, img) {
        this.container = id;
        this.scene = new THREE.Scene();
        this.renderer = new THREE.WebGLRenderer();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1100);
        this.json = json;
        this.img = img;

        this.isUserInteracting = false,
                this.onMouseDownMouseX = 0, this.onMouseDownMouseY = 0,
                this.lon = 0, this.onMouseDownLon = 0,
                this.lat = 0, this.onMouseDownLat = 0,
                this.phi = 0, this.theta = 0;

        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.zoom = false;
        this.selected;
        this.init();
        this.lisseners();
    }

    zoom_on() {
        this.zoom = true;
    }

    inter() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        let intersects = this.raycaster.intersectObjects(this.scene.children, true);
        if (intersects.length > 0) {
            if (intersects[0].object.name.indexOf('mark') !== -1) {
                $('canvas').css('cursor', 'pointer');
                this.selected = intersects[0].object;
                intersects[0].object.scale.set(1.3, 1.3, 1.3);
                this.renderer.render(this.scene, this.camera);
            } else if (this.selected !== undefined) {
                $('canvas').css('cursor', 'default');
                this.selected.scale.set(1, 1, 1);
            }
        }
    }

    find_id(name) {
        for (let i = 0; i < Object.keys(this.json).length; i++) {
            if (this.json[i]['name'] === name) {
                return this.json[i];
            }
        }
        return false;
    }

    inter_click() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        let intersects = this.raycaster.intersectObjects(this.scene.children, true);
        if (intersects.length > 0) {
            if (intersects[0].object.name.indexOf('mark') !== -1) {
                $('#modal').css('display', 'block');
                let el = this.find_id(intersects[0].object.name);
                $('#wimg').attr('src', el['html']['img']);
                $('#mp').html(el['html']['text']);
                $('#modal').css('opacity', '1');
            }
        }
    }

    add_mark() {
        let material = new THREE.MeshBasicMaterial({color: 0xffffff});
        for (let i = 0; i < Object.keys(this.json).length; i++) {
            let sgeo = new THREE.SphereGeometry(this.json[i]['sphere']['size'][0], this.json[i]['sphere']['size'][1], this.json[i]['sphere']['size'][2]);
            let sphere = new THREE.Mesh(sgeo, material);
            sphere.position.set(this.json[i]['sphere']['position'][0], this.json[i]['sphere']['position'][1], this.json[i]['sphere']['position'][2]);
            sphere.name = this.json[i]['name'];
            this.scene.add(sphere);

            sgeo = new THREE.TorusGeometry(this.json[i]['tor']['size'][0], this.json[i]['tor']['size'][1], this.json[i]['tor']['size'][2], this.json[i]['tor']['size'][3]);
            sphere = new THREE.Mesh(sgeo, material);
            sphere.position.set(this.json[i]['tor']['position'][0], this.json[i]['tor']['position'][1], this.json[i]['tor']['position'][2]);
            sphere.rotation.set(this.json[i]['tor']['rotation'][0], this.json[i]['tor']['rotation'][1], this.json[i]['tor']['rotation'][2]);
            this.scene.add(sphere);

            sgeo = new THREE.BoxGeometry(this.json[i]['line']['size'][0], this.json[i]['line']['size'][1], this.json[i]['line']['size'][2]);
            sphere = new THREE.Mesh(sgeo, material);
            sphere.position.set(this.json[i]['line']['position'][0], this.json[i]['line']['position'][1], this.json[i]['line']['position'][2]);

            this.scene.add(sphere);
        }
    }

    init() {
        this.camera.target = new THREE.Vector3(0, 0, 0);

        var geometry = new THREE.SphereBufferGeometry(500, 60, 40);
        geometry.scale(-1, 1, 1);
        var texture = new THREE.TextureLoader().load(this.img);
        var material = new THREE.MeshBasicMaterial({map: texture});
        var mesh;
        mesh = new THREE.Mesh(geometry, material);

        mesh.rotation.y = 40;

        this.scene.add(mesh);

        this.add_mark();

        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById(this.container).appendChild(this.renderer.domElement);

        this.animate();

    }
    
    mobiles(){
        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|BB|PlayBook|IEMobile|Windows Phone|Kindle|Silk|Opera Mini/i.test(navigator.userAgent)) {
            alert('Некоторые функции могут быть недоступны с использованием телефона');
        }
    }

    lisseners() {
        var self = this;
        document.getElementById(this.container).addEventListener('mousemove', function (event) {
            self.mouse.x = (event.clientX / self.renderer.domElement.clientWidth) * 2 - 1;
            self.mouse.y = -(event.clientY / self.renderer.domElement.clientHeight) * 2 + 1;
            self.inter();
        }, false);

        document.addEventListener('mousedown', function (event) {
            self.inter_click();
            self.onPointerStart(event, self);
        }, false);
        document.addEventListener('mousemove', function (event) {
            self.onPointerMove(event, self);
        }, false);
        document.addEventListener('mouseup', function () {
            self.onPointerUp(self);
        }, false);

        document.addEventListener('wheel', function (event) {
            self.onDocumentMouseWheel(event, self);
        }, false);

        document.addEventListener('touchstart', function (event) {
            self.onPointerStart(event, self);
        }, false);
        document.addEventListener('touchmove', function (event) {
            self.onPointerMove(event, self);
        }, false);
        document.addEventListener('touchend', function () {
            self.onPointerUp(self);
        }, false);

        window.addEventListener('resize', self.onWindowResize, false);

        document.addEventListener('keyup', function (event) {
            if (event.key === "Escape") { 
                $('#modal').css('display', 'none');
            }
        }, false);
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onPointerStart(event, m360) {
        mScene.isUserInteracting = true;

        var clientX = event.clientX || event.touches[ 0 ].clientX;
        var clientY = event.clientY || event.touches[ 0 ].clientY;

        m360.onMouseDownMouseX = clientX;
        m360.onMouseDownMouseY = clientY;

        m360.onMouseDownLon = m360.lon;
        m360.onMouseDownLat = m360.lat;
    }

    onPointerMove(event, m360) {
        if (m360.isUserInteracting === true) {
            var clientX = event.clientX || event.touches[ 0 ].clientX;
            var clientY = event.clientY || event.touches[ 0 ].clientY;
            m360.lon = (m360.onMouseDownMouseX - clientX) * 0.1 + m360.onMouseDownLon;
            m360.lat = (clientY - m360.onMouseDownMouseY) * 0.1 + m360.onMouseDownLat;
        }
    }

    onPointerUp(m360) {
        m360.isUserInteracting = false;
    }

    onDocumentMouseWheel(event, m360) {
        if (m360.zoom) {
            var fov = m360.camera.fov + event.deltaY * 0.05;
            m360.camera.fov = THREE.MathUtils.clamp(fov, 10, 75);
            m360.camera.updateProjectionMatrix();
        }
    }

    animate() {
        let requestId = requestAnimationFrame(() => {
            this.animate();
        });
        this.update();
    }

    update() {
        this.lat = Math.max(-85, Math.min(85, this.lat));
        this.phi = THREE.MathUtils.degToRad(90 - this.lat);
        this.theta = THREE.MathUtils.degToRad(this.lon);

        this.camera.target.x = 500 * Math.sin(this.phi) * Math.cos(this.theta);
        this.camera.target.y = 500 * Math.cos(this.phi);
        this.camera.target.z = 500 * Math.sin(this.phi) * Math.sin(this.theta);

        this.camera.lookAt(this.camera.target);
        this.renderer.render(this.scene, this.camera);
    }

}

var mScene = new Marks360('container', json, '/3d/m.jpg');
