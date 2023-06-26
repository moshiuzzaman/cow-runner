import '../../css/game.css'
import RoadImg from './gameAssets/Road-new.png'
import fakeRoadBR from './gameAssets/breaker-new.png'
import RoadBR from './gameAssets/jtiBreaker-new.png'
import Gamecamel from './cowImg/05-min.png'
import gamePlane from './gameAssets/jtiPlane-new.png'
import bangladeshImg from './gameAssets/bangladesh.png'
import { useState } from 'react'

const Game = () => {
  return (
    <div id="Gamemain">
      <div id="gameToutorial"></div>
      <div id="Gamegroup">
        <img id="Gameroad" src={RoadImg} alt="" />
        <img id="Gamebr" src={RoadBR} alt="" />
        <img id="gamePlane" src={gamePlane} alt="" />
      </div>

      <div id="fakeRoadBreaker">
        <img id="fakeGamebr" src={fakeRoadBR} alt="" />
      </div>

      <div id="bangladeshImage">
        <img id="GameBangladeshImage" src={bangladeshImg} alt="" />
      </div>
      <div id="camelImg">
        <img
          className="center"
          id="Gamecamel"
          src={Gamecamel}
          alt=""
          style={{
            bottom: '80px',
          }}
        />
      </div>
    </div>
  )
}

export default Game
