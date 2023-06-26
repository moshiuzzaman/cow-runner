import React, { Component, Suspense, useRef, useEffect } from 'react'
import { FaceMesh } from '@mediapipe/face_mesh'
import * as cam from '@mediapipe/camera_utils'
import Webcam from 'react-webcam'
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation'
import background from './Game/gameAssets/bg.png'
import { Confetti, Callconfetti } from './Game/Confetti.js'
import 'gifler'
import { Canvas } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import Gamecamel1 from './Game/cowImg/01-min.png'
import Gamecamel2 from './Game/cowImg/02-min.png'
import Gamecamel3 from './Game/cowImg/03-min.png'
import Gamecamel4 from './Game/cowImg/04-min.png'
import Gamecamel5 from './Game/cowImg/05-min.png'
import Gamecamel6 from './Game/cowImg/06-min.png'

import Glass from './Game/gameAssets/nglass.glb'
import Head3D from './Game/gameAssets/head.glb'
import Hdr from './Game/gameAssets/hdr.hdr'
import videoMusic from './Game/gameAssets/Music-JTI.mp3'
import SFXSound from './Game/gameAssets/toon.mp3'
import Game from './Game/Game'
import PostGame from './RegistrationView/PostGame'
import RestartGame from './Game/RestartGame'
import * as THREE from 'three'
import { GameInstruction } from './Game/GameInstruction'
let faceMesh = null
let selfieSegmentation = null
export class TrialFunctionComponent extends Component {
  constructor(props) {
    super(props)

    if (window.innerWidth < window.innerHeight) {
      this.aspect = 1080 / 720
      this.width = window.innerWidth //window.innerHeight + 160 - this.footerHeight
      this.height = window.innerHeight //*this.aspect
    } else {
      this.aspect = 18 / 19
      this.height = window.innerHeight
      this.width = window.innerHeight * this.aspect //window.innerHeight + 160 - this.footerHeight
    }

    this.headHeight = 0
    this.state = {
      connect: window.drawConnectors,
      camera: null,
      glassGroup: null,
      headphoneGroup: null,
      headGroup: null,
      path: Glass,
      headPath: Head3D,
      hdrPath: Hdr,
      deviceType: null,
      canvasRef: React.createRef(),

      canvasRef2: React.createRef(),
      webcamRef: React.createRef(),
      RoadImgPos: -200,
      fakeRoadBr: -50,
      roadStop: 8550,
      fakeRoadBrPause: '',
      // RoadImgPos: -200,
      // roadStop: 3980,
      camelStop: 80,
      roadSpeed: 8,
      camelImgPos: 80,
      capturedImage: null,
      modelLoaded: false,
      isConfetti: false,

      scale: [1, 1, 1],
      position: [-10, 0, 0],
      model_active: true,
      showPreview: false,
      canvas: null,
      canvasCtx: null,
      canvasElement: null,
      loadFaceMask: false,
      crashedGame: false,
      coundown: true,
      sayCamelTime: 0,
    }
    // this.state.roadStop=9770-window.innerWidth
    if (window.innerWidth > 600) {
      this.state.roadSpeed = 7
    }
    if (window.innerWidth > 300) {
      this.state.roadStop = this.state.roadStop - (window.innerWidth - 300) / 2
      this.state.camelStop =
        this.state.camelStop + (window.innerWidth - 250) / 2
    }

    props.ShowLoadingBar(true)

    useGLTF.preload(this.state.path)
    useGLTF.preload(this.state.headPath)
  }

