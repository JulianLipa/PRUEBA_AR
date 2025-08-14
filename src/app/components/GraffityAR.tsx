"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

export default function GraffityAR() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    let renderer: any;
    let scene: any;
    let camera: any;

    const initAR = () => {
      // THREE ya viene global por el script de CDN
      scene = new (window as any).THREE.Scene();

      camera = new (window as any).THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.z = 5;

      renderer = new (window as any).THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      mountRef.current?.appendChild(renderer.domElement);

      // Luz
      const light = new (window as any).THREE.AmbientLight(0xffffff);
      scene.add(light);

      // Cubo de prueba (opcional)
      const geometry = new (window as any).THREE.BoxGeometry(0.2, 0.2, 0.2);
      const material = new (window as any).THREE.MeshBasicMaterial({ color: 0xff0000 });
      const cube = new (window as any).THREE.Mesh(geometry, material);
      scene.add(cube);

      // Raycaster para graffiti
      const raycaster = new (window as any).THREE.Raycaster();
      const mouse = new (window as any).THREE.Vector2();

      const drawGraffiti = (e: MouseEvent | TouchEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        let clientX = 0, clientY = 0;

        if ("touches" in e) {
          clientX = e.touches[0].clientX;
          clientY = e.touches[0].clientY;
        } else {
          clientX = e.clientX;
          clientY = e.clientY;
        }

        mouse.x = (clientX / rect.width) * 2 - 1;
        mouse.y = -(clientY / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children);
        const point = intersects.length ? intersects[0].point : new (window as any).THREE.Vector3(0,0,0);

        const sphere = new (window as any).THREE.Mesh(
          new (window as any).THREE.SphereGeometry(0.05),
          new (window as any).THREE.MeshBasicMaterial({ color: 0x000000 })
        );
        sphere.position.copy(point);
        scene.add(sphere);
      };

      renderer.domElement.addEventListener("click", drawGraffiti);
      renderer.domElement.addEventListener("touchmove", drawGraffiti);

      // Animación
      const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };
      animate();
    };

    // Iniciar AR al tocar la pantalla (por seguridad de cámara)
    const startListener = () => {
      initAR();
      document.body.removeEventListener("click", startListener);
    };
    document.body.addEventListener("click", startListener);

    return () => {
      if (mountRef.current && renderer) mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div ref={mountRef} style={{ width: "100vw", height: "100vh" }}>
      {/* Scripts de CDN */}
      <Script
        src="https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.min.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/gh/AR-js-org/AR.js/three.js/build/ar-threex.js"
        strategy="beforeInteractive"
      />
    </div>
  );
}
