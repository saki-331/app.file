// 23FI013
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

class ThreeJSContainer {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private controls!: OrbitControls;


  public createRendererDOM = (width: number, height: number, cameraPos: THREE.Vector3) => {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(new THREE.Color(0x0a0a5c));

    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.copy(cameraPos);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;

    this.createScene();

    
    const render = () => {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(render);
    };
    render();

    this.renderer.domElement.style.cssFloat = "left";
    this.renderer.domElement.style.margin = "10px";

    return this.renderer.domElement;
  };

  private createScene = () => {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a5c);

    // 地面 
    const groundGeo = new THREE.PlaneGeometry(40, 40, 40, 40);
    const craters = [
      { x: 5, y: 5, radius: 2, depth: 1 },
      { x: -3, y: 2, radius: 1.5, depth: 0.7 },
      { x: 0, y: -4, radius: 2.5, depth: 1.2 },
    ];
    for (let i = 0; i < groundGeo.attributes.position.count; i++) {
      const x = groundGeo.attributes.position.getX(i);
      const y = groundGeo.attributes.position.getY(i);
      let height = 0.5 * Math.sin(x * 2) * Math.cos(y * 2) + 0.3 * (Math.random() - 0.5);
      for (const crater of craters) {
        const dx = x - crater.x;
        const dy = y - crater.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < crater.radius) {
          const factor = 1 - dist / crater.radius;
          height -= crater.depth * factor * factor;
        }
      }
      groundGeo.attributes.position.setZ(i, height);
    }
    groundGeo.computeVertexNormals();

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xe0c878,
      roughness: 1.0,
      metalness: 0.0,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    this.scene.add(ground);

    // --- 星 ---
    function createStars(count: number) {
      const stars = new THREE.Group();
      const starGeo = new THREE.SphereGeometry(0.07, 6, 6);
      const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

      for (let i = 0; i < count; i++) {
        const star = new THREE.Mesh(starGeo, starMat);
        star.position.set(
          (Math.random() - 0.5) * 100,
          Math.random() * 100,
          (Math.random() - 0.5) * 100
        );
        stars.add(star);
      }
      return stars;
    }
    this.scene.add(createStars(500));

    // 光の粒 
    const lightPointCount = 200;
    const lightPositions = new Float32Array(lightPointCount * 3);
    for (let i = 0; i < lightPointCount; i++) {
      const x = (Math.random() - 0.5) * 40;
      const y = Math.random() * 15;
      const z = (Math.random() - 0.5) * 40;
      lightPositions[i * 3] = x;
      lightPositions[i * 3 + 1] = y;
      lightPositions[i * 3 + 2] = z;
    }
    const lightGeometry = new THREE.BufferGeometry();
    lightGeometry.setAttribute("position", new THREE.BufferAttribute(lightPositions, 3));
    const lightMaterial = new THREE.PointsMaterial({
      color: 0xe0c878,
      size: 0.25,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const lightPoints = new THREE.Points(lightGeometry, lightMaterial);
    this.scene.add(lightPoints);

    // 光源 
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 20, 10);
    this.scene.add(dirLight);

    // ウサギ
    function createRabbit(): THREE.Group {
      const rabbit = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });

      const body = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), bodyMat);
      body.scale.set(1, 0.8, 1.5);
      rabbit.add(body);

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.6, 32, 32), bodyMat);
      head.position.set(0, 1.1, 0.8);
      rabbit.add(head);

      const earGeo = new THREE.CylinderGeometry(0.15, 0.15, 1, 16);
      const earMat = new THREE.MeshStandardMaterial({ color: 0xfffafa });
      const leftEar = new THREE.Mesh(earGeo, earMat);
      leftEar.position.set(-0.3, 1.8, 0.6);
      leftEar.rotation.z = 0.3;
      rabbit.add(leftEar);

      const rightEar = leftEar.clone();
      rightEar.position.x = 0.3;
      rightEar.rotation.z = -0.3;
      rabbit.add(rightEar);

      const legGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.7, 8);
      const frontLeftLeg = new THREE.Mesh(legGeo, bodyMat);
      frontLeftLeg.position.set(-0.4, -0.5, 0.5);
      rabbit.add(frontLeftLeg);

      const frontRightLeg = frontLeftLeg.clone();
      frontRightLeg.position.x = 0.4;
      rabbit.add(frontRightLeg);

      const backLeftLeg = frontLeftLeg.clone();
      backLeftLeg.position.set(-0.4, -0.5, -0.5);
      rabbit.add(backLeftLeg);

      const backRightLeg = frontLeftLeg.clone();
      backRightLeg.position.set(0.4, -0.5, -0.5);
      rabbit.add(backRightLeg);

      const eyeGeo = new THREE.SphereGeometry(0.1, 16, 16);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-0.2, 1.2, 1.3);
      const rightEye = leftEye.clone();
      rightEye.position.x = 0.2;
      rabbit.add(leftEye, rightEye);

      return rabbit;
    }

    // 杵 
    function createKine(): THREE.Group {
      const kine = new THREE.Group();

      const mainGeo = new THREE.CylinderGeometry(0.15, 0.15, 2, 12);
      const mainMat = new THREE.MeshStandardMaterial({ color: 0xdeb887, roughness: 0.7 });
      const mainStick = new THREE.Mesh(mainGeo, mainMat);
      mainStick.position.y = 1;
      kine.add(mainStick);

      const crossGeo = new THREE.CylinderGeometry(0.2, 0.2, 1.2, 12);
      const crossMat = new THREE.MeshStandardMaterial({ color: 0xdeb887, roughness: 0.7 });
      const crossStick = new THREE.Mesh(crossGeo, crossMat);
      crossStick.rotation.z = Math.PI / 2;
      crossStick.position.set(-0.2, 1.9, 0);
      kine.add(crossStick);

      kine.rotation.y = Math.PI / 4;

      return kine;
    }

    // 臼 
    function createUsu(): THREE.Group {
      const usu = new THREE.Group();

      const outerGeo = new THREE.CylinderGeometry(2, 2, 1.2, 32);
      const outerMat = new THREE.MeshStandardMaterial({ color: 0xd2b48c, roughness: 0.9 });
      const outer = new THREE.Mesh(outerGeo, outerMat);
      outer.position.y = 0.6;
      usu.add(outer);

      const innerGeo = new THREE.CylinderGeometry(1.5, 1.5, 1.3, 32);
      const innerMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
      const inner = new THREE.Mesh(innerGeo, innerMat);
      inner.position.y = 0.7;
      usu.add(inner);

      return usu;
    }

    const usu = createUsu();
    usu.position.set(0, 0, 0);
    this.scene.add(usu);

    const mochiRabbit = createRabbit();
    mochiRabbit.position.set(1.5, 5, 3.5);
    const lookTarget = usu.position.clone().add(new THREE.Vector3(0, 5, 0));
    mochiRabbit.lookAt(lookTarget);
    this.scene.add(mochiRabbit);

    const kinePivot = new THREE.Group();
    kinePivot.position.set(0.6, 0.4, 1);
    mochiRabbit.add(kinePivot);

    const kine = createKine();
    kine.rotation.z = Math.PI / 4;
    kine.position.y = 1;
    kinePivot.add(kine);

    // ウサギ
    const rabbits: THREE.Group[] = [];
    const radius = 8;
    const rabbitCount = 8;

    for (let i = 0; i < rabbitCount; i++) {
      const r = createRabbit();
      const angle = (i / rabbitCount) * Math.PI * 2;
      r.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      r.lookAt(0, 0, 0);
      this.scene.add(r);
      rabbits.push(r);
    }

    let time = 0;

    const animateUpdate = () => {
      time += 0.02;

      const lightPosArray = lightGeometry.attributes.position.array as Float32Array;
      for (let i = 1; i < lightPosArray.length; i += 3) {
        lightPosArray[i] += 0.015;
        if (lightPosArray[i] > 10) lightPosArray[i] = -10;
      }
      lightGeometry.attributes.position.needsUpdate = true;

      kinePivot.rotation.x = Math.sin(time * 4) * 0.8;

      mochiRabbit.position.y = 0.3 + 0.1 * Math.abs(Math.sin(time * 4));

      rabbits.forEach((r, i) => {
        const angleOffset = (i / rabbitCount) * Math.PI * 2;
        const angle = time * 0.8 + angleOffset;
        r.position.x = Math.cos(angle) * radius;
        r.position.z = Math.sin(angle) * radius;
        r.position.y = 0.5 + Math.abs(Math.sin(time * 3 + i)) * 1.2;
        r.rotation.y = angle + Math.sin(time * 5 + i) * 0.3;
      });

      requestAnimationFrame(animateUpdate);
    };
    animateUpdate();
  };
}

window.addEventListener("DOMContentLoaded", () => {
  const container = new ThreeJSContainer();
  const viewport = container.createRendererDOM(window.innerWidth, window.innerHeight, new THREE.Vector3(10, 10, 25));
  document.body.appendChild(viewport);
});