  componentDidMount() {
    let search = window.location.search
    let params = new URLSearchParams(search)
    let deviceType = params.get('device')
    this.state.deviceType = deviceType

    this.state.canvasElement = this.state.canvasRef.current
    this.state.canvasElement.width = this.width
    this.state.canvasElement.height = this.height
    this.state.canvasCtx = this.state.canvasElement.getContext('2d')
    selfieSegmentation = new SelfieSegmentation({
      locateFile: (file) => {
        console.log(file)
        if (window.filePath[1][file]) return window.filePath[1][file]
        return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`
      },
    })
    selfieSegmentation.setOptions({
      modelSelection: 0,
      selfieMode: true,
      effect: 'mask',
    })
    selfieSegmentation.onResults(this.SelfieSegmentationResult)

    faceMesh = new FaceMesh({
      locateFile: (file) => {
        if (window.filePath[0][file]) return window.filePath[0][file]
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      },
    })

    faceMesh.setOptions({
      modelComplexity: 1,
      selfieMode: true,
      maxNumFaces: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })

    faceMesh.onResults(this.FaceMeshResult)

    if (
      typeof this.state.webcamRef.current !== 'undefined' &&
      this.state.webcamRef.current !== null
    ) {
      this.state.camera = new cam.Camera(this.state.webcamRef.current.video, {
        onFrame: async () => {
          if (!this.state.webcamRef.current) return
          await selfieSegmentation.send({
            image: this.state.webcamRef.current.video,
          })
          if (!this.state.webcamRef.current) return
          await faceMesh.send({ image: this.state.webcamRef.current.video })
        },
      })

      this.state.camera.start()
    }
  }

  camelanimation = 15
  gameSoundDiv = document.getElementById('gameSoundVideo')
  camelbottomLen = false
  confettiStart = () => {
    if (!this.state.isConfetti) {
      Callconfetti()
      this.setState({ isConfetti: true })
      Confetti.start()
    }
  }
  confettiStop = () => {
    if (this.state.isConfetti) {
      Confetti.remove()
    }
  }
  countdownAnimation = (animateType, animateType2, iscountdown) => {
    let counterDiv = document.getElementsByClassName('count_number')
    let gomanimationDiv = document.getElementsByClassName('count_number_Go')
    counterDiv[0].style.animation = animateType
    counterDiv[1].style.animation = animateType
    counterDiv[2].style.animation = animateType
    gomanimationDiv[0].style.animation = animateType2
    counterDiv[0].style.animationDelay = '0s'
    counterDiv[1].style.animationDelay = '1s'
    counterDiv[2].style.animationDelay = '2s'
    gomanimationDiv[0].style.animationDelay = '3s'

    this.state.coundown = iscountdown
  }

  coundown = () => {
    // create SFX
    const SFXvid = document.createElement('audio')
    SFXvid.id = 'sfxaudio'
    SFXvid.src = SFXSound
    document.getElementById('main_canvas').appendChild(SFXvid)

    setTimeout(() => {
      this.countdownAnimation('none', false)
    }, 5000)
  }
  sfxaudioPlay = () => {
    let sfxaudio = document.getElementById('sfxaudio')
    sfxaudio.pause()
    sfxaudio.currentTime = 0
    sfxaudio.play()
  }
  tutorialStep = 0
  isShowGameTutorial = false
  gameTutorialShowPos = -500
  isToutorialShow = () => {
    let tutorialText = [
      `
      <h3 class="tutorial__title-one">প্রতিবার</h3>
      <h1 class="tutorial__title-two">"COW"</h1>
      <h3 class="tutorial__title-one">বললেই রাস্তার লেন পরিবর্তন হয়ে যাবে!</h3>
      `,
      '',
      `
       <h3 class="tutorial__title-one">পুনরায়</h3>
       <h1 class="tutorial__title-two">"COW"</h1>
       <h3 class="tutorial__title-one">বললেই রাস্তার লেন পরিবর্তন হয়ে যাবে!</h3>
      `,
      '',
      ` 
      <h3 class="tutorial__title-one">প্রতিবার লাল রং এর বাধা দেখলেই</h3>
      <h1 class="tutorial__title-two">"COW"</h1>
      <h3 class="tutorial__title-one">বলুন এবং রাস্তার লেন পরিবর্তন করে সামনে এগিয়ে যান!</h3>
      `,
      '',
    ]

    // let tutorialText=[
    //       `
    //       <h3 class="tutorial__title-one">SAY</h3>
    //       <h1 class="tutorial__title-two">CAMEL</h1>
    //       <h3 class="tutorial__title-one">TO CHANGE THE LANE</h3>
    //       `,'',`
    //        <h3 class="tutorial__title-one">SAY</h3>
    //       <h1 class="tutorial__title-two">CAMEL</h1>
    //       <h3 class="tutorial__title-one">AGAIN TO CHANGE THE LANE</h3>
    //       `,"",`
    //        <h3 class="tutorial__title-one">SAY</h3>
    //       <h1 class="tutorial__title-two">CAMEL</h1>
    //       <h3 class="tutorial__title-one">TO AVOID BLOCKER</h3>
    //       `,""
    //     ]

    console.log(this.tutorialStep)

    document.getElementById('tutorialText').innerHTML =
      tutorialText[this.tutorialStep]
    if (this.tutorialStep === 4) {
      document.getElementById('fakeRoadBreaker').style.display = 'block'
      document.getElementById('fakeGamebr').style.animation =
        'animation-breaker .3s infinite alternate'
    } else if (this.tutorialStep === 5) {
      document.getElementById('fakeGamebr').style.animation = 'none'
    }
    if (this.RoadImgPos > 3450) {
      this.gameTutorialShowPos = 0
    } else {
      this.gameTutorialShowPos =
        this.state.RoadImgPos -
        (this.tutorialStep >= 3 ? window.innerWidth - 250 : 300)
    }
    this.isShowGameTutorial = !this.isShowGameTutorial
    this.tutorialStep += 1

    if (this.tutorialStep === 6) {
      this.state.RoadImgPos = -4000
    }
  }
  animatedCamel = () => {
    let getCamelImg = document.getElementById('Gamecamel')
    let getRoadBrImg = document.getElementById('Gamebr')
    let issayTimeperfect = true
    issayTimeperfect =
      this.state.RoadImgPos - this.state.sayCamelTime <
      -this.state.roadSpeed * 8
    this.state.sayCamelTime = this.state.RoadImgPos
    if (this.tutorialStep === 4) {
      issayTimeperfect = false
    }
    if (!this.state.crashedGame && !this.state.coundown && issayTimeperfect) {
      this.sfxaudioPlay()
      if (this.camelbottomLen) {
        getCamelImg.style.width = '112px'
        getCamelImg.style.bottom = '80px'
        this.camelbottomLen = !this.camelbottomLen
        getRoadBrImg.style.zIndex = 3
        getCamelImg.style.zIndex = 2
      } else {
        this.camelbottomLen = !this.camelbottomLen
        getCamelImg.style.width = '157px'
        getCamelImg.style.bottom = '32px'
        getRoadBrImg.style.zIndex = 2
        getCamelImg.style.zIndex = 3
      }
    }
    if (this.isShowGameTutorial) {
      this.isToutorialShow()
    }
  }
  camelImageChange = () => {
    if (this.camelanimation === 1) {
      document.getElementById('Gamecamel').src = Gamecamel1
    } else if (this.camelanimation === 4) {
      document.getElementById('Gamecamel').src = Gamecamel2
    } else if (this.camelanimation === 7) {
      document.getElementById('Gamecamel').src = Gamecamel3
    } else if (this.camelanimation === 10) {
      document.getElementById('Gamecamel').src = Gamecamel4
    } else if (this.camelanimation === 13) {
      document.getElementById('Gamecamel').src = Gamecamel5
    } else if (this.camelanimation === 16) {
      document.getElementById('Gamecamel').src = Gamecamel6
    } else if (this.camelanimation === 18) {
      this.camelanimation = 0
    }
    if (
      !this.state.coundown &&
      !this.state.crashedGame &&
      this.tutorialStep !== 5
    ) {
      this.camelanimation++
    }
  }
  RestartGame = () => {
    this.state.isConfetti = false
    Callconfetti()
    // this.countdownAnimation('count_animate 4s linear','count_animate1 6s linear', true)
    document.getElementById('GameBangladeshImage').style.scale = 0
    let getCamelImg = document.getElementById('Gamecamel')
    getCamelImg.style.left = '115px'
    this.state.camelImgPos = 80

    let restart_game_div = document.getElementById('restart_game')
    restart_game_div.style.display = 'none'
    let gamesec = document.getElementById('gamesec')
    gamesec.style.display = 'block'
    let postGame = document.getElementById('postGame')
    postGame.style.display = 'none'
    this.state.RoadImgPos = -4600
    document.getElementById('Gamegroup').style.left =
      this.state.RoadImgPos + 'px'
    this.state.crashedGame = false
    this.camelanimation = 1
    this.gameSoundDiv.pause()
    this.gameSoundDiv.play()
    document.getElementById('fakeRoadBreaker').style.display = `none`
  }
  fakeRoadBreakerAnimation = () => {
    this.state.fakeRoadBr += this.state.roadSpeed
    document.getElementById('fakeRoadBreaker').style.right =
      this.state.fakeRoadBr + 'px'
  }

  tutorialMode = (RoadImg) => {
    if (
      this.state.RoadImgPos > -4000 &&
      (this.tutorialStep < 5 || this.tutorialStep > 5)
    ) {
      this.state.RoadImgPos -= this.state.roadSpeed
      RoadImg.style.left = this.state.RoadImgPos + 'px'
      if (this.tutorialStep >= 4) {
        if (document.getElementById('Gamecamel').style.bottom === '80px') {
          document.getElementById('fakeGamebr').style.width = '90px'
          document.getElementById('fakeRoadBreaker').style.bottom = '155px'
          this.state.fakeRoadBrPause = 'top'
        } else {
          document.getElementById('fakeRoadBreaker').style.zIndex = 88
          this.state.fakeRoadBrPause = 'bottom'
        }
        this.fakeRoadBreakerAnimation()
      }
    } else if (this.tutorialStep < 5) {
      this.state.RoadImgPos = 0
    }
    if (
      this.state.RoadImgPos >= this.gameTutorialShowPos &&
      this.state.RoadImgPos <= this.gameTutorialShowPos + 15 &&
      !this.isShowGameTutorial
    ) {
      this.isToutorialShow(1, true)
    }
  }
  realGameMode = (RoadImg, getCamelImg, getRoadBrImg) => {
    if (this.state.RoadImgPos > -this.state.roadStop) {
      if (!this.state.crashedGame) {
        this.state.RoadImgPos -= this.state.roadSpeed
        RoadImg.style.left = this.state.RoadImgPos + 'px'
      }
    } else if (this.state.camelImgPos <= this.state.camelStop) {
      this.state.camelImgPos += this.state.roadSpeed
      getCamelImg.style.left = this.state.camelImgPos + 'px'
    } else {
      this.confettiStart()

      if (window.innerWidth >= 900) {
        document.getElementById('GameBangladeshImage').style.scale = 1.5
      } else {
        document.getElementById('GameBangladeshImage').style.scale = 1.3
      }
      document.getElementById('GameBangladeshImage').animate(
        {
          transform: 'scale(1.3)',
        },
        2000
      )
      this.state.crashedGame = true
      this.state.RoadImgPos -= 5
      if (this.state.RoadImgPos < -8900) {
        this.confettiStop()
        let gamesec = document.getElementById('gamesec')
        gamesec.style.display = 'none'
        let postGame = document.getElementById('postGame')
        postGame.style.display = 'block'
        document.getElementById('post_game_animation').animate(
          {
            transform: 'scale(1)',
          },
          2000
        )
        this.gameSoundDiv.pause()
        this.gameSoundDiv.currentTime = 0
      }
    }

    let restart_game_div = document.getElementById('restart_game')
    let firstBreaker = 5285
    let firstBreakerEnd = 5270 + 125
    if (
      ((this.state.RoadImgPos <= -firstBreaker &&
        this.state.RoadImgPos >= -firstBreakerEnd) ||
        (this.state.RoadImgPos <= -(firstBreaker + 1345) &&
          this.state.RoadImgPos >= -(firstBreakerEnd + 1345)) ||
        (this.state.RoadImgPos <= -(2575 + firstBreaker) &&
          this.state.RoadImgPos >= -(firstBreakerEnd + 2575)) ||
        (this.state.RoadImgPos <= -4170 &&
          this.state.RoadImgPos >= -(4170 + 135) &&
          this.state.fakeRoadBrPause === 'top')) &&
      getCamelImg.style.bottom === '80px'
    ) {
      restart_game_div.style.display = 'block'
      this.state.crashedGame = true
    }
    if (
      ((this.state.RoadImgPos <= -(firstBreaker + 655) &&
        this.state.RoadImgPos >= -(firstBreaker + 655) - 180) ||
        (this.state.RoadImgPos <= -(firstBreaker + 2045) &&
          this.state.RoadImgPos >= -(firstBreaker + 2045) - 180) ||
        (this.state.RoadImgPos <= -4155 &&
          this.state.RoadImgPos >= -4155 - 180 &&
          this.state.fakeRoadBrPause === 'bottom')) &&
      getCamelImg.style.bottom === '32px'
    ) {
      // getRoadBrImg.style.zIndex = 3
      // getCamelImg.style.zIndex = 2
      this.state.crashedGame = true
      restart_game_div.style.display = 'block'
    }
    if (
      this.state.fakeRoadBr < window.innerWidth + 900 &&
      !this.state.crashedGame
    ) {
      this.fakeRoadBreakerAnimation()
    }
  }

  gameanimation = () => {
    let RoadImg = document.getElementById('Gamegroup')
    let getCamelImg = document.getElementById('Gamecamel')
    let getRoadBrImg = document.getElementById('Gamebr')
    this.tutorialStep > 5
      ? this.realGameMode(RoadImg, getCamelImg, getRoadBrImg)
      : this.tutorialMode(RoadImg, getCamelImg, getRoadBrImg)
  }
  ismouth = false

  startcountdown = 0
  startGame = () => {
    if (!this.state.coundown) {
      this.gameanimation()
    }
    if (this.startcountdown === 0) {
      this.coundown()
      this.startcountdown = 1
    }
    this.camelImageChange()
    document
      .getElementById('restart_game__button')
      .addEventListener('click', () => {
        this.RestartGame()
      })
  }
  fakemusic = () => {
    // Create the root video element
    let video = document.createElement('video')
    video.setAttribute('loop', '')
    // Add some styles if needed
    video.setAttribute('style', 'position: fixed;')

    video.setAttribute('id', 'fakevideo')
    // A helper to add sources to video
    function addSourceToVideo(element, type, dataURI) {
      let source = document.createElement('source')
      source.src = dataURI
      source.type = 'video/' + type
      element.appendChild(source)
    }

    // A helper to concat base64
    let base64 = function (mimeType, base64) {
      return 'data:' + mimeType + ';base64,' + base64
    }

    // Add Fake sourced
    addSourceToVideo(
      video,
      'webm',
      base64(
        'video/webm',
        'GkXfo0AgQoaBAUL3gQFC8oEEQvOBCEKCQAR3ZWJtQoeBAkKFgQIYU4BnQI0VSalmQCgq17FAAw9CQE2AQAZ3aGFtbXlXQUAGd2hhbW15RIlACECPQAAAAAAAFlSua0AxrkAu14EBY8WBAZyBACK1nEADdW5khkAFVl9WUDglhohAA1ZQOIOBAeBABrCBCLqBCB9DtnVAIueBAKNAHIEAAIAwAQCdASoIAAgAAUAmJaQAA3AA/vz0AAA='
      )
    )
    // addSourceToVideo(video, 'mp4', base64('video/mp4', 'AAAAHGZ0eXBpc29tAAACAGlzb21pc28ybXA0MQAAAAhmcmVlAAAAG21kYXQAAAGzABAHAAABthADAowdbb9/AAAC6W1vb3YAAABsbXZoZAAAAAB8JbCAfCWwgAAAA+gAAAAAAAEAAAEAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIAAAIVdHJhawAAAFx0a2hkAAAAD3wlsIB8JbCAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAQAAAAAAIAAAACAAAAAABsW1kaWEAAAAgbWRoZAAAAAB8JbCAfCWwgAAAA+gAAAAAVcQAAAAAAC1oZGxyAAAAAAAAAAB2aWRlAAAAAAAAAAAAAAAAVmlkZW9IYW5kbGVyAAAAAVxtaW5mAAAAFHZtaGQAAAABAAAAAAAAAAAAAAAkZGluZgAAABxkcmVmAAAAAAAAAAEAAAAMdXJsIAAAAAEAAAEcc3RibAAAALhzdHNkAAAAAAAAAAEAAACobXA0dgAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAIAAgASAAAAEgAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABj//wAAAFJlc2RzAAAAAANEAAEABDwgEQAAAAADDUAAAAAABS0AAAGwAQAAAbWJEwAAAQAAAAEgAMSNiB9FAEQBFGMAAAGyTGF2YzUyLjg3LjQGAQIAAAAYc3R0cwAAAAAAAAABAAAAAQAAAAAAAAAcc3RzYwAAAAAAAAABAAAAAQAAAAEAAAABAAAAFHN0c3oAAAAAAAAAEwAAAAEAAAAUc3RjbwAAAAAAAAABAAAALAAAAGB1ZHRhAAAAWG1ldGEAAAAAAAAAIWhkbHIAAAAAAAAAAG1kaXJhcHBsAAAAAAAAAAAAAAAAK2lsc3QAAAAjqXRvbwAAABtkYXRhAAAAAQAAAABMYXZmNTIuNzguMw==='));

    // Append the video to where ever you need
    document.body.appendChild(video)

    // Start playing video after any user interaction.
    // NOTE: Running video.play() handler without a user action may be blocked by browser.
    let playFn = function () {
      video.play()
      document.body.removeEventListener('touchend', playFn)
    }
    playFn()
  }

  isStart = false
  isStartGame = () => {
    this.setState({ isConfetti: false })
    this.gameSoundDiv = document.getElementById('gameSoundVideo')
    this.gameSoundDiv.pause()
    this.gameSoundDiv.play()
    this.isStart = true
    document.getElementById('gameInstruction_game').style.scale = 0
    document.getElementById('gameInstruction_game').style.zIndex = -333333333
    this.state.coundown = true
    this.countdownAnimation(
      'count_animate 4s linear',
      'count_animate1 6s linear',
      true
    )
    // RoadImgPos: -200,
    // roadStop: 3980,
    this.state.RoadImgPos = 0
    this.fakemusic()
    // this.state.roadStop=4000
  }
  // toutorialmode start from here

  FaceMeshResult = (results) => {
    // start game

    this.isStart && this.startGame()

    const canvasElement = document.createElement('canvas')
    canvasElement.width = this.width
    canvasElement.height = this.height
    const canvasCtx = canvasElement.getContext('2d')

    canvasCtx.beginPath()
    if (results.multiFaceLandmarks) {
      let mylandmarks = results.multiFaceLandmarks[0]

      if (mylandmarks && mylandmarks.length >= 130) {
        let mouthDis = Math.ceil((mylandmarks[14].y - mylandmarks[13].y) * 1000)
        if (!this.ismouth && mouthDis > 13) {
          this.ismouth = true
          this.animatedCamel()
        } else if (this.ismouth && mouthDis < 13) {
          this.ismouth = false
        }
        this.headHeight =
          Math.abs(mylandmarks[152].y - mylandmarks[10].y) * this.height
        let width =
          Math.abs(mylandmarks[162].x - mylandmarks[389].x) * this.width
        let height =
          Math.abs(mylandmarks[101].y - mylandmarks[105].y) * this.height
        let leftNoseToEar =
          Math.abs(mylandmarks[6].x - mylandmarks[127].x) * this.width
        let rightNoseToEar =
          Math.abs(mylandmarks[6].x - mylandmarks[356].x) * this.width
        let noseToEarYDist =
          leftNoseToEar < rightNoseToEar
            ? (mylandmarks[6].y - mylandmarks[356].y) * this.height
            : (mylandmarks[6].y - mylandmarks[127].y) * this.height

        let posX = mylandmarks[8].x * this.width
        let posY = mylandmarks[8].y * this.height

        let rotationZ =
          (mylandmarks[389].y - mylandmarks[162].y) * this.height * 0.22
        let rotationY = (leftNoseToEar - rightNoseToEar) * 0.22
        let rotationX = noseToEarYDist * 0.22
        this.state.canvasCtx.drawImage(
          canvasElement,
          0,
          0,
          this.width,
          this.height
        )
        if (this.state.glassGroup != null) {
          posX = (posX * 2 - this.width) / 100
          posY = (this.height - posY * 2) / 100
          let angleZ = (rotationZ * Math.PI) / 180
          let angleY = (rotationY * Math.PI) / 180
          let angleX = (rotationX * Math.PI) / 180
          this.state.glassGroup.current.position.set(
            posX,
            posY - (height / 200) * 0.5,
            -2
          )

          this.state.headGroup.current.position.set(
            posX,
            posY - (height / 200) * 3,
            -2
          )
          this.state.glassGroup.current.scale.set(width / 200, width / 200, 1.3)

          this.state.headGroup.current.scale.set(
            width / 180,
            this.headHeight / 220,
            1.3
          )
          this.state.headGroup.current.rotation.set(angleX, angleY, -angleZ)
          this.state.glassGroup.current.rotation.set(angleX, angleY, -angleZ)
        }
      }
      this.state.loadFaceMask = true
    } else {
    }
    this.state.canvasCtx.restore()
  }

  SelfieSegmentationResult = (results) => {
    if (!this.state.webcamRef.current || !this.state.loadFaceMask) return
    if (!this.state.modelLoaded) {
      this.height =
        (this.state.webcamRef.current.video.videoHeight /
          this.state.webcamRef.current.video.videoWidth) *
        this.width
      if (this.width < this.height) {
        this.height = window.innerHeight

        this.width =
          (this.state.webcamRef.current.video.videoWidth /
            this.state.webcamRef.current.video.videoHeight) *
          this.height
      }
      this.state.canvasRef.current.width = this.width
      this.state.canvasRef.current.height = this.height
      this.props.ShowLoadingBar(false)
      document.getElementById('fakeRoadBreaker').style.display = 'none'
      this.setState({ modelLoaded: true })
    }
    this.state.canvasCtx.save()
    this.state.canvasCtx.clearRect(0, 0, this.width, this.height)
    const canvasCtx = this.state.canvasCtx
    canvasCtx.globalCompositeOperation = 'source-over'
    canvasCtx.drawImage(results.segmentationMask, 0, 0, this.width, this.height)

    canvasCtx.globalCompositeOperation = 'source-in'
    canvasCtx.drawImage(results.image, 0, 0, this.width, this.height)
    canvasCtx.restore()
  }

  OnModelLoaded = (group2) => {
    this.state.glassGroup = group2
  }

  OnHeadLoaded = (group) => {
    this.state.headGroup = group
  }

  render() {
    let isMobile = this.width < this.height

    let width = this.width
    let documentWidth = window.innerWidth
    let documentHeight = window.innerHeight
    return (
      <>
        <audio id="gameSoundVideo" src={videoMusic} playsInline loop></audio>
        <div
          id="postGame"
          style={{
            display: 'none',
          }}
        >
          <PostGame
            deviceType={this.state.deviceType}
            restart={this.RestartGame}
          />
        </div>
        <div
          id="gamesec"
          style={{
            display: `${this.state.modelLoaded ? 'block' : 'none'}`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div id="restart_game" style={{ display: 'none' }}>
            <RestartGame />
          </div>
          <div id="tutorialsection">
            <div id="tutorialText"></div>
          </div>
          <div id="gameInstruction_game">
            <GameInstruction />
            <div
              onClick={() => this.isStartGame()}
              style={{
                marginTop: '40px',
                cursor: 'pointer',
              }}
            >
              <img className="button_style" src="./images/start.png" alt="" />
            </div>
          </div>

          <div className="column" style={{ overflow: 'hidden' }}>
            <div
              className="center"
              style={{
                backgroundImage: `url(${background})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                width: documentWidth,
                height: documentHeight,
                marginBottom:
                  isMobile && !this.state.showPreview ? '60px' : '0px',
                marginTop:
                  isMobile && !this.state.showPreview ? '-60px' : '0px',
              }}
            >
              <div
                className="center"
                style={{
                  height: '100%',
                  width: width,
                  position: 'relative',
                }}
              >
                <Webcam
                  ref={this.state.webcamRef}
                  screenshotFormat="image/png"
                  forceScreenshotSourceSize="true"
                  videoConstraints={{ facingMode: 'user' }}
                  width={this.width}
                  height={this.height}
                  mirrored
                  style={{
                    textAlign: 'center',
                    zindex: 1,
                    position: 'absolute',
                    display: `${this.state.modelLoaded ? 'none' : 'block'}`,
                  }}
                />

                <div
                  id="main_canvas"
                  style={{
                    width: `${isMobile ? 'unset' : this.width}px`,
                    height: `${isMobile ? 'unset' : this.height}px`,
                    top: `${isMobile ? '60px' : 'unset'}`,
                    left: '0px',
                    bottom: `${isMobile ? '90px' : 'unset'}`,
                    right: '0px',
                    position: 'absolute',
                  }}
                >
                  <div id="game_coundown">
                    <div className="countdown">
                      <div className="count_number">
                        <h2>3</h2>
                      </div>

                      <div className="count_number">
                        <h2>2</h2>
                      </div>

                      <div className="count_number">
                        <h2>1</h2>
                      </div>

                      <div className="count_number_Go ">
                        <h2>GO!</h2>
                      </div>
                    </div>
                  </div>

                  <canvas
                    ref={this.state.canvasRef}
                    height={this.height}
                    style={{
                      textAlign: 'center',
                      position: 'absolute',
                      top: '0px',
                      left: '0px',
                      right: '0px',
                      zindex: 1,
                      display: this.state.showPreview ? 'none' : 'block',
                    }}
                  ></canvas>
                  <Canvas
                    id="3dmodel"
                    ref={this.state.canvasRef2}
                    gl={{ preserveDrawingBuffer: true }}
                    orthographic
                    pixelRatio={window.devicePixelRatio}
                    camera={{
                      zoom: 50,
                      position: [0, 0, 10],
                      near: -1,
                      far: 20,
                      fov: 100,
                    }}
                    style={{
                      width: this.width,
                      height: this.height,
                      position: 'absolute',
                      top: '0px',
                      left: '0px',
                      right: '0px',
                      zIndex: 1,
                      display: this.state.showPreview ? 'none' : 'block',
                    }}
                  >
                    <ambientLight />
                    {/* <directionalLight intensity={0.5} position={[25, 25, 125]}></directionalLight> */}
                    <spotLight
                      intensity={0.5}
                      position={[25, 25, 125]}
                      angle={0.1}
                    />
                    <Suspense fallback={null}>
                      <Head
                        gltfPath={this.state.headPath}
                        OnHeadLoaded={this.OnHeadLoaded}
                        scale={this.state.scale}
                        position={this.state.position}
                        THREE={THREE}
                      />
                      <Model
                        gltfPath={this.state.path}
                        OnModelLoaded={this.OnModelLoaded}
                        scale={this.state.scale}
                        position={this.state.position}
                        THREE={THREE}
                      />
                    </Suspense>
                  </Canvas>
                </div>

                {/* TODO: Convert the foreground from here */}
              </div>
            </div>
            {!this.state.showPreview && (
              <div
                id="gameSection"
                className="column"
                style={{
                  position: 'absolute',
                  bottom: '11px',
                  left: `${isMobile ? '0px' : 'unset'}`,
                  right: `${isMobile ? '0px' : 'unset'}`,
                  zIndex: 2,
                }}
              >
                <div
                  className="column"
                  style={{
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  <Game />
                  <div
                    style={{
                      display: 'none',
                      width: '100%',
                      height: '2px',
                      background: '#1A5B88',
                      marginTop: '10px',
                    }}
                  ></div>
                  <div
                    className="center-horizontal"
                    style={{
                      display: 'none',
                      opacity: 0,
                      width: '100%',
                      margin: '0px',
                      marginTop: '8px',
                    }}
                  ></div>
                  <div
                    className="center"
                    style={{
                      opacity: 0,
                      width: width,
                      height: '70px',
                      marginTop: '0px',
                    }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    )
  }
}

function Model({ ...props }) {
  const group = useRef()
  let THREE = props.THREE
  const { nodes, materials } = useGLTF(props.gltfPath)
  useEffect(() => {
    props.OnModelLoaded(group, nodes, materials)
  }, [materials, nodes, props])
  materials['Material.002'].color = new THREE.Color('rgb(1,27,85)')
  return (
    <group ref={group} {...props} dispose={null}>
      <mesh
        renderOrder={3}
        geometry={nodes.Mesh001.geometry}
        material={materials.Material}
      />
      <mesh
        renderOrder={3}
        geometry={nodes.Mesh001_1.geometry}
        material={materials['Material.002']}
      />
    </group>
  )
}

function Head({ ...props }) {
  const group = useRef()
  const { nodes } = useGLTF(props.gltfPath)
  let materials = nodes.Mesh_Head.material

  materials.colorWrite = false

  useEffect(() => {
    props.OnHeadLoaded(group, nodes, materials)
  }, [materials, nodes, props])
  return (
    <group ref={group} {...props} dispose={null}>
      <mesh
        renderOrder={1}
        geometry={nodes.Mesh_Head.geometry}
        material={materials}
      />
    </group>
  )
}

export default TrialFunctionComponent
