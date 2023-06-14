import "./visualisation.css";
import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { TextureLoader } from 'three/src/loaders/TextureLoader';
import { AnimationMixer } from 'three'; // Importez AnimationMixer depuis 'three'
import Slider from '@material-ui/core/Slider';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';

import {
  Environment,
  OrbitControls,
  Html,
  useProgress
} from "@react-three/drei";

function Loader() {
  const { active, progress, errors, item, loaded, total } = useProgress();
  return <Html center>{progress} % loaded</Html>;
}

function Visualisation() {

  const [sliderValue, setSliderValue] = useState(0); // État local pour stocker la valeur du slider
  const [showTextures, setShowTextures] = useState(true);
  const [showOpac, setOpac] = useState(true);
  const [showLine, setLine] = useState(true);
  const [textures, setTextures] = useState([]);
  const [gltf, setGltf] = useState(useLoader(GLTFLoader,"./guerite/Guerite_txt.gltf"));
  

  const handleSliderChange = (event, newValue) => {
    setSliderValue(newValue); // Met à jour la valeur du slider lorsque celle-ci change
  };

 
  var lambo_gltf = "./lamborghini-centenario-z_dawan/scene.gltf"; // pour test slider

  var guerite_txt_gltf = "./guerite/Guerite_txt.gltf";
  var guerite_gltf = "./guerite/Guerite.gltf";



  const Model = () => {
    const gltf_txt = useLoader(GLTFLoader,guerite_txt_gltf);
    const gltf_no_txt = useLoader(GLTFLoader,guerite_gltf);
    
    const mixer = useRef(null);

    useEffect(() => {
        if (!showTextures) {
          setGltf(gltf_no_txt);
        } else {
          setGltf(gltf_txt);
        }
        if (gltf.animations && gltf.animations.length > 0) {
          mixer.current = new AnimationMixer(gltf.scene);
      
          gltf.animations.forEach((animation) => {
            const action = mixer.current.clipAction(animation);
            action.play();
            action.paused = true; // Pause the animation
            action.time = animation.duration * (sliderValue/100); 
          });
        }
        
        const textureLoader = new TextureLoader();
        const loadedTextures = [];
        gltf.scene.traverse((node) => {
          if (node.isMesh) {
            node.material.transparent = true; // Rendre les matériaux transparents 
            node.material.visible = true; // Rendre les matériaux invisibles

            const material = node.material;

            if (material.map) {
              const texture = textureLoader.load(material.map);
              loadedTextures.push(texture);
              console.log(texture);
            }
            setTextures(loadedTextures);

            if (!showOpac) {
              node.material.opacity = 0.5;
            } else {
              node.material.opacity = 1;
            }
            if (!showLine) {
              node.material.wireframe = true;
            } else {
              node.material.wireframe = false;
            }
          }
        });

      }, [gltf, showTextures, showOpac, sliderValue]);
      

    useFrame((_, delta) => {
      if (mixer.current) {
        mixer.current.update(delta);
      }
    });

    return (
      <>
        <primitive object={gltf.scene} scale={1} />
      </>
    );
  };

  return (
    <div className="container">
      <Canvas>
        <Suspense fallback={<Loader />}>
          <Model />
          <OrbitControls />
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <pointLight position={[-10, -10, -10]} />
        </Suspense>
      </Canvas>
      <div className="slider-container">
        <Box display="flex" justifyContent="center" alignItems="center" height="50px">
          <Slider 
            defaultValue={0} 
            color="secondary" style={{ width: '300px' }} 
            onChange={handleSliderChange}
          />
          <ButtonGroup
          >
            <Button
              value="showTextures"
              selected={showTextures}
              onClick={() => setShowTextures(!showTextures)}
            >
              Afficher Textures
            </Button>
            <Button
              value="showOpac"
              selected={showOpac}
              onClick={() => setOpac(!showOpac)}
            >
              Activer opacity
            </Button>
            <Button
              value="showLine"
              selected={showLine}
              onClick={() => setLine(!showLine)}
            >
              Afficher les lignes
            </Button>
          </ButtonGroup>
        </Box>
      </div>
    </div>
  );
}

export default Visualisation;