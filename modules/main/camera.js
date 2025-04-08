import * as THREE from 'three';

export function setupCamera(scene, FLOOR_Y) {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
    
    const cameraRig = new THREE.Group();
    scene.add(cameraRig);
    cameraRig.position.set(0, FLOOR_Y + 1.7, 10);

    const pitchObject = new THREE.Object3D();
    const yawObject = new THREE.Object3D();
    yawObject.add(pitchObject);
    pitchObject.add(camera);
    cameraRig.add(yawObject);

    // Add direct references for input system
    camera.yawObject = yawObject;
    camera.pitchObject = pitchObject;

    return { camera, cameraRig, pitchObject, yawObject };
}
