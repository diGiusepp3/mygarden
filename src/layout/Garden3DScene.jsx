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

const surfaceMaterials = {
    grass: () => new THREE.MeshStandardMaterial({ color: "#6EA84A", roughness: 1, metalness: 0 }),
    soil: () => new THREE.MeshStandardMaterial({ color: "#7A563B", roughness: 1, metalness: 0 }),
    soilDark: () => new THREE.MeshStandardMaterial({ color: "#5E402A", roughness: 1, metalness: 0 }),
    path: () => new THREE.MeshStandardMaterial({ color: "#9BCB7C", roughness: 1, metalness: 0 }),
    border: () => new THREE.MeshStandardMaterial({ color: "#8A6548", roughness: 1, metalness: 0 }),
};

const fitCameraToObject = (camera, controls, object, offset = 1.45) => {
    const box = new THREE.Box3().setFromObject(object);
    if (box.isEmpty()) return;
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z);
    const fitHeightDistance = maxDim / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)));
    const fitWidthDistance = fitHeightDistance / camera.aspect;
    const distance = offset * Math.max(fitHeightDistance, fitWidthDistance);
    const direction = new THREE.Vector3(1.05, 0.8, 1.15).normalize();

    camera.position.copy(center).addScaledVector(direction, distance);
    camera.near = Math.max(0.1, distance / 100);
    camera.far = Math.max(100, distance * 12);
    camera.updateProjectionMatrix();

    controls.target.copy(center);
    controls.minDistance = Math.max(2, distance * 0.18);
    controls.maxDistance = distance * 8;
    controls.update();
};

const makeGlassMaterial = () =>
    new THREE.MeshPhysicalMaterial({
        color: "#DFF7FF",
        transparent: true,
        opacity: 0.32,
        transmission: 0.68,
        roughness: 0.08,
        metalness: 0.02,
        side: THREE.DoubleSide,
    });

const makeFrameMaterial = () =>
    new THREE.MeshStandardMaterial({
        color: "#B8C0C7",
        metalness: 0.9,
        roughness: 0.24,
    });

const makePlateMaterial = () =>
    new THREE.MeshStandardMaterial({
        color: "#AAB2B7",
        metalness: 0.28,
        roughness: 0.72,
    });

