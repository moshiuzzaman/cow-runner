import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

const AVPage = () => {
  const [videoURL, setVideoURL] = useState()
  useEffect(() => {
    let search = window.location.search
    let params = new URLSearchParams(search)
    let isnextButton = params.get('isrestart')
    if (isnextButton) {
      setCloseButton(true)
    }
  }, [])

  useEffect(() => {
    async function setAV() {
      setVideoURL('cow.mp4')
    }

    setAV()
  }, [])
  useEffect(() => {
    let video = document.getElementById('video')
    video.addEventListener('ended', (event) => {
      console.log('end')
      video.play()
      video.loop = false
      handleCloseVisibility()
    })
  }, [])

  const { state } = useLocation()
  const navigate = useNavigate()
  const [showPlay, setShowPlay] = useState(true)
  const [closeButton, setCloseButton] = useState(false)

  const handleCloseVisibility = () => {
    navigate('/pre-game', { state })
    setCloseButton(true)
  }

  const handlePlay = () => {
    document.getElementById('video').play()
    setShowPlay(false)
  }
  const handleClose = () => {
    setShowPlay(true)
    navigate('/pre-game', { state })
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div className="display_container">
        <div className="mobile_container">
          {!showPlay && (
            <div
              className="nextButton"
              onClick={() => handleClose()}
              style={{
                position: 'absolute',
                top: 55,
                right: 15,
                cursor: 'pointer',
                zIndex: 100,
              }}
            >
              <img
                width="64"
                height="64"
                src="https://img.icons8.com/flat-round/64/play--v1.png"
                alt="play--v1"
              />
            </div>
          )}
          <div id="custom_seekbar_section"></div>
          <video
            className="av_card_forVideo videosize"
            id="video"
            playsInline
            loop={false}
            onEnded={() => console.log('Video ended')}
            controls
            disablePictureInPicture
            controlsList="nofullscreen nodownload noremoteplayback noplaybackrate nopictureinpicture"
          >
            {videoURL && <source src={`avs/${videoURL}`} type="video/mp4" />}

            {/* <source src={`avs/AVDemo.mp4`} type="video/mp4" /> */}
          </video>
        </div>
        {showPlay && (
          <div
            onClick={() => handlePlay()}
            style={{
              position: 'absolute',
              cursor: 'pointer',
            }}
          >
            <img className="button_style" src="./images/start.png" alt="" />
          </div>
        )}
      </div>
    </div>
  )
}

export default AVPage
