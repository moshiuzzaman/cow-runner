




const RestartGame = () => {

  const backHandler = () => {
    // restartGame()
  }

  const nextHandler = () => {}

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="restart__wrapper">
        <div>
          <div className="restart__card">
            <>
              <div className="restart__info">
                {/* Welcome page */}

                <div
                  className="info__welcome font-face-camel"
                >
                  <h3 className="restart_title-one">আবার খেলুন </h3>
                  {/* <h3 className="restart_title-two">need to go further!</h3> */}
                </div>
              </div>
              <div className="button__wrapper restart__button__wrapper">
                <div id='restart_game__button' className="restart_button">
                <img className="button_style"  onClick={backHandler} src="./images/tryAgain.png" alt=""/>
                </div>
              </div>
            </>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RestartGame
