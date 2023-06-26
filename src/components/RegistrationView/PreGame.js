import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const PreGame = () => {
  const navigate = useNavigate()
  const nextHandler = () => {
    navigate('/trial')
  }

  useEffect(() => {}, [])

  return (
    <div className="display_container">
      <div className="mobile_container">
        <div className="pre_game_next_button_container">
          <img onClick={nextHandler}
            className="pre_game_next_button"
            src="./images/khelaHobe.png"
            alt=""
          />
        </div>
        <img
          className="pre_game_background"
          src="./images/preGame.png"
          alt=""
        />
      </div>
    </div>
  )
}

export default PreGame
