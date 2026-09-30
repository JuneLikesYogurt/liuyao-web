import * as THREE from "./vendor/three.module.js";

(() => {
  "use strict";

  const app = document.querySelector("#app");
  const STORAGE_KEY = "guanyao-ui-draft-v1";
  const LATEST_READING_KEY = "guanyao-ui-latest-reading-v1";
  const PREF_KEY = "guanyao-ui-prefs-v1";

  const paths = {
    coins: '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="M16.71 13.88l.7.71-2.82 2.82"/>',
    scroll: '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/><path d="M7 8h10M7 12h10M7 16h6"/>',
    user: '<path d="M19 21a7 7 0 0 0-14 0"/><circle cx="12" cy="7" r="4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    arrowRight: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    arrowLeft: '<path d="M19 12H5M11 18l-6-6 6-6"/>',
    rotate: '<path d="M20 11a8.1 8.1 0 0 0-15.5-2M4 4v5h5"/><path d="M4 13a8.1 8.1 0 0 0 15.5 2M20 20v-5h-5"/>',
    sparkles: '<path d="m12 3-1.6 4.4L6 9l4.4 1.6L12 15l1.6-4.4L18 9l-4.4-1.6Z"/><path d="m5 16-.8 2.2L2 19l2.2.8L5 22l.8-2.2L8 19l-2.2-.8Z"/><path d="m19 14-.6 1.4L17 16l1.4.6L19 18l.6-1.4L21 16l-1.4-.6Z"/>',
    loader: '<path d="M21 12a9 9 0 1 1-6.2-8.6"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    thumbsUp: '<path d="M7 10v12H3V10h4Zm0 10c4 2 7 2 9 1l3-7c.5-1.5-.5-3-2-3h-4l1-4c.3-1.5-1-3-2-3L7 10"/>',
    thumbsDown: '<path d="M17 14V2h4v12h-4Zm0-10c-4-2-7-2-9-1l-3 7c-.5 1.5.5 3 2 3h4l-1 4c-.3 1.5 1 3 2 3l5-6"/>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3"/><path d="M1 14h6M9 8h6M17 16h6"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z"/><path d="m9 12 2 2 4-4"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 16 4-5 4 3 5-8"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    vibration: '<path d="M2 8v8M5 5v14M22 8v8M19 5v14"/><rect x="8" y="3" width="8" height="18" rx="2"/>',
    volume: '<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8 8 0 0 1 0 12"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    logOut: '<path d="M10 17l5-5-5-5M15 12H3"/><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
  };

  function icon(name, label = "") {
    return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="${label ? "false" : "true"}"${label ? ` role="img" aria-label="${label}"` : ""}>${paths[name] || paths.info}</svg>`;
  }

  function logoMark(extraClass = "") {
    return `<svg class="brand-mark ${extraClass}" viewBox="0 0 72 42" aria-hidden="true" focusable="false">
      <g class="brand-mark__coin brand-mark__coin--left" transform="rotate(-7 19 24)"><circle cx="19" cy="24" r="11.5"></circle><rect x="15.5" y="20.5" width="7" height="7"></rect></g>
      <g class="brand-mark__coin brand-mark__coin--right" transform="rotate(6 53 23)"><circle cx="53" cy="23" r="11.5"></circle><rect x="49.5" y="19.5" width="7" height="7"></rect></g>
      <g class="brand-mark__coin brand-mark__coin--center" transform="rotate(-2 36 17.5)"><circle cx="36" cy="17.5" r="14"></circle><rect x="32" y="13.5" width="8" height="8"></rect></g>
      <path class="brand-mark__seal" d="M8 36.5c14.5 2 39.5 2.2 56-.3"></path>
    </svg>`;
  }

  function escapeHTML(value = "") {
    return String(value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  }

  function loadJSON(key, fallback) {
    try { return { ...fallback, ...(JSON.parse(localStorage.getItem(key)) || {}) }; }
    catch { return { ...fallback }; }
  }

  const defaultCast = {
    question: "",
    method: "coins",
    started: false,
    lines: [null, null, null, null, null, null],
    manualLines: ["", "", "", "", "", ""],
    dateTime: "2026-09-17T10:28",
  };

  const castDraft = loadJSON(STORAGE_KEY, defaultCast);
  const draftLineCount = Array.isArray(castDraft.lines) ? castDraft.lines.filter((line) => line !== null).length : 0;
  const draftManualCount = Array.isArray(castDraft.manualLines) ? castDraft.manualLines.filter((line) => line !== "").length : 0;
  const draftComplete = Boolean(castDraft.started && (castDraft.method === "manual" ? draftManualCount === 6 : draftLineCount === 6));
  const hasIncompleteDraft = Boolean(castDraft.started && ((castDraft.method === "manual" && draftManualCount > 0 && draftManualCount < 6) || (castDraft.method !== "manual" && draftLineCount > 0 && draftLineCount < 6)));
  const latestReading = loadJSON(LATEST_READING_KEY, { question: "", lines: [], dateTime: "" });
  const bootingOnCast = !location.hash || location.hash === "#/cast";
  const activeDraft = draftComplete && bootingOnCast ? defaultCast : castDraft;
  const prefs = loadJSON(PREF_KEY, { motion: true, sound: false, haptic: true });

  const state = {
    cast: {
      ...defaultCast,
      ...activeDraft,
      lines: Array.isArray(activeDraft.lines) ? activeDraft.lines.slice(0, 6) : [...defaultCast.lines],
      manualLines: Array.isArray(activeDraft.manualLines) ? activeDraft.manualLines.slice(0, 6) : [...defaultCast.manualLines],
      started: hasIncompleteDraft ? false : Boolean(activeDraft.started || activeDraft.lines?.some((line) => line !== null) || activeDraft.manualLines?.some((line) => line !== "")),
      tossing: false,
      imprinting: false,
      generating: false,
      coinFaces: ["front", "back", "front"],
      newest: -1,
    },
    prefs,
    trendView: "heat",
    yongshen: "妻财",
    feedback: "",
    recordFilter: "all",
    recordSearch: "",
    logoIntroPending: true,
    slipOpen: false,
    resumePrompt: hasIncompleteDraft,
    undoLine: null,
    manualPicker: null,
    summaryOpen: false,
    completedReading: draftComplete ? {
      question: castDraft.question,
      lines: castDraft.method === "manual" ? castDraft.manualLines.map(Number) : castDraft.lines.slice(0, 6),
      dateTime: castDraft.dateTime,
    } : latestReading,
  };

  if (draftComplete) {
    localStorage.setItem(LATEST_READING_KEY, JSON.stringify(state.completedReading));
    if (bootingOnCast) localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultCast));
  }

  let coinScene = null;
  let holdState = null;
  let imprintTimer = 0;
  let undoTimer = 0;

  class CoinScene {
    constructor(container, faces) {
      this.container = container;
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
      this.camera.position.set(0, 1.25, 7.1);
      this.camera.lookAt(0, -0.12, 0);
      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.NoToneMapping;
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.domElement.setAttribute("aria-hidden", "true");
      container.appendChild(this.renderer.domElement);

      this.scene.add(new THREE.AmbientLight(0xf0e5cf, 1.86));
      this.scene.add(new THREE.HemisphereLight(0xf6efdf, 0x66786c, 0.64));
      const keyLight = new THREE.DirectionalLight(0xe2cda7, 0.66);
      keyLight.position.set(-3.5, 5, 4);
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.near = 1;
      keyLight.shadow.camera.far = 14;
      this.scene.add(keyLight);

      const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(12, 6),
        new THREE.ShadowMaterial({ color: 0x493b30, opacity: 0.09 })
      );
      floor.rotation.x = -Math.PI / 2;
      floor.position.y = -1.08;
      floor.receiveShadow = true;
      this.scene.add(floor);

      this.coins = [-1.38, 0, 1.43].map((x, index) => {
        const coin = this.createCoin(index);
        coin.position.set(x, [-0.09, -0.04, -0.1][index], [0, 0.14, -0.04][index]);
        coin.userData.baseX = x;
        coin.userData.baseY = coin.position.y;
        coin.userData.baseZ = coin.position.z;
        coin.userData.restX = [-0.16, -0.11, -0.19][index];
        coin.userData.restZ = [-0.1, 0.04, 0.09][index];
        this.scene.add(coin);
        return coin;
      });

      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(container);
      this.resize();
      this.setFaces(faces);
    }

    createCoin(index) {
      const radii = [0.86, 0.9, 0.875];
      const halfHoles = [0.185, 0.2, 0.19];
      const depths = [0.18, 0.22, 0.2];
      const shape = new THREE.Shape();
      shape.absarc(0, 0, radii[index], 0, Math.PI * 2, false);
      const hole = new THREE.Path();
      const halfHole = halfHoles[index];
      hole.moveTo(-halfHole, -halfHole);
      hole.lineTo(halfHole, -halfHole);
      hole.lineTo(halfHole, halfHole);
      hole.lineTo(-halfHole, halfHole);
      hole.closePath();
      shape.holes.push(hole);

      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: depths[index],
        steps: 1,
        curveSegments: 64,
        bevelEnabled: true,
        bevelSegments: 3,
        bevelSize: 0.035,
        bevelThickness: 0.035,
      });
      geometry.translate(0, 0, -depths[index] / 2);

      const faceMaterial = new THREE.MeshLambertMaterial({
        color: 0xffffff,
        map: this.createPatinaTexture(index),
      });
      const edgeColors = [0x76502d, 0x68452b, 0x7b5633];
      const edgeMaterial = new THREE.MeshLambertMaterial({ color: edgeColors[index] });
      const group = new THREE.Group();
      const body = new THREE.Mesh(geometry, [faceMaterial, edgeMaterial]);
      body.castShadow = true;
      body.receiveShadow = true;
      group.add(body);

      const ringGeometry = new THREE.TorusGeometry(radii[index] * 0.78, [0.017, 0.021, 0.015][index], 10, 64);
      const ringMaterial = new THREE.MeshLambertMaterial({ color: [0x68442a, 0x76502d, 0x60402b][index] });
      const ringDepth = depths[index] / 2 + 0.036;
      [-ringDepth, ringDepth].forEach((z) => {
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.z = z;
        group.add(ring);
      });

      group.userData.baseScale = [0.965, 1.035, 0.99][index];
      group.scale.setScalar(group.userData.baseScale);
      group.add(this.createInscription(depths[index] / 2 + 0.06, index));
      return group;
    }

    createPatinaTexture(index) {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const context = canvas.getContext("2d");
      const palettes = [
        ["#ad7c44", "#c39c61", "#7c5736"],
        ["#b58a4d", "#c7a364", "#805b38"],
        ["#a27848", "#b9945d", "#74513a"],
      ];
      const [base, warm, dark] = palettes[index];
      const wash = context.createRadialGradient(108, 92, 18, 128, 128, 142);
      wash.addColorStop(0, warm);
      wash.addColorStop(0.64, base);
      wash.addColorStop(1, dark);
      context.fillStyle = wash;
      context.fillRect(0, 0, 256, 256);

      let seed = 9173 + index * 313;
      const random = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
      };
      for (let i = 0; i < 620; i += 1) {
        const x = random() * 256;
        const y = random() * 256;
        const radius = 0.3 + random() * 2.2;
        context.fillStyle = random() > 0.54 ? `rgba(48, 54, 42, ${0.025 + random() * 0.08})` : `rgba(240, 217, 166, ${0.018 + random() * 0.065})`;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
      }
      const patina = ["rgba(80, 105, 90, .28)", "rgba(79, 99, 85, .18)", "rgba(74, 111, 96, .34)"][index];
      context.fillStyle = patina;
      for (let i = 0; i < [7, 4, 10][index]; i += 1) {
        const x = 30 + random() * 196;
        const y = 30 + random() * 196;
        context.beginPath();
        context.ellipse(x, y, 3 + random() * 11, 2 + random() * 6, random() * Math.PI, 0, Math.PI * 2);
        context.fill();
      }
      context.strokeStyle = "rgba(65, 43, 27, 0.19)";
      context.lineWidth = 1;
      for (let y = 14; y < 256; y += 9 + index) {
        context.beginPath();
        context.moveTo(0, y + (random() - 0.5) * 3);
        context.lineTo(256, y + (random() - 0.5) * 3);
        context.stroke();
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    }

    createInscription(z, index) {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, 256, 256);
      context.fillStyle = ["rgba(66, 43, 27, 0.82)", "rgba(75, 48, 27, 0.78)", "rgba(58, 44, 31, 0.82)"][index];
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.font = '600 40px "Noto Serif SC", "Songti SC", serif';
      [["開", 128, 49], ["元", 128, 207], ["通", 207, 128], ["寶", 49, 128]].forEach(([character, x, y], characterIndex) => {
        context.globalAlpha = 0.22;
        context.fillText(character, x + 1.4, y + 0.8);
        context.globalAlpha = 0.9 - characterIndex * 0.025;
        context.fillText(character, x, y);
      });
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: THREE.DoubleSide });
      const label = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 1.55), material);
      label.position.z = z;
      return label;
    }

    resize() {
      const width = Math.max(this.container.clientWidth, 1);
      const height = Math.max(this.container.clientHeight, 1);
      this.renderer.setSize(width, height, false);
      this.camera.aspect = width / height;
      this.cameraRestZ = width < 500 ? 8.7 : 7.8;
    this.cameraTargetY = width < 500 ? -1.45 : -0.12;
      this.camera.position.z = this.cameraRestZ;
      this.camera.lookAt(0, this.cameraTargetY, 0);
      this.camera.updateProjectionMatrix();
      this.render();
    }

    setFaces(faces) {
      this.faces = [...faces];
      this.camera.position.z = this.cameraRestZ || this.camera.position.z;
      this.camera.lookAt(0, this.cameraTargetY ?? -0.12, 0);
      this.coins.forEach((coin, index) => {
        coin.position.x = coin.userData.baseX;
        coin.position.y = coin.userData.baseY;
        coin.position.z = coin.userData.baseZ;
        coin.rotation.set(coin.userData.restX, faces[index] === "back" ? Math.PI : 0, coin.userData.restZ);
        coin.scale.setScalar(coin.userData.baseScale || 1);
      });
      this.render();
    }

    beginGathering() {
      cancelAnimationFrame(this.frame);
      const startTime = performance.now();
      const animate = (now) => {
        const elapsed = now - startTime;
        const strength = Math.min(1, elapsed / 620);
        this.coins.forEach((coin, index) => {
          const inward = (1 - strength * 0.08);
          coin.position.x = coin.userData.baseX * inward;
          coin.position.y = coin.userData.baseY + Math.sin(elapsed * 0.018 + index * 1.7) * 0.025 * strength;
          coin.rotation.z = coin.userData.restZ + Math.sin(elapsed * 0.012 + index) * 0.035 * strength;
        });
        this.render();
        this.frame = requestAnimationFrame(animate);
      };
      this.frame = requestAnimationFrame(animate);
    }

    endGathering(reset = true) {
      cancelAnimationFrame(this.frame);
      if (reset) this.setFaces(this.faces || ["front", "back", "front"]);
    }

    toss(faces, duration = 1120) {
      cancelAnimationFrame(this.frame);
      const starts = this.coins.map((coin) => ({ x: coin.rotation.x, y: coin.rotation.y }));
      const startTime = performance.now();
      const animate = (now) => {
        const elapsed = now - startTime;
        const framingProgress = Math.max(0, Math.min(1, elapsed / duration));
        const framingLift = Math.sin(Math.PI * framingProgress);
        const mobileFramingDistance = this.container.clientWidth < 500 ? 2.9 : 0.92;
        this.camera.position.z = (this.cameraRestZ || 7.8) + framingLift * mobileFramingDistance;
        const mobileTossTarget = (this.cameraTargetY ?? -0.12) + (this.container.clientWidth < 500 ? framingLift * 0.82 : 0);
        this.camera.lookAt(0, mobileTossTarget, 0);
        let active = false;
        this.coins.forEach((coin, index) => {
          const delay = index * 70;
          const progress = Math.max(0, Math.min(1, (elapsed - delay) / Math.max(duration - delay, 1)));
          if (progress < 1) active = true;
          const lift = Math.sin(Math.PI * progress);
          const settle = Math.sin(Math.PI * Math.min(1, progress * 1.18));
          const targetY = faces[index] === "back" ? Math.PI : 0;
          coin.position.x = coin.userData.baseX + lift * [-0.18, 0.08, 0.2][index];
          coin.position.y = coin.userData.baseY + lift * (1.08 + index * 0.05) - Math.sin(progress * Math.PI * 3) * 0.035 * progress;
          coin.rotation.x = starts[index].x + progress * Math.PI * (4.2 + index * 0.35);
          coin.rotation.y = starts[index].y + progress * (Math.PI * 4 + targetY - starts[index].y);
          coin.rotation.z = coin.userData.restZ + settle * [0.18, -0.12, 0.15][index];
          coin.scale.setScalar((coin.userData.baseScale || 1) * (1 + lift * 0.025));
          if (progress === 1) {
            coin.position.set(coin.userData.baseX, coin.userData.baseY, coin.userData.baseZ);
            coin.rotation.set(coin.userData.restX, targetY, coin.userData.restZ);
            coin.scale.setScalar(coin.userData.baseScale || 1);
          }
        });
        this.render();
        if (active) this.frame = requestAnimationFrame(animate);
        else this.camera.position.z = this.cameraRestZ || this.camera.position.z;
      };
      this.frame = requestAnimationFrame(animate);
    }

    render() {
      this.renderer.render(this.scene, this.camera);
    }

    dispose() {
      cancelAnimationFrame(this.frame);
      this.resizeObserver?.disconnect();
      this.scene.traverse((object) => {
        object.geometry?.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.filter(Boolean).forEach((material) => {
          material.map?.dispose();
          material.dispose();
        });
      });
      this.renderer.dispose();
      this.renderer.domElement.remove();
    }
  }

  const records = [
    { id: "demo", question: "今年下半年的项目推进是否顺利？", hex: "水雷屯 → 地雷复", date: "2026-09-17 10:28", method: "铜钱摇卦", status: "待反馈" },
    { id: "career", question: "近期工作方向应当如何取舍？", hex: "风山渐 → 风火家人", date: "2026-09-12 21:16", method: "手动录入", status: "已反馈" },
    { id: "journey", question: "十月出行计划是否适宜？", hex: "泽水困 → 雷水解", date: "2026-09-02 08:42", method: "铜钱摇卦", status: "未反馈" },
    { id: "study", question: "本阶段学习安排如何调整？", hex: "山水蒙 → 山风蛊", date: "2026-08-26 19:05", method: "铜钱摇卦", status: "已反馈" },
    { id: "cooperate", question: "这次合作能否按计划落地？", hex: "火泽睽 → 天泽履", date: "2026-08-18 14:33", method: "手动录入", status: "待反馈" },
  ];

  const lineNames = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];
  const beasts = ["青龙", "朱雀", "勾陈", "腾蛇", "白虎", "玄武"];
  const lineTypes = {
    0: { label: "老阴", yin: true, moving: true },
    1: { label: "少阳", yin: false, moving: false },
    2: { label: "少阴", yin: true, moving: false },
    3: { label: "老阳", yin: false, moving: true },
  };

  const demoBen = [1, 2, 1, 2, 2, 0];
  const demoBian = [1, 2, 1, 2, 2, 1];
  const benLabels = ["子孙 子水", "官鬼 寅木", "妻财 辰土", "兄弟 午火", "父母 申金", "官鬼 戌土"];
  const bianLabels = ["子孙 子水", "官鬼 寅木", "妻财 辰土", "妻财 丑土", "官鬼 卯木", "兄弟 巳火"];

  function saveDraft() {
    const { question, method, started, lines, manualLines, dateTime } = state.cast;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ question, method, started, lines, manualLines, dateTime }));
  }

  function castIsComplete(cast = state.cast) {
    return cast.method === "manual"
      ? cast.manualLines.length === 6 && cast.manualLines.every((line) => line !== "")
      : cast.lines.length === 6 && cast.lines.every((line) => line !== null);
  }

  function castHasProgress(cast = state.cast) {
    return cast.method === "manual"
      ? cast.manualLines.some((line) => line !== "")
      : cast.lines.some((line) => line !== null);
  }

  function archiveCompletedCast() {
    if (!castIsComplete()) return;
    const reading = {
      question: state.cast.question,
      lines: state.cast.method === "manual" ? state.cast.manualLines.map(Number) : state.cast.lines.slice(0, 6),
      dateTime: state.cast.dateTime,
    };
    state.completedReading = reading;
    localStorage.setItem(LATEST_READING_KEY, JSON.stringify(reading));
  }

  function startFreshCast() {
    state.cast = {
      ...defaultCast,
      lines: [...defaultCast.lines],
      manualLines: [...defaultCast.manualLines],
      tossing: false,
      imprinting: false,
      generating: false,
      coinFaces: ["front", "back", "front"],
      newest: -1,
    };
    state.resumePrompt = false;
    state.undoLine = null;
    state.slipOpen = false;
    state.manualPicker = null;
    state.summaryOpen = false;
    saveDraft();
  }

  function currentReading() {
    if (castIsComplete()) {
      return {
        question: state.cast.question,
        lines: state.cast.method === "manual" ? state.cast.manualLines.map(Number) : state.cast.lines.slice(0, 6),
        dateTime: state.cast.dateTime,
      };
    }
    if (Array.isArray(state.completedReading?.lines) && state.completedReading.lines.length === 6) return state.completedReading;
    return { question: "本次所问之事", lines: demoBen, dateTime: "2026-09-17T10:28" };
  }

  function leaveCastWorkspace() {
    if (castIsComplete()) {
      archiveCompletedCast();
      startFreshCast();
      return;
    }
    if (state.cast.started && castHasProgress()) {
      state.cast.started = false;
      state.resumePrompt = true;
      state.cast.started = true;
      saveDraft();
      state.cast.started = false;
    }
  }

  function currentRoute() {
    const hash = location.hash.replace(/^#/, "") || "/cast";
    if (hash === "/cast") return { page: "cast" };
    if (hash === "/readings") return { page: "readings" };
    if (hash.startsWith("/readings/")) return { page: "detail", id: hash.split("/")[2] || "demo" };
    if (hash === "/me") return { page: "me" };
    return { page: "cast" };
  }

  function routeGroup(route) {
    return route.page === "detail" ? "readings" : route.page;
  }

  function shell(content, route) {
    const active = routeGroup(route);
    return `
      <div class="app-shell">
        <header class="top-nav" data-top-nav>
          <div class="top-nav__inner">
            <a class="brand" href="#/cast" data-action="enter-cast" aria-label="三钱六掷首页">
              ${logoMark()}
              <span class="brand__text"><span class="brand__name">三钱六掷</span><span class="brand__desc">六爻排盘</span></span>
            </a>
            <nav class="top-nav__links" aria-label="一级导航">
              ${navLink("cast", "起卦", active)}
              ${navLink("readings", "排盘记录", active)}
              ${navLink("me", "我的", active)}
            </nav>
            <div class="top-nav__user"><span class="avatar">芒</span><span>芒果</span></div>
          </div>
        </header>
        <header class="mobile-top">
          <a class="brand" href="#/cast" data-action="enter-cast" aria-label="三钱六掷首页">${logoMark()}</a>
          <span class="mobile-top__title">${routeTitle(route)}</span>
          <a class="mobile-top__avatar" href="#/me" aria-label="我的">${icon("user")}</a>
        </header>
        <main>${content}</main>
        <nav class="bottom-nav" aria-label="手机端一级导航">
          ${bottomNavLink("cast", "起卦", "coins", active)}
          ${bottomNavLink("readings", "排盘记录", "scroll", active)}
          ${bottomNavLink("me", "我的", "user", active)}
        </nav>
        <div id="toast-region" aria-live="polite" aria-atomic="true"></div>
      </div>`;
  }

  function navLink(page, text, active) {
    return `<a class="nav-link" href="#/${page}" ${page === "cast" ? 'data-action="enter-cast"' : ""} ${active === page ? 'aria-current="page"' : ""}>${text}</a>`;
  }

  function bottomNavLink(page, text, iconName, active) {
    return `<a class="bottom-nav__item" href="#/${page}" ${page === "cast" ? 'data-action="enter-cast"' : ""} ${active === page ? 'aria-current="page"' : ""}>${icon(iconName)}<span>${text}</span></a>`;
  }

  function routeTitle(route) {
    return ({ cast: "三钱六掷", readings: "排盘记录", detail: "卦例详情", me: "我的" })[route.page] || "三钱六掷";
  }

  function pageHead(kicker, title, subtitle, action = "") {
    return `<div class="page-head"><div><p class="page-kicker">${kicker}</p><h1 class="page-title">${title}</h1><p class="page-subtitle">${subtitle}</p></div>${action}</div>`;
  }

  function renderYaoSymbol(type, empty = false) {
    const info = type === null || type === "" ? null : lineTypes[Number(type)];
    const yin = info ? info.yin : false;
    return `<span class="yao-symbol ${yin ? "is-yin" : "is-yang"} ${empty ? "is-empty" : ""}">${yin ? '<i class="yao-bar"></i><i class="yao-bar"></i>' : '<i class="yao-bar"></i>'}</span>`;
  }

  function castPreview() {
    const source = state.cast.method === "manual" ? state.cast.manualLines.map((v) => v === "" ? null : Number(v)) : state.cast.lines;
    const count = source.filter((v) => v !== null).length;
    const rows = [...lineNames].reverse().map((name, reversedIndex) => {
      const index = 5 - reversedIndex;
      const value = source[index];
      const info = value === null ? null : lineTypes[value];
      const isNew = state.cast.newest === index;
      return `<div class="yao-row ${isNew ? "is-new" : ""}" style="--row-index:${reversedIndex}" aria-label="${name}${info ? `，${info.label}` : "，未得"}">
        <span class="yao-index">${name}</span>
        ${renderYaoSymbol(value, value === null)}
        <span class="yao-mark ${info?.moving ? "yao-mark--moving" : ""}">${info ? `${info.label}${info.moving ? " · 动" : ""}` : "未得"}</span>
      </div>`;
    }).join("");
    return `<section class="cast-preview observation-slip ${state.slipOpen ? "is-open" : ""}" aria-labelledby="preview-title">
      <button class="observation-slip__handle" type="button" data-action="toggle-slip" aria-expanded="${state.slipOpen}" aria-controls="observation-slip-body">
        <span class="observation-slip__label"><b>六爻记录</b><small>${count === 0 ? "待起初爻" : count === 6 ? "六爻既成" : `${lineNames[count - 1]}已定`}</small></span>
        <span class="observation-slip__count">${count.toString().padStart(2, "0")} / 06</span>
        <span class="observation-slip__chevron" aria-hidden="true">${icon("chevronDown")}</span>
      </button>
      <div class="observation-slip__body" id="observation-slip-body">
        <div class="observation-slip__head"><div><p class="page-kicker">Casting record</p><h2 class="section-title" id="preview-title">六爻次第</h2></div><span class="preview-head__meta">自下而上</span></div>
        <div class="yao-list">${rows}</div>
        <div class="preview-foot"><span>${count === 6 ? "卦象已定，可以观卦" : "每一掷，归一爻"}</span><strong class="hex-name">${count === 6 ? "水雷屯 · 之 · 地雷复" : "待成卦"}</strong></div>
      </div>
    </section>`;
  }

  function ritualProgress(count, complete) {
    const labels = ["初", "二", "三", "四", "五", "上"];
    return labels.map((label, index) => `<span class="ritual-step ${index < count ? "is-complete" : index === count && !complete ? "is-current" : ""}" ${index === count && !complete ? 'aria-current="step"' : ""}><i></i><em>${label}</em></span>`).join("");
  }

  function coinStage() {
    const count = state.cast.lines.filter((v) => v !== null).length;
    const complete = count === 6;
    const progress = ritualProgress(count, complete);
    const mainLabel = state.cast.tossing ? `${icon("loader")}铜钱落定中` : state.cast.imprinting ? `${icon("sparkles")}爻象归笺` : complete ? `${icon("sparkles")}观卦` : `${icon("coins")}按住摇卦`;
    const currentName = complete ? "既成" : lineNames[count].replace("爻", "");
    return `<section class="cast-workspace ${complete ? "is-complete" : ""}" aria-labelledby="cast-stage-title">
      <div class="coin-stage ${state.cast.tossing ? "is-tossing" : ""} ${state.cast.imprinting ? "is-imprinting" : ""}" data-cast-surface role="button" tabindex="0" aria-label="${complete ? "六爻已成" : "按住铜钱，松手完成第 ${count + 1} 掷"}">
        <div class="stage-caption"><p class="page-kicker">三枚钱 · 六次掷</p><h2 class="section-title" id="cast-stage-title">${complete ? "六爻既成" : "静心一念"}</h2><p data-stage-caption>${complete ? "卦意待观" : "按住铜钱，松手成爻"}</p></div>
        <div class="cast-counter" aria-label="当前第 ${Math.min(count + 1, 6)} 掷"><strong>${String(Math.min(count + 1, 6)).padStart(2, "0")}</strong><span>/ 06</span><em>${currentName}</em></div>
        <div class="landing-ring" aria-hidden="true"></div><div class="coin-canvas" data-coin-canvas aria-hidden="true"></div><div class="coin-cursor" aria-hidden="true"><i></i></div><div class="particle-layer" data-particle-layer aria-hidden="true"></div>
        <div class="cast-imprint" data-cast-imprint aria-live="polite"></div>
        <div class="stage-status" data-stage-status aria-live="polite">${state.cast.tossing ? "铜钱翻转，静候落定" : state.cast.imprinting ? "爻象拓印，归入笺中" : complete ? "六爻已定" : count === 0 ? "从初爻开始" : `${lineNames[count - 1]}已归笺`}</div>
        ${complete ? '<div class="completion-seal" aria-label="成卦">成卦</div>' : ""}
      </div>
      <div class="cast-controls">
        <div class="ritual-progress" data-cast-progress-steps aria-label="六爻进度，已得 ${count} 爻">${progress}</div>
        <div class="cast-actions">
          <button class="button button--wide hold-button ${complete ? "hold-button--observe" : ""} ${state.cast.generating ? "is-loading" : ""}" type="button" data-cast-main-action data-action="${complete ? "generate-reading" : "hold-toss"}" ${state.cast.tossing || state.cast.imprinting || state.cast.generating ? "disabled" : ""}><span class="hold-button__label" data-hold-label>${state.cast.generating ? `${icon("loader")}正在生成` : mainLabel}</span><span class="hold-button__meter" aria-hidden="true"></span></button>
          <button class="button button--ghost cast-undo" type="button" data-cast-undo data-action="undo-cast" ${count === 0 || state.cast.tossing || state.cast.imprinting ? "disabled" : ""}>${icon("arrowLeft")}<span>撤回</span></button>
          <button class="button button--ghost cast-restart" type="button" data-action="request-reset-cast" ${count === 0 || state.cast.tossing || state.cast.imprinting ? "disabled" : ""}>${icon("rotate")}<span>重起</span></button>
        </div>
      </div>
    </section>`;
  }

  function manualStage() {
    const complete = state.cast.manualLines.every((value) => value !== "");
    const completedCount = state.cast.manualLines.filter((value) => value !== "").length;
    const rows = lineNames.map((name, index) => {
      const value = state.cast.manualLines[index];
      const choice = value === "" ? `<span class="manual-choice__empty">选择爻象</span>${icon("chevronDown")}` : `${renderYaoSymbol(Number(value))}<span class="manual-choice__name">${lineTypes[Number(value)].label}${lineTypes[Number(value)].moving ? " · 动" : ""}</span>${icon("chevronDown")}`;
      return `<div class="manual-row ${value !== "" ? "is-filled" : ""}" data-manual-row="${index}"><span class="manual-row__index">${String(index + 1).padStart(2, "0")}</span><span class="manual-row__label">${name}</span><button class="manual-choice" type="button" data-action="open-manual-picker" data-index="${index}" aria-label="选择${name}爻象">${choice}</button></div>`;
    }).join("");
    return `<section class="manual-workspace" aria-labelledby="manual-title">
      <header class="manual-ledger__head"><div><p class="page-kicker">录爻册</p><h2 class="section-title" id="manual-title">手动录入</h2><p class="section-subtitle">已有卦象时，由初爻起，自下而上依次录入</p></div><div class="manual-count" aria-label="已录入 ${completedCount} 爻"><strong data-manual-count>${String(completedCount).padStart(2, "0")}</strong><span>/ 06</span></div></header>
      <label class="manual-date" for="cast-datetime"><span>起卦时间</span><input class="manual-control manual-date__input" id="cast-datetime" data-cast-datetime type="datetime-local" value="${escapeHTML(state.cast.dateTime)}"></label>
      <div class="manual-grid" aria-label="六爻录入">${rows}</div>
      <footer class="manual-actions"><p>六爻录毕，方可观卦</p><div><button class="button button--gold ${state.cast.generating ? "is-loading" : ""}" type="button" data-manual-submit data-action="generate-manual" ${!complete || state.cast.generating ? "disabled" : ""}>${state.cast.generating ? `${icon("loader")}正在生成` : `${icon("sparkles")}录毕观卦`}</button><button class="button button--ghost" type="button" data-action="reset-manual">${icon("rotate")}<span>清空</span></button></div></footer>
    </section>`;
  }

  function manualPickerLayer() {
    if (state.manualPicker === null) return "";
    const options = [
      [1, "少阳", "字 · 字 · 背"],
      [2, "少阴", "字 · 背 · 背"],
      [3, "老阳", "字 · 字 · 字"],
      [0, "老阴", "背 · 背 · 背"],
    ];
    return `<div class="ritual-dialog-layer manual-picker-layer" data-manual-picker-layer><div class="manual-picker" role="dialog" aria-modal="true" aria-labelledby="manual-picker-title">
      <header><div><p class="page-kicker">${lineNames[state.manualPicker]}</p><h2 id="manual-picker-title">选择爻象</h2></div><button class="icon-button" type="button" data-action="close-manual-picker" aria-label="关闭">${icon("x")}</button></header>
      <div class="manual-picker__options">${options.map(([value, label, coins]) => `<button class="manual-symbol-option" type="button" data-action="choose-manual-line" data-value="${value}" aria-pressed="${String(state.cast.manualLines[state.manualPicker]) === String(value)}">${renderYaoSymbol(value)}<span><strong>${label}${lineTypes[value].moving ? " · 动" : ""}</strong><small>${coins}</small></span></button>`).join("")}</div>
    </div></div>`;
  }

  function updateManualUI() {
    const completedCount = state.cast.manualLines.filter((value) => value !== "").length;
    const counter = document.querySelector("[data-manual-count]");
    if (counter) counter.textContent = String(completedCount).padStart(2, "0");
    const submit = document.querySelector("[data-manual-submit]");
    if (submit) submit.disabled = completedCount !== 6 || state.cast.generating;
  }

  function castEntry() {
    const animateLogo = state.logoIntroPending ? "is-entering" : "";
    const draftCount = state.cast.method === "manual" ? state.cast.manualLines.filter((line) => line !== "").length : state.cast.lines.filter((line) => line !== null).length;
    const resume = state.resumePrompt ? `<aside class="resume-draft" aria-label="未完成的起卦"><div><span>未完之卦</span><strong>${escapeHTML(state.cast.question || "上次所问之事")}</strong><small>${state.cast.method === "manual" ? "手动录入" : "铜钱摇卦"} · 已得 ${draftCount} / 6 爻</small></div><div><button class="button" type="button" data-action="continue-draft">继续上次</button><button class="button button--ghost" type="button" data-action="discard-draft">重新起卦</button></div></aside>` : "";
    return `<div class="page cast-entry editorial-entry">
      <section class="intention" aria-labelledby="cast-entry-title">
        <div class="intention__brand">${logoMark(`brand-mark--ritual ${animateLogo}`)}<p class="page-kicker">三枚钱 · 六次掷</p><h1 class="intention__title" id="cast-entry-title"><span>三钱</span><span>六掷</span></h1><p class="intention__subtitle">心有所问，掷钱成卦</p></div>
        <div class="intention__form" data-intention-form>${resume}
          <label class="intention__field" for="question"><span class="intention__field-label"><b>所问之事</b><small>限八十字</small></span><textarea id="question" data-cast-question maxlength="80" rows="2" placeholder="例如：这次合作能否在十月顺利落地？">${escapeHTML(state.cast.question)}</textarea></label>
          <p class="intention__help" data-intention-help>一卦一事，问题具体更便于日后回看。</p>
          <div class="intention__actions">
            <button class="button button--gold intention__primary" type="button" data-action="begin-cast">${icon("coins")}开始起卦</button>
            <button class="button button--outline intention__secondary" type="button" data-action="begin-manual">${icon("sliders")}手动录入</button>
          </div>
          <p class="intention__manual-hint">已有卦象时，可直接录入六爻</p>
        </div>
      </section>
    </div>`;
  }

  function castPage() {
    if (!state.cast.started) return castEntry();
    const manual = state.cast.method === "manual";
    const count = manual ? state.cast.manualLines.filter((line) => line !== "").length : state.cast.lines.filter((line) => line !== null).length;
    return `<div class="page cast-session ritual-page ${manual ? "is-manual" : "is-coins"}">
      <header class="cast-session__head ritual-masthead"><div><p class="page-kicker">所问之事</p><h1>${escapeHTML(state.cast.question)}</h1></div><button class="button button--ghost" type="button" data-action="edit-intention">${icon("arrowLeft")}重写所问</button></header>
      <div class="cast-layout ritual-field">
        <div class="ritual-folio" aria-hidden="true"><span>丙午年</span><b>三钱六掷</b><span>${manual ? `已录 ${String(count).padStart(2, "0")} 爻` : `第 ${String(Math.min(count + 1, 6)).padStart(2, "0")} 次`}</span></div>
        <div class="cast-right ritual-center">${manual ? manualStage() : coinStage()}</div>
        ${manual ? "" : `<div class="cast-left ritual-slip-wrap">${castPreview()}</div>`}
        <p class="ritual-side-note" aria-hidden="true">${manual ? "自初而上 · 逐爻录入" : "一念既起 · 六爻渐成"}</p>
      </div>
      ${manual ? manualPickerLayer() : ""}
      ${state.summaryOpen ? castSummaryLayer() : ""}
      ${manual ? "" : `<div class="ritual-dialog-layer" data-reset-dialog hidden><div class="ritual-dialog" role="alertdialog" aria-modal="true" aria-labelledby="reset-dialog-title" aria-describedby="reset-dialog-copy"><button class="icon-button ritual-dialog__close" type="button" data-action="cancel-reset-cast" aria-label="关闭">${icon("x")}</button><span class="ritual-dialog__seal" aria-hidden="true">重起</span><p class="page-kicker">重起一卦</p><h2 id="reset-dialog-title">要舍去这一卦吗？</h2><p id="reset-dialog-copy" data-reset-copy>当前已得 ${count} 爻。清空后需要重新投掷，本次所问仍会保留。</p><div class="ritual-dialog__actions"><button class="button button--danger" type="button" data-action="confirm-reset-cast">舍去本卦</button><button class="button button--ghost" type="button" data-action="cancel-reset-cast">继续观卦</button></div></div></div>`}
      ${manual ? `<div class="ritual-dialog-layer" data-manual-reset-dialog hidden><div class="ritual-dialog" role="alertdialog" aria-modal="true" aria-labelledby="manual-reset-title"><button class="icon-button ritual-dialog__close" type="button" data-action="cancel-reset-manual" aria-label="关闭">${icon("x")}</button><span class="ritual-dialog__seal" aria-hidden="true">清册</span><p class="page-kicker">清空录爻册</p><h2 id="manual-reset-title">要舍去已录六爻吗？</h2><p>当前已录 ${count} 爻。清空后需要从初爻重新选择。</p><div class="ritual-dialog__actions"><button class="button button--danger" type="button" data-action="confirm-reset-manual">舍去记录</button><button class="button button--ghost" type="button" data-action="cancel-reset-manual">继续录入</button></div></div></div>` : ""}
    </div>`;
  }

  function castSummaryLayer() {
    const lines = state.cast.lines.every((value) => value !== null) ? state.cast.lines : demoBen;
    const moving = lines.map((value, index) => lineTypes[value].moving ? lineNames[index] : "").filter(Boolean);
    return `<div class="ritual-dialog-layer cast-summary-layer"><section class="cast-summary" role="dialog" aria-modal="true" aria-labelledby="cast-summary-title">
      <button class="icon-button cast-summary__close" type="button" data-action="close-cast-summary" aria-label="返回起卦页">${icon("x")}</button>
      <div class="cast-summary__seal" aria-hidden="true">成卦</div><p class="page-kicker">六爻既成</p><h2 id="cast-summary-title">先观其象，再读其意</h2>
      <p class="cast-summary__question">${escapeHTML(state.cast.question || "本次所问之事")}</p>
      <div class="cast-summary__hexagrams"><div><span>本卦</span><strong>水雷屯</strong><small>坎宫 · 二世</small></div><i aria-hidden="true">之</i><div><span>变卦</span><strong>地雷复</strong><small>坤宫 · 一世</small></div></div>
      <dl class="cast-summary__meta"><div><dt>动爻</dt><dd>${moving.length ? moving.join("、") : "无动爻"}</dd></div><div><dt>起卦时间</dt><dd>${escapeHTML(state.cast.dateTime.replace("T", " "))}</dd></div></dl>
      <div class="cast-summary__actions"><button class="button button--ink" type="button" data-action="open-full-reading">展开排盘 ${icon("arrowRight")}</button><button class="button button--ghost" type="button" data-action="close-cast-summary">再看一眼铜钱</button></div>
    </section></div>`;
  }

  function readingBoard(id) {
    const newest = currentReading();
    const question = id === "new" ? newest.question : (records.find((item) => item.id === id)?.question || records[0].question);
    const lines = id === "new" ? newest.lines : demoBen;
    const boardRows = [...lineNames].reverse().map((_, reversedIndex) => {
      const index = 5 - reversedIndex;
      const ben = lines[index] ?? demoBen[index];
      const bian = lineTypes[ben].moving ? (lineTypes[ben].yin ? 1 : 2) : demoBian[index];
      return `<div class="board-line ${lineTypes[ben].moving ? "is-moving" : ""}">
        <span class="board-beast">${beasts[reversedIndex]}</span>
        <div class="board-yao">${renderYaoSymbol(ben)}<span class="board-yao__label">${benLabels[index]}${lineTypes[ben].moving ? " ○" : ""}</span></div>
        <div class="board-yao">${renderYaoSymbol(bian)}<span class="board-yao__label">${bianLabels[index]}</span></div>
      </div>`;
    }).join("");
    return `<aside class="reading-board" aria-label="排盘结果">
      <div class="reading-board__title"><div class="reading-board__folio"><span>六爻排盘</span><i>占位结果</i></div><h2 class="reading-board__question">${escapeHTML(question)}</h2><div class="reading-board__meta"><span>${icon("calendar")} 2026-09-17</span><span>${icon("clock")} 10:28</span><span>农历 八月初七</span></div></div>
      <div class="pillars"><div class="pillar-cell pillar-cell--label">四柱</div><div class="pillar-cell"><strong>丙午</strong><small>年柱</small></div><div class="pillar-cell"><strong>丁酉</strong><small>月柱</small></div><div class="pillar-cell"><strong>壬辰</strong><small>日柱</small></div><div class="pillar-cell"><strong>乙巳</strong><small>时柱</small></div></div>
      <div class="reading-board__scroll"><div class="board-head"><span></span><div class="board-head__hex"><strong>水雷屯</strong><span>坎宫 · 二世</span></div><div class="board-head__hex"><strong>地雷复</strong><span>坤宫 · 一世</span></div></div><div class="board-lines">${boardRows}</div></div>
      <div class="board-foot"><span>旬空：午未</span><span>世：二爻 · 应：五爻</span><span>动爻：上爻</span></div>
    </aside>`;
  }

  function heatmap() {
    const months = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
    const rows = ["子孙", "妻财", "官鬼", "父母", "兄弟", "世爻"];
    let cells = '<span></span>' + months.map((m) => `<span class="heat-label">${m}月</span>`).join("");
    rows.forEach((row, rowIndex) => {
      cells += `<span class="heat-label heat-label--row">${row}</span>`;
      months.forEach((month, monthIndex) => {
        const raw = ((rowIndex * 5 + monthIndex * 3 + 2) % 7) - 3;
        const cls = raw < 0 ? `n${Math.abs(raw)}` : raw > 0 ? `p${raw}` : "0";
        cells += `<button class="trend-cell heat-${cls}" type="button" title="${row} · ${month}月：${raw > 0 ? "+" : ""}${raw}" aria-label="${row} ${month}月 趋势值 ${raw}"></button>`;
      });
    });
    return `<div class="trend-scroll"><div class="heatmap">${cells}</div></div><div class="heat-legend"><span>收敛</span><i class="legend-swatch heat-n3"></i><i class="legend-swatch heat-n1"></i><i class="legend-swatch heat-0"></i><i class="legend-swatch heat-p1"></i><i class="legend-swatch heat-p3"></i><span>增强</span></div>`;
  }

  function lineChart() {
    const values = [42, 48, 40, 55, 62, 58, 69, 64, 77, 71, 82, 75];
    const points = values.map((value, index) => `${30 + index * 48},${160 - value * 1.45}`).join(" ");
    const area = `30,170 ${points} 558,170`;
    return `<div class="trend-scroll"><div class="chart-wrap"><svg class="line-chart" viewBox="0 0 590 190" role="img" aria-label="未来十二月趋势折线图"><path class="chart-grid-line" d="M30 40H570M30 85H570M30 130H570M30 170H570"/><polygon class="chart-area" points="${area}"/><polyline class="chart-path" points="${points}"/>${values.map((v, i) => `<circle class="chart-point" cx="${30 + i * 48}" cy="${160 - v * 1.45}" r="3.5"/>`).join("")}</svg><div class="chart-labels">${["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"].map((m) => `<span>${m}</span>`).join("")}</div></div></div>`;
  }

  function detailPage(id) {
    const newest = currentReading();
    const question = id === "new" ? newest.question : (records.find((item) => item.id === id)?.question || records[0].question);
    const lines = id === "new" ? newest.lines : demoBen;
    const moving = lines.map((value, index) => lineTypes[value].moving ? lineNames[index] : "").filter(Boolean);
    const primaryHex = [...lines].reverse().map((value) => renderYaoSymbol(value)).join("");
    const changedHex = [...lines].reverse().map((value) => renderYaoSymbol(lineTypes[value].moving ? (lineTypes[value].yin ? 1 : 2) : value)).join("");
    return `<div class="page detail-page">
      <nav class="detail-index" aria-label="卦例页内导航"><div class="detail-index__inner"><button class="detail-index__link" data-scroll="overview" aria-current="true">成卦摘要</button><button class="detail-index__link" data-scroll="analysis">解读</button><button class="detail-index__link" data-scroll="trend">日月趋势</button><button class="detail-index__link" data-scroll="feedback">反馈</button></div></nav>
      <div class="detail-grid">
        ${readingBoard(id)}
        <article class="detail-content">
          <section class="result-overview detail-section" id="overview" data-detail-section><div class="result-overview__heading"><div><p class="page-kicker">成卦摘要</p><h1 class="page-title">${escapeHTML(question)}</h1></div><span class="result-overview__seal">已成卦</span></div>
            <div class="result-pair"><div class="result-hex"><span>本卦</span><div class="result-hex__lines">${primaryHex}</div><div><strong>水雷屯</strong><small>坎宫 · 二世</small></div></div><i>之</i><div class="result-hex"><span>变卦</span><div class="result-hex__lines">${changedHex}</div><div><strong>地雷复</strong><small>坤宫 · 一世</small></div></div></div>
            <div class="moving-note"><span>动爻</span><strong>${moving.length ? moving.join("、") : "无动爻"}</strong><p>动而有变，先观本卦之势，再看变卦所归。</p></div>
          </section>
          <section class="detail-section" id="analysis" data-detail-section><div class="detail-section__head"><div><p class="page-kicker">卦意解读</p><h2 class="section-title">由象入意</h2></div><span class="section-stamp">排盘已完成</span></div>
            <p class="content-lead">此处为首版界面占位解读。主卦水雷屯，象征事物初生阶段秩序未定；变卦地雷复，提示回到关键基础、逐步恢复节奏。</p>
            <div class="analysis-note"><strong>阅读提示：</strong> 专业断卦内容将在后续接入真实数据。当前文案只用于验证信息层级、阅读密度与响应式排版。</div>
            <div class="subsection"><h3>用神与关系</h3><p>选择不同用神，可在此更新六亲关系、高亮爻位和对应分析。</p><div class="yongshen-picker" role="group" aria-label="用神选择">${["妻财", "官鬼", "父母", "子孙", "兄弟"].map((name) => `<button class="pill pill--button" data-action="select-yongshen" data-value="${name}" aria-pressed="${state.yongshen === name}">${name}</button>`).join("")}</div><div class="relation-grid"><div class="relation-item"><span>当前用神</span><strong data-yongshen-label>${state.yongshen} · 辰土</strong></div><div class="relation-item"><span>世应关系</span><strong>世克应 · 占位</strong></div><div class="relation-item"><span>旺衰状态</span><strong>得月扶 · 占位</strong></div></div></div>
            <div class="subsection"><h3>核心判断</h3><p>前期容易出现方向反复或协同成本，重点不在快速扩张，而在厘清次序、回到可验证的小步推进。此区域后续可接入正式术语和详细论证。</p></div>
          </section>
          <section class="detail-section" id="trend" data-detail-section><div class="detail-section__head trend-section-head"><div><p class="page-kicker">时势</p><h2 class="section-title">日月地支趋势</h2></div><div class="segmented" role="group" aria-label="趋势视图"><button class="segmented__item" data-action="trend-view" data-value="heat" aria-pressed="true">${icon("grid")}热力图</button><button class="segmented__item" data-action="trend-view" data-value="chart" aria-pressed="false">${icon("chart")}折线图</button></div></div>
            <div class="trend-shell"><div class="trend-viewport"><div class="trend-track"><div class="trend-panel">${heatmap()}</div><div class="trend-panel">${lineChart()}</div></div></div><div class="trend-position" aria-hidden="true"><i class="is-current"></i><i></i></div></div>
            <div class="trend-summary"><div class="trend-summary__item"><span>近期</span><strong>先缓后稳 · 占位</strong></div><div class="trend-summary__item"><span>转折</span><strong>申酉月 · 占位</strong></div><div class="trend-summary__item"><span>提示</span><strong>以稳为先 · 占位</strong></div></div>
          </section>
          <section class="detail-section" id="feedback" data-detail-section><div class="detail-section__head"><div><p class="page-kicker">事后记</p><h2 class="section-title">反馈与回看</h2><p class="section-subtitle">反馈与起卦分析分开记录，方便未来回看。</p></div></div>
            <p>这次分析对你后续验证是否有帮助？</p><div class="feedback-choices" role="group" aria-label="反馈选择"><button class="choice" data-action="feedback-choice" data-value="helpful" aria-pressed="false">${icon("thumbsUp")}有帮助</button><button class="choice" data-action="feedback-choice" data-value="unhelpful" aria-pressed="false">${icon("thumbsDown")}不太符合</button></div>
            <label class="field-wrap"><span class="field-label">补充记录（可选）</span><textarea class="field" id="feedback-text" placeholder="事情后来如何发展？写下关键节点，便于未来复盘。"></textarea></label><div class="feedback-actions"><button class="button" type="button" data-action="save-feedback">${icon("check")}保存反馈</button></div>
          </section>
        </article>
      </div>
    </div>`;
  }

  function readingsPage() {
    const q = state.recordSearch.trim().toLowerCase();
    const filtered = records.filter((item) => (state.recordFilter === "all" || item.status === state.recordFilter) && (!q || `${item.question}${item.hex}${item.method}`.toLowerCase().includes(q)));
    const rows = filtered.map((item, index) => `<a class="record-row" href="#/readings/${item.id}"><span class="record-number">${String(index + 1).padStart(2, "0")}</span><div class="record-question"><strong>${item.question}</strong><span>${item.hex}</span></div><span class="record-cell">${item.date}</span><span class="record-cell record-cell--method">${item.method}</span><span class="record-cell record-cell--status"><span class="record-status ${item.status === "已反馈" ? "is-done" : ""}">${item.status}</span></span><span class="record-arrow">${icon("arrowRight")}</span></a>`).join("");
    return `<div class="page page--narrow records-page">${pageHead("问卦卷宗", "排盘记录", "集中查看、筛选并回访过去的卦例。", `<a class="button" href="#/cast">${icon("coins")}再起一卦</a>`)}
      <div class="records-toolbar"><label class="input-icon"><span class="sr-only">搜索记录</span>${icon("search")}<input class="field" data-record-search value="${escapeHTML(state.recordSearch)}" placeholder="搜索问题、卦名或起卦方式"></label><div class="records-filters" role="group" aria-label="反馈状态筛选">${[["all", "全部"], ["待反馈", "待反馈"], ["已反馈", "已反馈"], ["未反馈", "未反馈"]].map(([value, text]) => `<button class="pill pill--button" data-action="record-filter" data-value="${value}" aria-pressed="${state.recordFilter === value}">${text}</button>`).join("")}</div></div>
      <section class="records-list" aria-label="排盘记录列表"><div class="record-head"><span></span><span>所问与卦象</span><span>起卦时间</span><span>方式</span><span>反馈状态</span><span></span></div>${rows || `<div class="empty-state">${icon("search")}<strong>没有匹配的记录</strong><p>换一个关键词或筛选状态试试。</p></div>`}</section>
    </div>`;
  }

  function preferenceRow(name, desc, key, iconName) {
    return `<div class="setting-row"><div class="setting-copy"><strong>${icon(iconName)} ${name}</strong><span>${desc}</span></div><button class="switch" type="button" role="switch" data-action="toggle-pref" data-value="${key}" aria-label="${name}" aria-checked="${Boolean(state.prefs[key])}"></button></div>`;
  }

  function mePage() {
    return `<div class="page page--narrow profile-page">${pageHead("个人册页", "我的", "管理使用偏好、反馈入口与账号信息。")}
      <div class="profile-grid"><section class="profile-card"><div class="profile-user"><span class="avatar">芒</span><div><h2>芒果</h2><p>普通用户 · 界面原型</p></div></div><div class="stats"><div class="stat"><strong>18</strong><span>排盘</span></div><div class="stat"><strong>7</strong><span>已反馈</span></div><div class="stat"><strong>3</strong><span>待回访</span></div></div><div class="account-actions"><a class="button button--outline" href="#/readings">查看排盘记录</a><button class="button button--danger" type="button" data-action="prototype-only">${icon("logOut")}退出登录</button></div></section>
        <section class="settings-panel"><div class="settings-group"><h2>体验偏好</h2>${preferenceRow("界面动效", "关闭后保留必要状态变化，减少移动动画。", "motion", "eye")}${preferenceRow("摇卦音效", "首版仅保留设置项，后续可接入轻铜钱声。", "sound", "volume")}${preferenceRow("轻触反馈", "支持的手机在铜钱落定时提供短促震动。", "haptic", "vibration")}</div><div class="settings-group"><h2>使用与安全</h2><div class="setting-row"><div class="setting-copy"><strong>${icon("book")} 使用说明</strong><span>了解起卦、记录与反馈的界面流程。</span></div><button class="button button--ghost" data-action="prototype-only">查看</button></div><div class="setting-row"><div class="setting-copy"><strong>${icon("shield")} 账号安全</strong><span>密码与登录设备管理将在正式版接入。</span></div><button class="button button--ghost" data-action="prototype-only">管理</button></div></div></section>
      </div>
    </div>`;
  }

  function initCoinScene() {
    const container = document.querySelector("[data-coin-canvas]");
    if (!container) return;
    try {
      coinScene = new CoinScene(container, state.cast.coinFaces);
    } catch (error) {
      console.error("Three.js coin scene failed to initialize", error);
      container.innerHTML = '<div class="coin-canvas__fallback">当前设备无法加载 3D 铜钱</div>';
    }
  }

  function setupCastPointerEffects() {
    const stage = document.querySelector(".coin-stage");
    const cursor = stage?.querySelector(".coin-cursor");
    if (!stage || !cursor || !state.prefs.motion || !matchMedia("(hover: hover)").matches) return;
    let frame = 0;
    let point = { x: 0, y: 0 };
    stage.addEventListener("pointermove", (event) => {
      const rect = stage.getBoundingClientRect();
      point = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      stage.classList.add("has-coin-cursor");
      if (frame) return;
      frame = requestAnimationFrame(() => {
        cursor.style.setProperty("--cursor-x", `${point.x}px`);
        cursor.style.setProperty("--cursor-y", `${point.y}px`);
        frame = 0;
      });
    });
    stage.addEventListener("pointerleave", () => stage.classList.remove("has-coin-cursor"));
  }

  function spawnCoinParticles(kind = "release") {
    if (!state.prefs.motion) return;
    const layer = document.querySelector("[data-particle-layer]");
    if (!layer) return;
    const vectors = kind === "settle"
      ? [[-62, -9], [-34, 6], [-12, -4], [18, 7], [42, -6], [68, 5]]
      : [[-52, -42], [-28, -62], [-8, -48], [19, -66], [40, -43], [58, -57]];
    layer.innerHTML = vectors.map(([x, y], index) => `<i class="coin-particle coin-particle--${kind}" style="--particle-x:${x}px;--particle-y:${y}px;--particle-delay:${index * 34}ms"></i>`).join("");
    window.setTimeout(() => { if (layer) layer.innerHTML = ""; }, 780);
  }

  function updateCoinCastUI({ updatePreview = false } = {}) {
    const count = state.cast.lines.filter((value) => value !== null).length;
    const complete = count === 6;
    const stage = document.querySelector(".coin-stage");
    if (!stage) return;
    stage.classList.toggle("is-tossing", state.cast.tossing);
    stage.classList.toggle("is-imprinting", state.cast.imprinting);
    stage.setAttribute("aria-label", complete ? "六爻已成" : `按住铜钱，松手完成第 ${count + 1} 掷`);
    stage.tabIndex = complete ? -1 : 0;

    const caption = stage.querySelector("[data-stage-caption]");
    if (caption) caption.textContent = complete ? "卦意待观" : "按住铜钱，松手成爻";
    const status = stage.querySelector("[data-stage-status]");
    if (status) status.textContent = state.cast.tossing ? "铜钱翻转，静候落定" : state.cast.imprinting ? "爻象拓印，归入笺中" : complete ? "六爻已定" : count === 0 ? "从初爻开始" : `${lineNames[count - 1]}已归笺`;

    const counter = stage.querySelector(".cast-counter");
    if (counter) {
      counter.setAttribute("aria-label", `当前第 ${Math.min(count + 1, 6)} 掷`);
      counter.innerHTML = `<strong>${String(Math.min(count + 1, 6)).padStart(2, "0")}</strong><span>/ 06</span><em>${complete ? "既成" : lineNames[count].replace("爻", "")}</em>`;
    }
    const folioCount = document.querySelector(".ritual-folio span:last-child");
    if (folioCount) folioCount.textContent = `第 ${String(Math.min(count + 1, 6)).padStart(2, "0")} 次`;

    let seal = stage.querySelector(".completion-seal");
    if (complete && !seal) stage.insertAdjacentHTML("beforeend", '<div class="completion-seal" aria-label="成卦">成卦</div>');
    if (!complete) seal?.remove();

    const progress = document.querySelector("[data-cast-progress-steps]");
    if (progress) {
      progress.setAttribute("aria-label", `六爻进度，已得 ${count} 爻`);
      progress.innerHTML = ritualProgress(count, complete);
    }

    const mainAction = document.querySelector("[data-cast-main-action]");
    if (mainAction) {
      mainAction.dataset.action = complete ? "generate-reading" : "hold-toss";
      mainAction.classList.toggle("hold-button--observe", complete);
      stage.closest(".cast-workspace")?.classList.toggle("is-complete", complete);
      mainAction.disabled = state.cast.tossing || state.cast.imprinting || state.cast.generating;
      mainAction.classList.toggle("is-loading", state.cast.generating);
      const label = state.cast.generating
        ? `${icon("loader")}正在生成`
        : state.cast.tossing
          ? `${icon("loader")}铜钱落定中`
          : state.cast.imprinting
            ? `${icon("sparkles")}爻象归笺`
          : complete
            ? `${icon("sparkles")}观卦`
            : `${icon("coins")}按住摇卦`;
      mainAction.innerHTML = `<span class="hold-button__label" data-hold-label>${label}</span><span class="hold-button__meter" aria-hidden="true"></span>`;
    }
    const undo = document.querySelector("[data-cast-undo]");
    if (undo) undo.disabled = count === 0 || state.cast.tossing || state.cast.imprinting;
    const restart = document.querySelector('[data-action="request-reset-cast"]');
    if (restart) restart.disabled = count === 0 || state.cast.tossing || state.cast.imprinting;

    if (updatePreview) {
      const preview = document.querySelector(".cast-preview");
      if (preview) {
        preview.outerHTML = castPreview();
        const nextPreview = document.querySelector(".cast-preview");
        nextPreview?.classList.add("has-new-result");
        window.setTimeout(() => nextPreview?.classList.remove("has-new-result"), 920);
      }
    }
  }

  function showCastImprint(index, result) {
    const imprint = document.querySelector("[data-cast-imprint]");
    if (!imprint) return;
    const info = lineTypes[result];
    const faces = state.cast.coinFaces.map((face) => face === "front" ? "字" : "背").join(" · ");
    imprint.innerHTML = `<span>${lineNames[index]}</span>${renderYaoSymbol(result)}<strong>${info.label}${info.moving ? " · 动" : ""}</strong><small>${faces}</small>`;
    imprint.classList.remove("is-visible");
    requestAnimationFrame(() => imprint.classList.add("is-visible"));
  }

  function showUndoNotice(index) {
    const region = document.querySelector("#toast-region");
    if (!region) return;
    region.innerHTML = `<div class="undo-notice" role="status"><span>${lineNames[index]}已撤回</span><button type="button" data-action="restore-undo">恢复</button></div>`;
  }

  function closeResetDialog() {
    const layer = document.querySelector("[data-reset-dialog]");
    if (!layer) return;
    layer.hidden = true;
  }

  function resetCoinCast() {
    window.clearTimeout(imprintTimer);
    window.clearTimeout(undoTimer);
    state.cast.lines = [null, null, null, null, null, null];
    state.cast.newest = -1;
    state.cast.tossing = false;
    state.cast.imprinting = false;
    state.cast.coinFaces = ["front", "back", "front"];
    state.undoLine = null;
    state.slipOpen = false;
    saveDraft();
    closeResetDialog();
    coinScene?.setFaces(state.cast.coinFaces);
    updateCoinCastUI({ updatePreview: true });
  }

  function undoLastCast() {
    if (state.cast.tossing || state.cast.imprinting) return;
    let index = state.cast.lines.length - 1;
    while (index >= 0 && state.cast.lines[index] === null) index -= 1;
    if (index < 0) return;
    window.clearTimeout(undoTimer);
    state.undoLine = { index, value: state.cast.lines[index] };
    state.cast.lines[index] = null;
    state.cast.newest = -1;
    saveDraft();
    updateCoinCastUI({ updatePreview: true });
    showUndoNotice(index);
    undoTimer = window.setTimeout(() => {
      state.undoLine = null;
      const region = document.querySelector("#toast-region");
      if (region?.querySelector(".undo-notice")) region.innerHTML = "";
    }, 4000);
  }

  function restoreUndoneCast() {
    if (!state.undoLine) return;
    const { index, value } = state.undoLine;
    state.cast.lines[index] = value;
    state.cast.newest = index;
    state.undoLine = null;
    window.clearTimeout(undoTimer);
    saveDraft();
    updateCoinCastUI({ updatePreview: true });
    const region = document.querySelector("#toast-region");
    if (region) region.innerHTML = "";
  }

  function render({ preserveScroll = false } = {}) {
    const scrollY = window.scrollY;
    const route = currentRoute();
    let content = castPage();
    if (route.page === "readings") content = readingsPage();
    if (route.page === "detail") content = detailPage(route.id);
    if (route.page === "me") content = mePage();
    if (holdState) {
      window.clearTimeout(holdState.timer);
      holdState = null;
    }
    coinScene?.dispose();
    coinScene = null;
    app.innerHTML = shell(content, route);
    document.documentElement.classList.toggle("reduce-motion", !state.prefs.motion);
    if (preserveScroll) requestAnimationFrame(() => window.scrollTo(0, scrollY));
    initCoinScene();
    setupCastPointerEffects();
    setupDetailObserver();
    updateNavShadow();
    state.logoIntroPending = false;
  }

  function updateNavShadow() {
    document.querySelector("[data-top-nav]")?.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  function setupDetailObserver() {
    const sections = document.querySelectorAll("[data-detail-section]");
    if (!sections.length || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      document.querySelectorAll("[data-scroll]").forEach((button) => button.setAttribute("aria-current", String(button.dataset.scroll === visible.target.id)));
    }, { rootMargin: "-25% 0px -60%", threshold: [0.05, 0.3, 0.6] });
    sections.forEach((section) => observer.observe(section));
  }

  function showToast(message) {
    const region = document.querySelector("#toast-region");
    if (!region) return;
    region.innerHTML = `<div class="toast" role="status">${icon("check")}${escapeHTML(message)}</div>`;
    window.setTimeout(() => { if (region) region.innerHTML = ""; }, 2600);
  }

  function randomLine() {
    const coins = Array.from({ length: 3 }, () => Math.random() > 0.5 ? 1 : 0);
    state.cast.coinFaces = coins.map((value) => value ? "front" : "back");
    const heads = coins.reduce((sum, value) => sum + value, 0);
    return heads === 0 ? 0 : heads === 1 ? 2 : heads === 2 ? 1 : 3;
  }

  function beginCast(method) {
    const input = document.querySelector("[data-cast-question]");
    const question = (input?.value || state.cast.question).trim();
    if (!question) {
      const form = document.querySelector("[data-intention-form]");
      form?.classList.add("is-invalid");
      const help = document.querySelector("[data-intention-help]");
      if (help) help.textContent = "请先写下所问之事，再开始起卦。";
      input?.focus();
      return;
    }
    state.cast.question = question;
    state.cast.method = method;
    const now = new Date();
    const pad = (value) => String(value).padStart(2, "0");
    state.cast.dateTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    state.cast.started = true;
    state.cast.newest = -1;
    state.manualPicker = null;
    state.summaryOpen = false;
    saveDraft();
    render();
  }

  function startHold(button, pointerId = null) {
    if (holdState || button.disabled || state.cast.tossing || state.cast.imprinting) return;
    const stage = document.querySelector(".coin-stage");
    const label = button.querySelector("[data-hold-label]");
    holdState = { button, pointerId, ready: false, timer: 0 };
    button.classList.add("is-holding");
    stage?.classList.add("is-gathering");
    if (label) label.innerHTML = `${icon("coins")}静心凝神…`;
    const status = stage?.querySelector("[data-stage-status]");
    if (status) status.textContent = "按住片刻，待钱意相合";
    if (state.prefs.motion) coinScene?.beginGathering();
    holdState.timer = window.setTimeout(() => {
      if (!holdState) return;
      holdState.ready = true;
      button.classList.add("is-ready");
      stage?.classList.add("is-ready");
      if (label) label.innerHTML = `${icon("sparkles")}松手起卦`;
      if (state.prefs.haptic && navigator.vibrate) navigator.vibrate(10);
    }, state.prefs.motion ? 620 : 300);
  }

  function finishHold(cancelled = false) {
    if (!holdState) return;
    const { button, ready, timer } = holdState;
    const stage = document.querySelector(".coin-stage");
    window.clearTimeout(timer);
    button.classList.remove("is-holding", "is-ready");
    stage?.classList.remove("is-gathering", "is-ready");
    holdState = null;
    if (ready && !cancelled) {
      coinScene?.endGathering(false);
      spawnCoinParticles("release");
      toss();
      return;
    }
    coinScene?.endGathering(true);
    const status = stage?.querySelector("[data-stage-status]");
    if (status) status.textContent = "再静一息，按住至墨线蓄满";
    window.setTimeout(() => {
      if (!state.cast.tossing && !state.cast.imprinting) updateCoinCastUI();
    }, 760);
  }

  function toss() {
    if (state.cast.tossing || state.cast.imprinting) return;
    const index = state.cast.lines.findIndex((line) => line === null);
    if (index < 0) return;
    const result = randomLine();
    state.undoLine = null;
    window.clearTimeout(undoTimer);
    state.cast.tossing = true;
    state.cast.newest = -1;
    updateCoinCastUI();
    if (state.prefs.motion) coinScene?.toss(state.cast.coinFaces, 1120);
    else coinScene?.setFaces(state.cast.coinFaces);
    window.setTimeout(() => {
      state.cast.lines[index] = result;
      state.cast.tossing = false;
      state.cast.imprinting = true;
      state.cast.newest = index;
      saveDraft();
      if (state.prefs.haptic && navigator.vibrate) navigator.vibrate(index === 5 ? [20, 35, 25] : 18);
      coinScene?.setFaces(state.cast.coinFaces);
      updateCoinCastUI({ updatePreview: true });
      showCastImprint(index, result);
      spawnCoinParticles("settle");
      window.clearTimeout(imprintTimer);
      imprintTimer = window.setTimeout(() => {
        state.cast.imprinting = false;
        document.querySelector("[data-cast-imprint]")?.classList.remove("is-visible");
        updateCoinCastUI();
      }, state.prefs.motion ? 520 : 80);
    }, state.prefs.motion ? 1120 : 120);
  }

  function generateReading(manual = false) {
    if (manual) state.cast.lines = state.cast.manualLines.map(Number);
    saveDraft();
    state.summaryOpen = true;
    render({ preserveScroll: true });
  }

  function updateTrend(view) {
    state.trendView = view;
    const track = document.querySelector(".trend-track");
    track?.classList.toggle("is-chart", view === "chart");
    document.querySelectorAll('[data-action="trend-view"]').forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.value === view)));
    document.querySelectorAll(".trend-position i").forEach((dot, index) => dot.classList.toggle("is-current", index === (view === "chart" ? 1 : 0)));
  }

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action], [data-scroll]");
    if (!target) return;
    if (target.dataset.scroll) {
      document.querySelector(`#${target.dataset.scroll}`)?.scrollIntoView({ behavior: state.prefs.motion ? "smooth" : "auto", block: "start" });
      return;
    }
    const action = target.dataset.action;
    if (action === "hold-toss") return;
    if (action === "enter-cast") {
      if (currentRoute().page === "cast" && castIsComplete()) {
        event.preventDefault();
        archiveCompletedCast();
        startFreshCast();
        render();
        requestAnimationFrame(() => document.querySelector("[data-cast-question]")?.focus());
      }
      return;
    }
    if (action === "begin-cast") beginCast("coins");
    if (action === "begin-manual") beginCast("manual");
    if (action === "continue-draft") {
      state.resumePrompt = false;
      state.cast.started = true;
      saveDraft();
      render();
    }
    if (action === "discard-draft") {
      state.resumePrompt = false;
      state.cast.question = "";
      state.cast.method = "coins";
      state.cast.started = false;
      state.cast.lines = [null, null, null, null, null, null];
      state.cast.manualLines = ["", "", "", "", "", ""];
      state.cast.newest = -1;
      state.slipOpen = false;
      saveDraft();
      render();
      requestAnimationFrame(() => document.querySelector("[data-cast-question]")?.focus());
    }
    if (action === "toggle-slip") {
      state.slipOpen = !state.slipOpen;
      const slip = target.closest(".observation-slip");
      slip?.classList.toggle("is-open", state.slipOpen);
      target.setAttribute("aria-expanded", String(state.slipOpen));
    }
    if (action === "edit-intention") {
      if (castIsComplete()) {
        archiveCompletedCast();
        startFreshCast();
        render();
        requestAnimationFrame(() => document.querySelector("[data-cast-question]")?.focus());
        return;
      }
      const previousQuestion = state.cast.question;
      startFreshCast();
      state.cast.question = previousQuestion;
      saveDraft();
      render();
      requestAnimationFrame(() => document.querySelector("[data-cast-question]")?.focus());
    }
    if (action === "undo-cast") undoLastCast();
    if (action === "restore-undo") restoreUndoneCast();
    if (action === "request-reset-cast") {
      const layer = document.querySelector("[data-reset-dialog]");
      const copy = document.querySelector("[data-reset-copy]");
      const count = state.cast.lines.filter((line) => line !== null).length;
      if (copy) copy.textContent = `当前已得 ${count} 爻。清空后需要重新投掷，本次所问仍会保留。`;
      if (layer) {
        layer.hidden = false;
        requestAnimationFrame(() => layer.querySelector('[data-action="cancel-reset-cast"]')?.focus());
      }
    }
    if (action === "cancel-reset-cast") closeResetDialog();
    if (action === "confirm-reset-cast") resetCoinCast();
    if (action === "open-manual-picker") {
      state.manualPicker = Number(target.dataset.index);
      render({ preserveScroll: true });
      requestAnimationFrame(() => document.querySelector(".manual-symbol-option")?.focus());
    }
    if (action === "close-manual-picker") {
      state.manualPicker = null;
      render({ preserveScroll: true });
    }
    if (action === "choose-manual-line") {
      if (state.manualPicker !== null) state.cast.manualLines[state.manualPicker] = target.dataset.value;
      state.manualPicker = null;
      saveDraft();
      render({ preserveScroll: true });
    }
    if (action === "reset-manual") {
      const layer = document.querySelector("[data-manual-reset-dialog]");
      if (layer) layer.hidden = false;
    }
    if (action === "cancel-reset-manual") document.querySelector("[data-manual-reset-dialog]")?.setAttribute("hidden", "");
    if (action === "confirm-reset-manual") {
      state.cast.manualLines = ["", "", "", "", "", ""];
      state.cast.lines = [null, null, null, null, null, null];
      saveDraft();
      render({ preserveScroll: true });
    }
    if (action === "generate-reading") generateReading(false);
    if (action === "generate-manual") generateReading(true);
    if (action === "close-cast-summary") {
      state.summaryOpen = false;
      render({ preserveScroll: true });
    }
    if (action === "open-full-reading") {
      archiveCompletedCast();
      state.summaryOpen = false;
      state.cast.generating = true;
      target.disabled = true;
      window.setTimeout(() => {
        state.cast.generating = false;
        location.hash = "/readings/new";
      }, state.prefs.motion ? 280 : 30);
    }
    if (action === "trend-view") updateTrend(target.dataset.value);
    if (action === "select-yongshen") {
      state.yongshen = target.dataset.value;
      document.querySelectorAll('[data-action="select-yongshen"]').forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.value === state.yongshen)));
      const label = document.querySelector("[data-yongshen-label]");
      if (label) label.textContent = `${state.yongshen} · 占位`; 
    }
    if (action === "feedback-choice") {
      state.feedback = target.dataset.value;
      document.querySelectorAll('[data-action="feedback-choice"]').forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.value === state.feedback)));
    }
    if (action === "save-feedback") showToast("反馈已保存（本地原型）");
    if (action === "record-filter") { state.recordFilter = target.dataset.value; render({ preserveScroll: true }); }
    if (action === "toggle-pref") {
      const key = target.dataset.value;
      state.prefs[key] = !state.prefs[key];
      localStorage.setItem(PREF_KEY, JSON.stringify(state.prefs));
      render({ preserveScroll: true });
      showToast(`${target.getAttribute("aria-label")}已${state.prefs[key] ? "开启" : "关闭"}`);
    }
    if (action === "prototype-only") showToast("首版为界面原型，功能将在后续接入");
  });

  document.addEventListener("input", (event) => {
    if (event.target.matches("[data-cast-question]")) {
      state.cast.question = event.target.value;
      saveDraft();
      document.querySelector("[data-intention-form]")?.classList.remove("is-invalid");
      const help = document.querySelector("[data-intention-help]");
      if (help) help.textContent = "一卦一事，问题具体更便于日后回看。";
    }
    if (event.target.matches("[data-record-search]")) {
      state.recordSearch = event.target.value;
      const cursor = event.target.selectionStart;
      render({ preserveScroll: true });
      const input = document.querySelector("[data-record-search]");
      input?.focus();
      input?.setSelectionRange(cursor, cursor);
    }
  });

  document.addEventListener("change", (event) => {
    if (event.target.matches("[data-cast-datetime]")) { state.cast.dateTime = event.target.value; saveDraft(); }
  });

  document.addEventListener("pointerdown", (event) => {
    const trigger = event.target.closest('[data-action="hold-toss"], [data-cast-surface]');
    if (!trigger) return;
    const button = trigger.matches('[data-action="hold-toss"]') ? trigger : document.querySelector('[data-action="hold-toss"]');
    if (!button) return;
    event.preventDefault();
    try { trigger.setPointerCapture(event.pointerId); } catch {}
    startHold(button, event.pointerId);
  });

  document.addEventListener("pointerup", (event) => {
    if (!holdState || holdState.pointerId !== event.pointerId) return;
    finishHold(false);
  });

  document.addEventListener("pointercancel", (event) => {
    if (!holdState || holdState.pointerId !== event.pointerId) return;
    finishHold(true);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (state.summaryOpen) {
        state.summaryOpen = false;
        render({ preserveScroll: true });
        return;
      }
      if (state.manualPicker !== null) {
        state.manualPicker = null;
        render({ preserveScroll: true });
        return;
      }
      if (!document.querySelector("[data-reset-dialog]")?.hidden) {
        closeResetDialog();
        return;
      }
    }
    const trigger = event.target.closest?.('[data-action="hold-toss"], [data-cast-surface]');
    if (!trigger || event.repeat || ![" ", "Enter"].includes(event.key)) return;
    const button = trigger.matches('[data-action="hold-toss"]') ? trigger : document.querySelector('[data-action="hold-toss"]');
    if (!button) return;
    event.preventDefault();
    startHold(button, "keyboard");
  });

  document.addEventListener("keyup", (event) => {
    if (!holdState || holdState.pointerId !== "keyboard" || ![" ", "Enter"].includes(event.key)) return;
    event.preventDefault();
    finishHold(false);
  });

  document.addEventListener("contextmenu", (event) => {
    if (event.target.closest?.('[data-action="hold-toss"], [data-cast-surface]')) event.preventDefault();
  });

  let renderedRoute = currentRoute();
  window.addEventListener("hashchange", () => {
    const nextRoute = currentRoute();
    if (renderedRoute.page === "cast" && nextRoute.page !== "cast") leaveCastWorkspace();
    if (renderedRoute.page !== "cast" && nextRoute.page === "cast" && castIsComplete()) {
      archiveCompletedCast();
      startFreshCast();
    }
    renderedRoute = nextRoute;
    window.scrollTo(0, 0);
    render();
  });
  window.addEventListener("scroll", updateNavShadow, { passive: true });
  if (!location.hash) location.hash = "/cast";
  render();
})();
