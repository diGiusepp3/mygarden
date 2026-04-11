import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FIELD_COLORS, STRUCT_FILL, STRUCT_ICONS } from "../constants.js";
import { T } from "../theme.js";

const clamp01 = (value) => Math.max(0, Math.min(1, value));

const structureMetrics = (st) => {
    const type = st.type || "shed";
    if (type === "greenhouse") return { height: 2.8, roof: 0.6, color: "#7EC8D3" };
    if (type === "tunnel_greenhouse") return { height: 1.8, roof: 0.45, color: "#82D8C8" };
    if (type === "shed") return { height: 2.4, roof: 0.2, color: "#8D6E63" };
    if (type === "compost_zone") return { height: 1.2, roof: 0.05, color: "#8D7B6A" };
    if (type === "water_point") return { height: 1.0, roof: 0.1, color: "#64B5F6" };
    if (type === "potting_bench") return { height: 1.0, roof: 0.05, color: "#A1887F" };
    if (type === "cold_frame") return { height: 0.9, roof: 0.18, color: "#90CAF9" };
    return { height: Math.max(1.2, Math.min(3, (st.height || 1.5) * 0.65)), roof: 0.1, color: "#999999" };
};

const fieldHeight = (field) => {
    const type = field.type || "raised_bed";
    if (type === "greenhouse_bed") return 0.45;
    if (type === "raised_bed") return 0.38;
    if (type === "flower_bed") return 0.28;
    if (type === "herb_bed") return 0.26;
    if (type === "fruit_area") return 0.18;
    return 0.12;
};

const plantHeight = (plant) => {
    const qty = Math.max(1, +plant.quantity || 1);
    const category = (plant.category || "").toLowerCase();
    const variety = `${plant.variety || ""} ${plant.name || ""}`.toLowerCase();
    let base = 0.25;
    if (category.includes("flower")) base = 0.45;
    if (category.includes("herb")) base = 0.28;
    if (category.includes("leafy")) base = 0.22;
    if (category.includes("fruit")) base = 0.65;
    if (category.includes("root")) base = 0.18;
    if (variety.includes("tomato") || variety.includes("pepper") || variety.includes("cucumber")) base = 0.85;
    if (variety.includes("munt") || variety.includes("mint")) base = 0.35;
    return clamp01(base + Math.min(0.9, qty / 20) * 0.25);
};

const colorForPlant = (plant) => {
    const name = `${plant.name || ""} ${plant.variety || ""}`.toLowerCase();
    if (name.includes("tomato")) return "#D84315";
    if (name.includes("pepper") || name.includes("cayenne")) return "#EF6C00";
    if (name.includes("basil")) return "#66BB6A";
    if (name.includes("parsley")) return "#43A047";
    if (name.includes("mint")) return "#26A69A";
    if (name.includes("onion") || name.includes("lente ui")) return "#BCAAA4";
    if (name.includes("carrot")) return "#FB8C00";
    if (name.includes("lettuce") || name.includes("spinach")) return "#7CB342";
    return "#81C784";
};

