"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import { AvatarBase, AvatarComponent } from "./AvatarComponents";
import { Suspense } from "react";

interface AvatarSceneProps {
    baseUrl: string;
    avatarId: string;
    selectedShirt: string | null;
    selectedPant: string | null;
    actionName: string;
    environmentPreset: string;
}

export default function AvatarScene({
    baseUrl,
    avatarId,
    selectedShirt,
    selectedPant,
    actionName,
    environmentPreset
}: AvatarSceneProps) {

    const baseModelUrl = `${baseUrl}/static/models/${avatarId}/base.glb`;
    const shirtUrl = selectedShirt
        ? `${baseUrl}/static/models/${avatarId}/shirts/${selectedShirt}.glb`
        : null;
    const pantUrl = selectedPant
        ? `${baseUrl}/static/models/${avatarId}/pants/${selectedPant}.glb`
        : null;

    return (
        <div className="w-full h-full min-h-[500px] bg-neutral-100 rounded-xl overflow-hidden relative">
            <Canvas shadows camera={{ position: [0, 0, 4], fov: 50 }}>
                <ambientLight intensity={0.7} />
                <spotLight
                    position={[10, 10, 10]}
                    angle={0.15}
                    penumbra={1}
                    shadow-mapSize={2048}
                    castShadow
                />
                <Environment preset={environmentPreset as any} />

                <group position={[0, -1, 0]}>
                    <Suspense fallback={null}>
                        {/* Base Avatar */}
                        <AvatarBase url={baseModelUrl} actionName={actionName} />

                        {/* Dynamic Components */}
                        {shirtUrl && <AvatarComponent url={shirtUrl} />}
                        {pantUrl && <AvatarComponent url={pantUrl} />}
                    </Suspense>

                    <ContactShadows resolution={1024} scale={10} blur={1} opacity={0.5} far={10} color="#8a6246" />
                </group>

                <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
            </Canvas>

            {/* Loading overlay logic could go here */}
        </div>
    );
}
