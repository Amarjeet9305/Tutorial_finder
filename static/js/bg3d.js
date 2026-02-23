/* ==========================================
   AiTutor — 3D Scroll-Reactive Background
   Three.js scene: particles, wave grid, orbs
   ========================================== */

(function () {
    'use strict';

    // ── 1. ACCESSIBILITY: honour prefers-reduced-motion ──────────────────────
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // ── 2. CANVAS SETUP ─────────────────────────────────────────────────────
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    // ── 3. RENDERER ──────────────────────────────────────────────────────────
    let renderer;
    try {
        renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
            powerPreference: 'low-power'   // mobile-friendly
        });
    } catch (e) {
        // WebGL unavailable — canvas stays hidden, CSS gradient fallback kicks in
        canvas.style.display = 'none';
        return;
    }

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));  // cap for perf

    // ── 4. SCENE + CAMERA ────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 2, 10);

    // ── 5. PARTICLE FIELD ────────────────────────────────────────────────────
    const PARTICLE_COUNT = window.innerWidth < 768 ? 1200 : 2500;
    const pPositions = new Float32Array(PARTICLE_COUNT * 3);
    const pSizes = new Float32Array(PARTICLE_COUNT);
    const pColors = new Float32Array(PARTICLE_COUNT * 3);

    const colorOptions = [
        new THREE.Color(0x6366f1),  // indigo
        new THREE.Color(0x8b5cf6),  // violet
        new THREE.Color(0x06b6d4),  // cyan
        new THREE.Color(0xa5b4fc),  // light indigo
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        pPositions[i * 3] = (Math.random() - 0.5) * 60;
        pPositions[i * 3 + 1] = (Math.random() - 0.5) * 40;
        pPositions[i * 3 + 2] = (Math.random() - 0.5) * 40;
        pSizes[i] = Math.random() * 0.6 + 0.05;

        const c = colorOptions[Math.floor(Math.random() * colorOptions.length)];
        pColors[i * 3] = c.r;
        pColors[i * 3 + 1] = c.g;
        pColors[i * 3 + 2] = c.b;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
    pGeo.setAttribute('color', new THREE.BufferAttribute(pColors, 3));
    pGeo.setAttribute('size', new THREE.BufferAttribute(pSizes, 1));

    const pMat = new THREE.PointsMaterial({
        size: 0.12,
        vertexColors: true,
        transparent: true,
        opacity: 0.65,
        sizeAttenuation: true,
        depthWrite: false,
    });

    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ── 6. WAVE GRID ─────────────────────────────────────────────────────────
    const gridSeg = window.innerWidth < 768 ? 30 : 55;
    const gridGeo = new THREE.PlaneGeometry(50, 30, gridSeg, gridSeg);
    const gridMat = new THREE.MeshBasicMaterial({
        color: 0x6366f1,
        wireframe: true,
        transparent: true,
        opacity: 0.07,
    });

    const grid = new THREE.Mesh(gridGeo, gridMat);
    grid.rotation.x = -Math.PI / 2.6;
    grid.position.set(0, -6, -4);
    scene.add(grid);

    // Store original grid Y positions for wave animation
    const gridPos = grid.geometry.attributes.position;
    const gridOrigZ = new Float32Array(gridPos.count);
    for (let i = 0; i < gridPos.count; i++) {
        gridOrigZ[i] = gridPos.getZ(i);
    }

    // ── 7. FLOATING ORBS ─────────────────────────────────────────────────────
    function makeOrb(radius, color, position, opacity) {
        const geo = new THREE.IcosahedronGeometry(radius, 1);
        const mat = new THREE.MeshBasicMaterial({
            color,
            wireframe: true,
            transparent: true,
            opacity,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...position);
        scene.add(mesh);
        return mesh;
    }

    const orb1 = makeOrb(2.2, 0x6366f1, [-6, 1.5, -5], 0.12);
    const orb2 = makeOrb(1.4, 0x8b5cf6, [7, -0.5, -3], 0.1);
    const orb3 = makeOrb(0.8, 0x06b6d4, [3, 3, -6], 0.15);
    const orb4 = makeOrb(3.0, 0x8b5cf6, [0, 0, -18], 0.05);

    // ── 8. SCROLL STATE ──────────────────────────────────────────────────────
    let scrollTarget = 0;
    let scrollCurrent = 0;

    window.addEventListener('scroll', function () {
        scrollTarget = window.scrollY;
    }, { passive: true });

    // ── 9. RESIZE ────────────────────────────────────────────────────────────
    window.addEventListener('resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ── 10. ANIMATION LOOP ───────────────────────────────────────────────────
    const clock = new THREE.Clock();
    const TWO_PI = Math.PI * 2;

    // Lightweight lerp
    function lerp(a, b, t) { return a + (b - a) * t; }

    function animate() {
        requestAnimationFrame(animate);

        const t = clock.getElapsedTime();

        // Smooth scroll interpolation (inertia)
        scrollCurrent = lerp(scrollCurrent, scrollTarget, 0.05);
        const docH = Math.max(1, document.body.scrollHeight - window.innerHeight);
        const prog = scrollCurrent / docH;   // 0 → 1 over full page

        // ── Particles: gentle constant drift + scroll-driven lean ──
        particles.rotation.y = t * 0.025 + prog * 0.6;
        particles.rotation.x = prog * 0.25;

        // ── Camera parallax movement ──
        camera.position.y = lerp(camera.position.y, 2 - prog * 3, 0.04);
        camera.position.z = lerp(camera.position.z, 10 - prog * 2, 0.03);
        camera.rotation.x = lerp(camera.rotation.x, prog * 0.08, 0.04);
        camera.rotation.y = lerp(camera.rotation.y, Math.sin(t * 0.04) * 0.04, 0.02);

        // ── Wave grid animation ──
        const gp = grid.geometry.attributes.position;
        for (let i = 0; i < gp.count; i++) {
            const x = gp.getX(i);
            const y = gp.getY(i);
            const wave = Math.sin(x * 0.25 + t * 0.5 + prog * TWO_PI) * 0.55
                + Math.cos(y * 0.3 + t * 0.35) * 0.4;
            gp.setZ(i, gridOrigZ[i] + wave);
        }
        gp.needsUpdate = true;

        // Grid opacity pulses very subtly with scroll
        gridMat.opacity = 0.05 + prog * 0.06;

        // ── Orb rotations ──
        orb1.rotation.y = t * 0.08;
        orb1.rotation.x = t * 0.06;
        orb1.position.y = 1.5 + Math.sin(t * 0.4) * 0.4 - prog * 2;

        orb2.rotation.z = t * 0.1;
        orb2.rotation.x = t * 0.07;
        orb2.position.y = -0.5 + Math.cos(t * 0.35) * 0.3 - prog * 1.5;

        orb3.rotation.y = -t * 0.15;
        orb3.position.x = 3 + Math.sin(t * 0.25) * 0.5;
        orb3.position.y = 3 + Math.cos(t * 0.3) * 0.4 - prog;

        orb4.rotation.y = t * 0.03;

        renderer.render(scene, camera);
    }

    animate();
})();