export default function Garden3DScene({ garden, fields = [], structures = [], zones = [], plants = [] }) {
    const mountRef = useRef(null);

    const sceneData = useMemo(() => {
        const items = [];
        items.push({ kind: "garden", x: 0, y: 0, w: garden.width, d: garden.height, h: 0.06, color: "#EAE0D2" });
        fields.forEach((field) => {
            items.push({
                kind: "field",
                x: field.x,
                y: field.y,
                w: field.width,
                d: field.height,
                h: fieldHeight(field),
                color: FIELD_COLORS[field.type] || "#7CB342",
                label: field.name,
            });
        });
        structures.forEach((st) => {
            const metrics = structureMetrics(st);
            items.push({
                kind: "struct",
                x: st.x,
                y: st.y,
                w: st.width,
                d: st.height,
                h: metrics.height,
                roof: metrics.roof,
                color: STRUCT_FILL[st.type] || metrics.color,
                label: st.name,
                type: st.type,
            });
        });
        plants.forEach((plant) => {
            const inField = fields.find((field) => field.id === plant.field_id);
            const inStruct = structures.find((st) => st.id === plant.struct_id);
            const base = inStruct || inField;
            if (!base) return;
            const seed = Array.from(String(plant.id || plant.name || "plant")).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
            const dx = ((seed % 7) / 10 + 0.12) * Math.max(0.8, base.width || 1);
            const dz = (((seed >> 3) % 7) / 10 + 0.12) * Math.max(0.8, base.height || 1);
            items.push({
                kind: "plant",
                x: base.x + Math.min(dx, Math.max(0.2, (base.width || 1) - 0.2)),
                y: base.y + Math.min(dz, Math.max(0.2, (base.height || 1) - 0.2)),
                w: 0.12,
                d: 0.12,
                h: plantHeight(plant),
                color: colorForPlant(plant),
                label: `${plant.name}${plant.variety ? ` · ${plant.variety}` : ""}`,
            });
        });
        return items;
    }, [garden.height, garden.width, fields, structures, plants]);

    useEffect(() => {
        const mount = mountRef.current;
        if (!mount) return;
        const width = mount.clientWidth || 640;
        const height = mount.clientHeight || 480;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color("#F5F0E8");
        scene.fog = new THREE.Fog("#F5F0E8", 30, 120);

        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
        camera.position.set(garden.width * 0.9, Math.max(garden.width, garden.height) * 1.1, garden.height * 1.4);

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        mount.innerHTML = "";
        mount.appendChild(renderer.domElement);

        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.08;
        controls.target.set(garden.width / 2, 0, garden.height / 2);
        controls.minDistance = 6;
        controls.maxDistance = 180;
        controls.maxPolarAngle = Math.PI * 0.49;

        const ambient = new THREE.AmbientLight(0xffffff, 1.25);
        scene.add(ambient);

        const sun = new THREE.DirectionalLight(0xfff4de, 2.6);
        sun.position.set(garden.width * 0.8, 22, garden.height * 0.6);
        sun.castShadow = true;
        sun.shadow.mapSize.width = 2048;
        sun.shadow.mapSize.height = 2048;
        sun.shadow.camera.left = -40;
        sun.shadow.camera.right = 40;
        sun.shadow.camera.top = 40;
        sun.shadow.camera.bottom = -40;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 100;
        scene.add(sun);

        const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(garden.width, garden.height),
            new THREE.MeshStandardMaterial({ color: "#EFE5D6", roughness: 1, metalness: 0 })
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(garden.width / 2, 0, garden.height / 2);
        floor.receiveShadow = true;
        scene.add(floor);

        const grid = new THREE.GridHelper(Math.max(garden.width, garden.height), Math.max(garden.width, garden.height), 0x6f8d4f, 0xc4b9a7);
        grid.position.set(garden.width / 2, 0.01, garden.height / 2);
        scene.add(grid);

        const objects = [];

        const addBox = ({ x, y, w, d, h, color, label, kind, roof, type }) => {
            const group = new THREE.Group();
            const material = new THREE.MeshStandardMaterial({
                color,
                roughness: kind === "plant" ? 0.7 : 0.9,
                metalness: kind === "struct" && type === "greenhouse" ? 0.08 : 0.02,
                transparent: kind !== "garden",
                opacity: kind === "plant" ? 0.95 : 0.92,
            });
            const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, Math.max(0.08, h), d), material);
            mesh.position.set(x + w / 2, h / 2, y + d / 2);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            group.add(mesh);

            if (kind === "struct" && h > 1.3) {
                const roofGeo = new THREE.ConeGeometry(Math.max(w, d) * 0.55, roof || 0.5, 4);
                const roofMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(color).offsetHSL(0, 0, 0.08), roughness: 0.85 });
                const roofMesh = new THREE.Mesh(roofGeo, roofMat);
                roofMesh.rotation.y = Math.PI / 4;
                roofMesh.position.set(x + w / 2, h + (roof || 0.4) / 2, y + d / 2);
                roofMesh.castShadow = true;
                roofMesh.receiveShadow = true;
                group.add(roofMesh);
            }

            if (kind === "plant") {
                const stem = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.03, 0.05, Math.max(0.1, h), 8),
                    new THREE.MeshStandardMaterial({ color, roughness: 0.8 })
                );
                stem.position.set(x + w / 2, Math.max(0.05, h) / 2, y + d / 2);
                stem.castShadow = true;
                stem.receiveShadow = true;
                group.add(stem);
            }

            group.userData = { label, kind };
            scene.add(group);
            objects.push(group);
        };

        sceneData.forEach(addBox);

        const resize = () => {
            const w = mount.clientWidth || 640;
            const h = mount.clientHeight || 480;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };

        const onResize = () => resize();
        window.addEventListener("resize", onResize);
        const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
        ro?.observe(mount);

        let frame = 0;
        const animate = () => {
            controls.update();
            frame = requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(frame);
            window.removeEventListener("resize", onResize);
            ro?.disconnect?.();
            controls.dispose();
            objects.forEach((obj) => {
                obj.traverse((child) => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) child.material.dispose();
                });
                scene.remove(obj);
            });
            renderer.dispose();
            mount.innerHTML = "";
        };
    }, [garden.height, garden.width, sceneData]);

    return (
        <div ref={mountRef} style={{ width:"100%", minHeight:460, borderRadius:18, overflow:"hidden", background:"linear-gradient(180deg, #FBF7F0 0%, #EFE3D0 100%)", border:`1px solid ${T.border}`, boxShadow:"0 18px 48px rgba(0,0,0,0.12)" }} />
    );
}