export default function Garden3DScene({ garden, fields = [], structures = [], zones = [], plants = [] }) {
    const mountRef = useRef(null);
    const resetRef = useRef(null);

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
        camera.position.set(garden.width * 0.8, Math.max(garden.width, garden.height) * 1.15, garden.height * 1.2);

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
        controls.maxPolarAngle = Math.PI * 0.49;
        controls.enablePan = true;
        controls.screenSpacePanning = true;

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
            new THREE.PlaneGeometry(garden.width + 2, garden.height + 2, 1, 1),
            surfaceMaterials.grass()
        );
        floor.rotation.x = -Math.PI / 2;
        floor.position.set(garden.width / 2, 0, garden.height / 2);
        floor.receiveShadow = true;
        scene.add(floor);

        const grid = new THREE.GridHelper(Math.max(garden.width, garden.height), Math.max(garden.width, garden.height), 0xb4d59a, 0xd9e6cc);
        grid.position.set(garden.width / 2, 0.01, garden.height / 2);
        scene.add(grid);

        const objects = [];
        const root = new THREE.Group();
        scene.add(root);

        const addBox = ({ x, y, w, d, h, color, label, kind, roof, type }) => {
            const group = new THREE.Group();

            if (kind === "struct" && type === "greenhouse") {
                const frameMat = makeFrameMaterial();
                const glassMat = makeGlassMaterial();
                const plateMat = makePlateMaterial();
                const wallHeight = Math.max(1.55, h - Math.max(0.35, roof || 0.55));
                const roofHeight = Math.max(0.42, roof || 0.55);
                const panelThickness = 0.045;
                const halfW = w / 2;
                const halfD = d / 2;

                const plate = new THREE.Mesh(
                    new THREE.BoxGeometry(w + 0.18, 0.14, d + 0.18),
                    plateMat
                );
                plate.position.set(x + halfW, 0.07, y + halfD);
                plate.castShadow = true;
                plate.receiveShadow = true;
                group.add(plate);

                const cornerPosts = [
                    [x + 0.06, y + 0.06],
                    [x + w - 0.06, y + 0.06],
                    [x + 0.06, y + d - 0.06],
                    [x + w - 0.06, y + d - 0.06],
                ];
                cornerPosts.forEach(([px, pz]) => {
                    const post = new THREE.Mesh(
                        new THREE.BoxGeometry(panelThickness, wallHeight + roofHeight * 0.9, panelThickness),
                        frameMat
                    );
                    post.position.set(px, (wallHeight + roofHeight * 0.9) / 2, pz);
                    post.castShadow = true;
                    post.receiveShadow = true;
                    group.add(post);
                });

                const beams = [
                    [new THREE.BoxGeometry(w - 0.2, panelThickness, panelThickness), x + halfW, wallHeight * 0.5, y + 0.08],
                    [new THREE.BoxGeometry(w - 0.2, panelThickness, panelThickness), x + halfW, wallHeight * 0.5, y + d - 0.08],
                    [new THREE.BoxGeometry(panelThickness, panelThickness, d - 0.2), x + 0.08, wallHeight * 0.5, y + halfD],
                    [new THREE.BoxGeometry(panelThickness, panelThickness, d - 0.2), x + w - 0.08, wallHeight * 0.5, y + halfD],
                    [new THREE.BoxGeometry(w - 0.18, panelThickness, panelThickness), x + halfW, wallHeight + roofHeight * 0.72, y + halfD],
                ];
                beams.forEach(([geometry, px, py, pz]) => {
                    const beam = new THREE.Mesh(geometry, frameMat);
                    beam.position.set(px, py, pz);
                    beam.castShadow = true;
                    beam.receiveShadow = true;
                    group.add(beam);
                });

                const frontWall = new THREE.Mesh(new THREE.BoxGeometry(w, wallHeight, panelThickness), glassMat);
                frontWall.position.set(x + halfW, wallHeight / 2 + 0.06, y + panelThickness / 2);
                frontWall.castShadow = true;
                frontWall.receiveShadow = true;
                group.add(frontWall);

                const backWall = new THREE.Mesh(new THREE.BoxGeometry(w, wallHeight, panelThickness), glassMat);
                backWall.position.set(x + halfW, wallHeight / 2 + 0.06, y + d - panelThickness / 2);
                backWall.castShadow = true;
                backWall.receiveShadow = true;
                group.add(backWall);

                const leftWall = new THREE.Mesh(new THREE.BoxGeometry(panelThickness, wallHeight, d), glassMat);
                leftWall.position.set(x + panelThickness / 2, wallHeight / 2 + 0.06, y + halfD);
                leftWall.castShadow = true;
                leftWall.receiveShadow = true;
                group.add(leftWall);

                const rightWall = new THREE.Mesh(new THREE.BoxGeometry(panelThickness, wallHeight, d), glassMat);
                rightWall.position.set(x + w - panelThickness / 2, wallHeight / 2 + 0.06, y + halfD);
                rightWall.castShadow = true;
                rightWall.receiveShadow = true;
                group.add(rightWall);

                const roofAngle = THREE.MathUtils.degToRad(18);
                const roofFront = new THREE.Mesh(
                    new THREE.BoxGeometry(w - 0.08, panelThickness, d / 2 + 0.04),
                    glassMat
                );
                roofFront.rotation.x = -roofAngle;
                roofFront.position.set(x + halfW, wallHeight + roofHeight * 0.42, y + d * 0.32);
                roofFront.castShadow = true;
                roofFront.receiveShadow = true;
                group.add(roofFront);

                const roofBack = new THREE.Mesh(
                    new THREE.BoxGeometry(w - 0.08, panelThickness, d / 2 + 0.04),
                    glassMat
                );
                roofBack.rotation.x = roofAngle;
                roofBack.position.set(x + halfW, wallHeight + roofHeight * 0.42, y + d * 0.68);
                roofBack.castShadow = true;
                roofBack.receiveShadow = true;
                group.add(roofBack);

                const labelTag = new THREE.Mesh(
                    new THREE.BoxGeometry(Math.max(0.4, Math.min(1.8, w * 0.3)), 0.12, 0.06),
                    frameMat
                );
                labelTag.position.set(x + halfW, wallHeight + roofHeight + 0.12, y + halfD);
                labelTag.castShadow = true;
                labelTag.receiveShadow = true;
                group.add(labelTag);

                group.userData = { label, kind };
                root.add(group);
                objects.push(group);
                return;
            }

            const material = new THREE.MeshStandardMaterial({
                color,
                roughness: kind === "plant" ? 0.7 : 0.9,
                metalness: kind === "struct" && type === "greenhouse" ? 0.08 : 0.02,
                transparent: kind !== "garden",
                opacity: kind === "plant" ? 0.95 : 0.98,
            });
            const height = Math.max(0.08, h);
            const mesh = new THREE.Mesh(
                new THREE.BoxGeometry(w, height, d),
                kind === "garden" ? surfaceMaterials.grass() : material
            );
            const baseY = kind === "field" ? -0.05 : 0;
            mesh.position.set(x + w / 2, baseY + height / 2, y + d / 2);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            group.add(mesh);

            if (kind === "field") {
                const border = new THREE.Mesh(
                    new THREE.BoxGeometry(w + 0.12, 0.06, d + 0.12),
                    surfaceMaterials.border()
                );
                border.position.set(x + w / 2, 0.01, y + d / 2);
                border.receiveShadow = true;
                group.add(border);
                const soilTop = new THREE.Mesh(
                    new THREE.BoxGeometry(Math.max(0.1, w - 0.12), Math.max(0.04, height * 0.55), Math.max(0.1, d - 0.12)),
                    surfaceMaterials.soil()
                );
                soilTop.position.set(x + w / 2, baseY + Math.max(0.04, height * 0.55) / 2, y + d / 2);
                soilTop.castShadow = true;
                soilTop.receiveShadow = true;
                group.add(soilTop);
            }

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
            root.add(group);
            objects.push(group);
        };

        sceneData.forEach(addBox);
        fitCameraToObject(camera, controls, root, 1.6);
        resetRef.current = () => fitCameraToObject(camera, controls, root, 1.6);

        const resize = () => {
            const w = mount.clientWidth || 640;
            const h = mount.clientHeight || 480;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
            fitCameraToObject(camera, controls, root, 1.6);
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
            resetRef.current = null;
        };
    }, [garden.height, garden.width, sceneData]);

    return (
        <div style={{ position:"relative", width:"100%", minHeight:460, borderRadius:18, overflow:"hidden", background:"linear-gradient(180deg, #FBF7F0 0%, #EFE3D0 100%)", border:`1px solid ${T.border}`, boxShadow:"0 18px 48px rgba(0,0,0,0.12)" }}>
            <div ref={mountRef} style={{ width:"100%", minHeight:460 }} />
            <button
                type="button"
                onClick={() => resetRef.current?.()}
                style={{
                    position:"absolute",
                    right:12,
                    top:12,
                    zIndex:2,
                    border:"none",
                    background:"rgba(255,255,255,0.9)",
                    color:T.text,
                    borderRadius:999,
                    padding:"8px 12px",
                    fontFamily:"inherit",
                    fontSize:12,
                    fontWeight:800,
                    cursor:"pointer",
                    boxShadow:"0 8px 18px rgba(0,0,0,0.12)",
                }}
            >
                Reset view
            </button>
        </div>
    );
}
