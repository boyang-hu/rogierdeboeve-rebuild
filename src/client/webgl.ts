import {
  AmbientLight,
  BoxGeometry,
  Color,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  TetrahedronGeometry,
  Vector2,
  WebGLRenderer,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import gsap from "gsap";

type PreviewPayload = {
  color?: string;
};

export class WebGLBackdrop {
  private root: HTMLElement;
  private renderer: WebGLRenderer;
  private scene = new Scene();
  private camera = new PerspectiveCamera(45, 1, 0.1, 100);
  private group = new Group();
  private material: MeshStandardMaterial;
  private raf = 0;
  private pointer = new Vector2();
  private targetColor = new Color("#79dbff");

  constructor(root: HTMLElement) {
    this.root = root;
    this.renderer = new WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.outputColorSpace = SRGBColorSpace;
    this.root.appendChild(this.renderer.domElement);

    this.camera.position.set(0, 0, 8);
    this.scene.add(this.group);

    this.material = new MeshStandardMaterial({
      color: this.targetColor,
      roughness: 0.48,
      metalness: 0.14,
      transparent: true,
      opacity: 0.26,
      wireframe: true,
    });

    this.addLights();
    this.addGeometry();
    this.loadModel();
    this.resize();
    this.bind();
    this.tick();
  }

  setProject(payload: PreviewPayload) {
    if (!payload.color) return;
    this.targetColor.set(payload.color);
    gsap.to(this.material.color, {
      r: this.targetColor.r,
      g: this.targetColor.g,
      b: this.targetColor.b,
      duration: 0.8,
      ease: "power2.out",
    });
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    window.removeEventListener("resize", this.resize);
    this.renderer.dispose();
    this.root.replaceChildren();
  }

  private addLights() {
    this.scene.add(new AmbientLight("#ffffff", 1.4));
    const key = new DirectionalLight("#ffffff", 2.2);
    key.position.set(3, 4, 5);
    this.scene.add(key);
  }

  private addGeometry() {
    const count = 14;
    for (let i = 0; i < count; i++) {
      const geo = i % 3 === 0 ? new TetrahedronGeometry(0.32, 0) : new BoxGeometry(0.42, 0.42, 0.42);
      const mesh = new Mesh(geo, this.material);
      const angle = (i / count) * Math.PI * 2;
      const radius = 2.2 + (i % 5) * 0.38;
      mesh.position.set(Math.cos(angle) * radius, Math.sin(angle * 1.7) * 1.1, Math.sin(angle) * radius * 0.35);
      mesh.rotation.set(i * 0.3, i * 0.5, i * 0.17);
      this.group.add(mesh);
    }
  }

  private loadModel() {
    const loader = new GLTFLoader();
    loader.load(
      "/models/me/me.gltf",
      (gltf) => {
        gltf.scene.traverse((child) => {
          if (child instanceof Mesh) {
            child.material = this.material;
          }
        });
        gltf.scene.scale.setScalar(0.68);
        gltf.scene.position.set(2.8, -1.2, -0.6);
        this.group.add(gltf.scene);
      },
      undefined,
      () => undefined,
    );
  }

  private bind() {
    this.resize = this.resize.bind(this);
    window.addEventListener("resize", this.resize);
    window.addEventListener("pointermove", (event) => {
      this.pointer.x = (event.clientX / window.innerWidth - 0.5) * 2;
      this.pointer.y = (event.clientY / window.innerHeight - 0.5) * 2;
    });
  }

  private resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  private tick = () => {
    const t = performance.now() * 0.00035;
    this.group.rotation.y += 0.0025;
    this.group.rotation.x += (this.pointer.y * 0.16 - this.group.rotation.x) * 0.03;
    this.group.position.x += (this.pointer.x * 0.32 - this.group.position.x) * 0.04;
    this.group.children.forEach((child, index) => {
      child.rotation.x += 0.004 + index * 0.00004;
      child.rotation.y += 0.006;
      child.position.y += Math.sin(t + index) * 0.0008;
    });
    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame(this.tick);
  };
}
