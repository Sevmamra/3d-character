import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// कैनवास को HTML से चुनें
const canvas = document.querySelector('canvas.webgl');

// सीन बनाएं
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a1a);

// 3D मॉडल लोडर
const loader = new GLTFLoader();

// एनिमेशन के लिए वेरिएबल्स
let mixer;
let actions = {};
let activeAction;
const clock = new THREE.Clock();

// ** 3D मॉडल को लोड करें **
// यहाँ हम अपने models/ फोल्डर से कैरेक्टर को लोड कर रहे हैं
loader.load(
    // फाइल का सही पाथ
    'models/character.glb',
    
    // जब मॉडल लोड हो जाए
    (gltf) => {
        const model = gltf.scene;
        model.scale.set(0.7, 0.7, 0.7);
        model.position.y = -1;
        scene.add(model);
        
        // एनिमेशन मिक्सर सेटअप करें
        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => {
            const action = mixer.clipAction(clip);
            actions[clip.name] = action;
        });
        
        // डिफ़ॉल्ट रूप से 'Idle' एनिमेशन चलाएं
        activeAction = actions['Idle'];
        activeAction.play();
    },
    // अगर लोड होने में कोई एरर आए
    (error) => {
        console.error("3D मॉडल लोड नहीं हो सका:", error);
    }
);

// लाइट (रोशनी)
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(3, 5, 4);
scene.add(directionalLight);

// स्क्रीन का आकार
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

// कैमरा
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 1.5, 4);
scene.add(camera);

// ऑर्बिट कंट्रोल्स (कैमरे को घुमाने के लिए)
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.target.set(0, 1, 0);

// रेंडरर
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// स्क्रीन रिसाइज होने पर अपडेट करें
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// क्लिक करने पर डांस और आइडल के बीच स्विच करें
window.addEventListener('click', () => {
    if (!actions['Dance']) return; // अगर डांस एनिमेशन नहीं है तो कुछ न करें

    const actionToPlay = activeAction === actions['Dance'] ? 'Idle' : 'Dance';
    const previousAction = activeAction;
    activeAction = actions[actionToPlay];

    previousAction.fadeOut(0.5);
    activeAction.reset().fadeIn(0.5).play();
});

// एनीमेशन लूप
const tick = () => {
    const delta = clock.getDelta();
    if (mixer) {
        mixer.update(delta);
    }
    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();
