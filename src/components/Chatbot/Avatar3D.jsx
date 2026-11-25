import { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
    OrbitControls,
    ContactShadows,
    PerspectiveCamera,
    useGLTF,
    useAnimations,
    Environment
} from '@react-three/drei';

function AvatarModel({ speaking }) {
    const outerGroup = useRef();
    const { scene, animations } = useGLTF('/src/assets/Avatar/model.glb');
    const { actions, names } = useAnimations(animations, outerGroup);

    useEffect(() => {
        const idleAnim = names.find(n => n.toLowerCase().includes('idle')) || names[0];
        if (idleAnim && actions[idleAnim]) {
            actions[idleAnim].reset().fadeIn(0.5).play();
        }
        return () => {
            if (idleAnim && actions[idleAnim]) actions[idleAnim].fadeOut(0.5);
        };
    }, [actions, names]);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (outerGroup.current) {
            // Subtle breathing & studio presence without overwriting model scale
            outerGroup.current.position.y = -2.65 + Math.sin(t * 1.4) * 0.025;
            outerGroup.current.rotation.y = -0.15 + Math.sin(t * 0.55) * 0.12;

            if (speaking) {
                const pulse = 1.9 + Math.sin(t * 10) * 0.03;
                outerGroup.current.scale.set(pulse, pulse, pulse);
            } else {
                outerGroup.current.scale.set(1.9, 1.9, 1.9);
            }
        }
    });

    return (
        <group ref={outerGroup} position={[0, -2.65, 0]} scale={1.9}>
            <primitive object={scene} />
        </group>
    );
}

export default function Avatar3D({ speaking }) {
    return (
        <div style={{ width: '100%', height: '100%', cursor: 'grab' }}>
            <Canvas shadows dpr={[1, 2]}>
                <Suspense fallback={null}>
                    <PerspectiveCamera makeDefault position={[0, 0.25, 2.3]} fov={35} />

                    {/* Studio Three-Point Lighting (Warm Key + Cool Fill + Vermilion Rim) */}
                    <ambientLight intensity={0.65} />
                    <directionalLight position={[3, 4, 4]} intensity={1.35} color="#fff7ed" castShadow />
                    <directionalLight position={[-3, 2, 2]} intensity={0.45} color="#e2e8f0" />
                    <pointLight position={[-2.5, 2.5, -2.5]} intensity={1.1} color="#e85d2c" />

                    <AvatarModel speaking={speaking} />

                    <Environment preset="studio" />
                    <ContactShadows position={[0, -1.2, 0]} opacity={0.35} scale={6} blur={2.2} far={3.5} />
                    <OrbitControls
                        enableZoom={false}
                        enablePan={false}
                        target={[0, 0.15, 0]}
                        minPolarAngle={Math.PI / 2.6}
                        maxPolarAngle={Math.PI / 1.85}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
}

useGLTF.preload('/src/assets/Avatar/model.glb');
