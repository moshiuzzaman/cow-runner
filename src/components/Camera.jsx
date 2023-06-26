import React, {Component } from "react";
import * as Facemesh from "@mediapipe/face_mesh";
import { FaceMesh } from '@mediapipe/face_mesh'
import * as cam from "@mediapipe/camera_utils";
import * as draw from "@mediapipe/drawing_utils";
import Webcam from "react-webcam";
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation'
import background from '../images/background.jpg'
import background2 from '../images/background2.gif'
import blue_button from '../images/blue_button.png'
import blue_sunglass from '../images/blue_sunglass.png'
import green_button from '../images/green_button.png'
import green_sunglass from '../images/green_sunglass.png'
import pink_button from '../images/pink_button.png'
import pink_sunglass from '../images/pink_sunglass.png'
import screenshot from '../images/screenshot.png'
import 'gifler'
import { Button } from "react-bootstrap";
import { Navigate } from "react-router-dom";
import Constant from './Constant'
let faceMesh=null;
let selfieSegmentation = null
let animate_background=false;
export class Camera extends Component {
    data = [
        { button: blue_button, sunglass: blue_sunglass, color: '#304FFE' },
        { button: green_button, sunglass: green_sunglass, color: '#03A9F4' },
        { button: pink_button, sunglass: pink_sunglass, color: '#9C27B0' },
      ]
    constructor(){
        super();
        this.webcamRef = React.createRef();
        this.image = React.createRef();
        this.canvasRef = React.createRef();
        this.connect = window.drawConnectors;
        this.camera = null;
        this.footerHeight =0
        this.width = window.innerHeight + 160 - this.footerHeight
        this.height = this.width - 160
        this.state = {
            data: this.data,
            current_sunglass: this.data[0].sunglass,
            current_color: this.data[0].color,
          }
        this.canvasCtx=null
        this.canvasElement=null
    }
   
    CreateImages = () => {
        if (!this.sunglass) {
          this.sunglass = new Image()
        }
    
        this.sunglass.src = this.state.current_sunglass
        this.sunglass.style.display = 'none'
        document.body.appendChild(this.sunglass)
        console.log('current2:' + this.state.current_sunglass)
    }
    
    componentDidMount(){
        this.canvasElement = this.canvasRef.current;
        this.canvasElement.width=this.width;
        this.canvasElement.height=this.height;
        this.canvasCtx = this.canvasElement.getContext("2d");
        this.CreateImages();
        

        selfieSegmentation = new SelfieSegmentation({
            locateFile: (file) => {
              return `${process.env.PUBLIC_URL}/@mediapipe/selfie_segmentation/${file}`
            },
          })
          selfieSegmentation.setOptions({
            modelSelection: 1,
            selfieMode: true,
            effect: 'mask',
          })
        selfieSegmentation.onResults(this.SelfieSegmentationResult)

        

        this.backgroundImage = new Image()
        this.backgroundImage.src = background
        this.backgroundImage.style.display = 'none'
        document.body.appendChild(this.backgroundImage)


        if (
        typeof this.webcamRef.current !== "undefined" &&
        this.webcamRef.current !== null
        ) {
            this.camera = new cam.Camera(this.webcamRef.current.video, {
                onFrame: async () => {
                    if(!this.webcamRef.current) return;
                    await selfieSegmentation.send({ image: this.webcamRef.current.video })
                },
                width: 640,
                height: 480,
            });
            this.camera.start();
        }
        if(animate_background){
            let anim
            let canvas = document.createElement('canvas')
            canvas.width = this.width
            canvas.height = this.height
            window.gifler(background2).get((a) => {
              anim = a
              anim.animateInCanvas(canvas)
              anim.onDrawFrame = (ctx, frame) => {
                //ctx.drawImage(frame.buffer,0,0, canvas.width , canvas.height )
                this.backgroundImage=frame.buffer;
              }
            })
          }
    }
   
    
    SelfieSegmentationResult = (results) => {
       
        if(!this.webcamRef.current) return;
       
        this.canvasCtx.save();
        this.canvasCtx.clearRect(0, 0, this.width, this.height);
        
        const canvasCtx = this.canvasCtx;

        canvasCtx.globalCompositeOperation = 'source-over'
        canvasCtx.drawImage(
          results.segmentationMask,
          0,
          0,
          this.width,
          this.height
        )
        canvasCtx.globalCompositeOperation = 'source-out'
        canvasCtx.drawImage(
          this.backgroundImage,
          0,
          0,
          this.width,
          this.height
        )
        canvasCtx.restore()
      }

    


      render() {
        let footerHeight = this.footerHeight;
        let width =this.width;
        let height =this.height;
        let documentWidth = window.innerWidth
        console.log("test");

        return (
          <>
            <div className="center-column" style={{ overflow: 'hidden' }}>
              <div
                className="center-column"
                style={{
                  width: documentWidth,
                  height: height,
                }}
              >
                <div
                  style={{
                    width: width,
                    height: height,
                    position: 'relative',
                  }}
                >
                  <Webcam
                    ref={this.webcamRef}
                    mirrored
                    style={{
                      position: 'absolute',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      left: 0,
                      right: 0,
                      textAlign: 'center',
                      zindex: 9,
                      width: width,
                      height: height,
                    }}
                  />{' '}
                  <canvas
                    ref={this.canvasRef}
                    className="output_canvas"
                    style={{
                      //display:"none",
                      position: 'absolute',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      left: 0,
                      right: 0,
                      textAlign: 'center',
                      zindex: 9,
                      width: width,
                      height: height,
                    }}
                  ></canvas>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    style={{ backgroundColor: '#115293',position:`${Constant.IsMobile()?"fixed":"absolute"}`,bottom:"10px",right:"10px",color:"white",padding:"5px 15px 5px 15px" }}
                    onClick={() => {
                      window.location.href="/launch";
                    }}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </>
        )
      }
}

export default Camera
