import React from 'react';
import logo from './logo.svg';
import './App.css';
import {Circle, Layer, Rect, Stage, Image} from "react-konva";
import useImage from 'use-image';


function App() {
    const [rabbitImage] = useImage('assets/rabbit.svg');
  return (
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          <Rect width={50} height={50} fill="red" />
          <Circle x={200} y={200} stroke="black" radius={50} />
            <Image image={rabbitImage}/>
        </Layer>
      </Stage>
  );
}

export default App;
