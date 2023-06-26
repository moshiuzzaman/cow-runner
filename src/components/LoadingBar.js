import background from './Game/gameAssets/bg.png'
import '../css/loadingbar.css'
const LoadingBar = () => {
  return (
    <div id="spinerFullWidth"
    style={{
      backgroundImage: `url(${background})`,
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
    }}>
      <div className="center" id="spinersection">
        <div class="loader">
          <div class="l_dot"></div>
          <div class="l_dot"></div>
          <div class="l_dot"></div>
          <div class="l_dot"></div>
          <div class="l_dot"></div>
        </div>
      </div>
    </div>
  )
}

export default LoadingBar
