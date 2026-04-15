import React, { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box } from '@react-three/drei';
import * as THREE from 'three';
import jsPDF from 'jspdf';

const BarChart3D = ({ data, isLargeDataset }) => {
  const groupRef = useRef(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.02;
    }
  });

  const { bars, maxValue } = useMemo(() => {
    let values = data?.datasets?.[0]?.data || [12, 19, 3, 5];
    let labels = data?.labels || ['Q1', 'Q2', 'Q3', 'Q4'];

    if (values.length > 20) {
      const sampleRate = Math.ceil(values.length / 20);
      values = values.filter((_, index) => index % sampleRate === 0);
      labels = labels.filter((_, index) => index % sampleRate === 0);
    }
    const maxValue = Math.max(...values, 1);
    
    return { 
      bars: values.map((value, index) => {
        const x = (index - labels.length / 2) * (isLargeDataset ? 1.5 : 2.5);
        const height = Math.max((value / maxValue) * 6, 0.2);
        const hue = 0.6 - (index / labels.length) * 0.4;
        return {
          position: [x, height / 2, 0],
          height,
          color: new THREE.Color().setHSL(hue, 0.8, 0.6),
          value,
          label: labels[index],
          index
        };
      }), 
      maxValue 
    };
  }, [data, isLargeDataset]);

  return (
    <group ref={groupRef}>
      {bars.map((bar) => (
        <group key={bar.index} position={bar.position}>
          <Box args={[isLargeDataset ? 1.2 : 1.8, bar.height, isLargeDataset ? 1.2 : 1.8]}>
            <meshStandardMaterial color={bar.color} roughness={0.3} metalness={0.1}/>
          </Box>
          <Text position={[0, bar.height / 2 + 0.5, 0]} fontSize={isLargeDataset ? 0.25 : 0.35} color="#ffffff" anchorX="center">
            {bar.value.toLocaleString()}
          </Text>
          <Text position={[0, -bar.height / 2 - 0.8, 0]} fontSize={isLargeDataset ? 0.2 : 0.25} color="#cccccc" anchorX="center" maxWidth={isLargeDataset ? 1.5 : 2}>
            {bar.label.length > 8 ? bar.label.substring(0, 6) + '...' : bar.label}
          </Text>
        </group>
      ))}
      <gridHelper args={[Math.max(bars.length * 2, 10), 10, '#333333', '#222222']} position={[0, -0.1, 0]} />
    </group>
  );
};

// FIX: Wrapped component in forwardRef to receive a ref from the parent.
const Chart3D = forwardRef(({ data }, ref) => {
  const isLargeDataset = data?.labels?.length > 20;
  
  // This sub-component allows us to use the useThree hook to get the WebGL renderer
  const ThreeScene = () => {
    const { gl, scene, camera } = useThree();
    
    // FIX: Exposed a 'download' function to the parent component via the ref.
    useImperativeHandle(ref, () => ({
      download: (format, fileName) => {
        // This ensures the capture happens after the frame is rendered.
        gl.render(scene, camera);
        const imgData = gl.domElement.toDataURL('image/png');

        if (format === 'png') {
          const link = document.createElement('a');
          link.download = `${fileName}.png`;
          link.href = imgData;
          link.click();
        } else if (format === 'pdf') {
          const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
          const imgWidth = 280;
          const imgHeight = (gl.domElement.height * imgWidth) / gl.domElement.width;
          pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
          pdf.save(`${fileName}.pdf`);
        }
      }
    }), [gl, scene, camera]); // Dependencies ensure the function has the latest context
    
    return <BarChart3D data={data} isLargeDataset={isLargeDataset} />;
  };

  return (
    <div className="w-full h-96 bg-gradient-to-b from-gray-900 to-black rounded-lg overflow-hidden relative border border-gray-700">
      <Canvas 
        gl={{ preserveDrawingBuffer: true, antialias: true }} // preserveDrawingBuffer is crucial for capturing
        camera={{ position: [12, 8, 12], fov: 50 }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={0.8} castShadow />
        <pointLight position={[-10, 5, -10]} intensity={0.3} color="#4f46e5" />
        <pointLight position={[10, 5, 10]} intensity={0.3} color="#06b6d4" />
        <ThreeScene />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} maxDistance={25} minDistance={5} maxPolarAngle={Math.PI / 2.2} enableDamping={true} dampingFactor={0.05}/>
      </Canvas>
    </div>
  );
});

export default Chart3D;
