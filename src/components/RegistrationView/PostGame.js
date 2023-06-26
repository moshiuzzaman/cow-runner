import { useNavigate } from 'react-router-dom'

const PostGame = () => {
  const navigate = useNavigate()

  const nextHandler = () => {
    navigate('/av?isrestart=true')
  }

  return (
    <div className="display_container">
      <div id="post_game_animation">
        <div className="mobile_container">
          <div className="post_game_next_button_container">
            <img
              onClick={nextHandler}
              className="post_game_next_button button_style"
              width="70"
              height="70"
              src="/images/tryAgain.png"
              alt="restart--v1"
            />

          </div>
          <img
            className="post_game_background"
            src="./images/postgame.jpg"
            alt=""
          />
        </div>
      </div>
    </div>
  )
}

export default PostGame
