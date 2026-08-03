import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Component, type ErrorInfo, type ReactNode, useRef } from "react";
import type { Group } from "three";

const MODEL_PATH = "/models/server-rack.glb";

interface RackModelProps {
  pointer: { x: number; y: number };
}

function RackModel({ pointer }: RackModelProps) {
  const { scene } = useGLTF(MODEL_PATH);
  const model = useRef<Group>(null);
  const baseRotationY = Math.PI;

  useFrame((_, delta) => {
    if (!model.current) return;

    const targetY = baseRotationY + pointer.x * 0.12;
    const targetX = pointer.y * 0.07;
    model.current.rotation.y +=
      (targetY - model.current.rotation.y) * Math.min(delta * 4, 1);
    model.current.rotation.x +=
      (targetX - model.current.rotation.x) * Math.min(delta * 4, 1);
  });

  return (
    <group
      ref={model}
      position={[0, 0.5, 0]}
      rotation={[0, baseRotationY, 0]}
      scale={1.2}
    >
      <primitive object={scene} />
    </group>
  );
}

class RackErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("Server rack model failed to load", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="server-rack-load-error"
          data-rack-load-error
          aria-hidden="true"
        />
      );
    }
    return this.props.children;
  }
}

export default function ServerRackScene() {
  const pointer = useRef({ x: 0, y: 0 });

  return (
    <div
      className="server-rack-canvas"
      aria-hidden="true"
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        pointer.current.x =
          ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
        pointer.current.y =
          ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
      }}
      onPointerLeave={() => {
        pointer.current.x = 0;
        pointer.current.y = 0;
      }}
    >
      <Canvas
        camera={{ position: [2.6, 1.2, 4.2], fov: 30 }}
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight
          color="#8587e8"
          intensity={2.2}
          position={[2.5, 3.5, 4]}
        />
        <directionalLight
          color="#f1eee7"
          intensity={1.1}
          position={[-2, 1, -2]}
        />
        <RackErrorBoundary>
          <RackModel pointer={pointer.current} />
        </RackErrorBoundary>
      </Canvas>
    </div>
  );
}

useGLTF.preload(MODEL_PATH);
