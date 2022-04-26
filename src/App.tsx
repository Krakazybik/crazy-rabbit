import React, {useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import {Circle, Layer, Rect, Stage, Image, Sprite} from "react-konva";
import useImage from 'use-image';
import "gifler";
import {createEvent, createStore, restore, sample} from 'effector';
import {useStore} from "effector-react";
import {delay, interval} from 'patronum';

const animations = {
    idle: [0 ,1, 2, 3, 4, 5].reduce((frames, cur) => [...frames, ...[69* cur, 0, 69, 44]], [] as number[]),
    run:  [0 ,1, 2, 3, 4, 5].reduce((frames, cur) => [...frames, ...[69 * cur, 44, 69, 44]], [] as number[]),
};



const game = {
    scale: {
        x: 3,
        y: 3,
    },
}

const level = {
    bottom: (window.innerHeight / game.scale.y) ,
}

const player = {
    pos: {
        x: 160,
        y: window.innerHeight / game.scale.y
    }
}

const $playerPosition = createStore({x: player.pos.x, y: player.pos.y})

const jumpEvent = createEvent<number>();
const jumpHeight = createStore<number>(10);
const maxHeight = createStore<number>(0);



const startJump = createEvent<number>();
const stopJump = createEvent()


const { tick: jumpTick, isRunning: isJump } = interval({
    timeout: 60,
    start: startJump,
    stop: stopJump,
});

const $banJump = createStore(true).reset(stopJump);

sample({
    clock:delay({source: stopJump, timeout: 1000}),
    fn: () => false,
    target: $banJump,
})



sample({
    clock: jumpEvent,
    source: isJump,
    filter: (isJump) => {
      return !isJump;
    },
    fn: (_, height) => height,
    target: [jumpHeight, startJump],
})


sample({
    clock: jumpEvent,
    fn: (height) => Math.pow(height,2 ),
    target: maxHeight
})

sample({
    clock: jumpTick,
    source: jumpHeight,
    fn: (height) => height - 1,
    target: jumpHeight
});

sample({
    source: $playerPosition,
    filter: (pos) => pos.y > level.bottom,
    fn: () => ({x: player.pos.x, y: player.pos.y}),
    target: [stopJump, $playerPosition]
})

sample({
    clock: jumpTick,
    source: {pos: $playerPosition, height: jumpHeight, maxHeight},
    filter: ({pos}: any) => pos.y <= level.bottom,
    fn: ({pos, height, maxHeight}: any) => {
        const newPos = {
            x: pos.x,
            y: level.bottom - (-Math.pow(height, 2) + maxHeight)
        }
        return newPos
    },
    target: $playerPosition,
})




function App() {
    const [warrior] = useImage('sprites/warrior.png');
    const ref: any = React.useRef(null);
    const playerPosition = useStore($playerPosition)

    React.useEffect(() => {
        if(ref.current) {
            ref.current.focus();
        }
    } , [ref])

  return (

      <div ref={ref} tabIndex={1} onKeyPress={() => jumpEvent(10)}>
          <Stage width={window.innerWidth} height={window.innerHeight}>
            <Layer on  scale={{x: 2, y: 2}} >
                <Sprite
                    ref={(node => {if(node && !node.isRunning()) node.start()})}
                    animation={'run'}
                    animations={animations}
                    image={warrior as HTMLImageElement}
                    x={playerPosition.x} y={playerPosition.y}
                    frameRate={15}
                    frameIndex={0}/>
            </Layer>
          </Stage></div>


  );
}

export default App;
