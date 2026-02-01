"use client";

import { useGLTF, useAnimations } from "@react-three/drei";
import { useEffect } from "react";

interface AvatarPartProps {
    url: string;
}

interface AvatarBaseProps extends AvatarPartProps {
    actionName: string;
}

export function AvatarBase({ url, actionName }: AvatarBaseProps) {
    const { scene, animations } = useGLTF(url);
    const { actions } = useAnimations(animations, scene);

    useEffect(() => {
        const action = actions[actionName] || (actionName === "Walk" && actions["animation_0"] ? actions["animation_0"] : null);

        if (action) {
            action.reset().fadeIn(0.5).play();
            return () => { action.fadeOut(0.5); };
        }
    }, [actions, actionName]);

    return (
        <primitive
            object={scene}
            scale={2}
        />
    );
}

export function AvatarComponent({ url }: AvatarPartProps) {
    const { scene } = useGLTF(url);
    const clone = scene.clone();

    return (
        <primitive
            object={clone}
            scale={2} // Matching base scale
        />
    );
}

// Pre-load logic can be added here if needed
