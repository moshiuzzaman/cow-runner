import React, {Component } from "react";
import * as Facemesh from "@mediapipe/face_mesh";
import { FaceMesh } from '@mediapipe/face_mesh'
//import * as Holistic from "@mediapipe/holistic";
import * as cam from "@mediapipe/camera_utils";
import * as draw from "@mediapipe/drawing_utils";
import Webcam from "react-webcam";
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation'
import background from '../images/background.png'
import background2 from '../images/background2.gif'
import blue_button from '../images/blue_button.png'
import blue_sunglass from '../images/blue_sunglass.png'
import green_button from '../images/green_button.png'
import green_sunglass from '../images/green_sunglass.png'
import pink_button from '../images/pink_button.png'
import pink_sunglass from '../images/pink_sunglass.png'
import screenshot from '../images/screenshot.png'
import 'gifler'
import Constant from "./Constant";
import { ThreeSixty } from "@material-ui/icons";
var faceMesh=null;
var selfieSegmentation = null
var animate_background=false;
export class Test extends Component {
    data = [
        { button: blue_button, sunglass: blue_sunglass, color: '#304FFE' },
        { button: green_button, sunglass: green_sunglass, color: '#03A9F4' },
        { button: pink_button, sunglass: pink_sunglass, color: '#9C27B0' },
      ]
    constructor(props){
        super();
        this.webcamRef = React.createRef();
        this.image = React.createRef();
        this.canvasRef = React.createRef();
        this.connect = window.drawConnectors;
        this.camera = null;
        this.footerHeight = 50
        this.aspect=12/16;
        this.height=window.innerHeight-50
        this.width =window.innerWidth<window.innerHeight?window.innerWidth:this.height*this.aspect //window.innerHeight + 160 - this.footerHeight
        this.state = {
            data: this.data,
            current_sunglass: this.data[0].sunglass,
            current_color: this.data[0].color,
            capturedImage:null
          }
        this.canvasCtx=null
        this.canvasElement=null
        this.loadFaceMask=false;
        this.modelLoaded=false;
       
    }
    ChangeSunglass = (index) => {
        var btn_temp = this.state.data[index]
        if (btn_temp == this.state.data[1]) {
          return
        }
        var color = this.state.data[1].color
        this.state.data[index] = this.state.data[1]
        this.state.data[1] = btn_temp
        this.setState(
          {
            data: this.state.data,
            current_sunglass: this.state.data[1].sunglass,
            current_color: color,
          },
          () => {
            this.CreateImages()
          }
        )
      }
      TakeScreenshot = () => {
        const canvasElement1 = this.canvasRef.current
        var canvas = document.createElement('canvas')
        canvas.height = canvasElement1.height
        canvas.width = canvasElement1.width
        var context = canvas.getContext('2d')
    
        var videoCanvas = document.createElement('canvas')
        videoCanvas.height = canvasElement1.height
        videoCanvas.width = canvasElement1.width
        var videoContext = videoCanvas.getContext('2d')
        videoContext.translate(canvasElement1.width, 0)
        videoContext.scale(-1, 1)
        videoContext.drawImage(
          this.webcamRef.current.video,
          0,
          0,
          canvas.width,
          canvas.height
        )
        console.log("video",this.webcamRef.current.video);
        context.drawImage(videoCanvas, 0, 0, canvas.width, canvas.height)
        // context.drawImage(canvasElement1, 0, 0, canvas.width, canvas.height)
        this.exportCanvasAsPNG(canvas, 'screenshot')
      }
      exportCanvasAsPNG = (canvas, fileName) => {
        var canvasElement = canvas
    
        var MIME_TYPE = 'image/png'
    
        var imgURL = canvasElement.toDataURL(MIME_TYPE, 1)
        var dlLink = document.createElement('a')
        dlLink.download = fileName
        dlLink.href = imgURL
        dlLink.dataset.downloadurl = [MIME_TYPE, dlLink.download, dlLink.href].join(
          ':'
        )
    
        document.body.appendChild(dlLink)
        dlLink.click()
        document.body.removeChild(dlLink)
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
       

        selfieSegmentation = new SelfieSegmentation({
            locateFile: (file) => {
              return `${process.env.PUBLIC_URL}/@mediapipe/selfie_segmentation/${file}`
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
                return `${process.env.PUBLIC_URL}/@mediapipe/face_mesh/${file}`;
            },
        });

        faceMesh.setOptions({
            modelComplexity: 1,
            selfieMode: true,
            maxNumFaces: 1,
            smoothLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        faceMesh.onResults(this.FaceMeshResult);

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
                    console.log("Video Height:",this.webcamRef.current.video.videoHeight);
                    console.log("cavas Height:",this.height);
                    this.setState({capturedImage:this.webcamRef.current.getScreenshot()});
                    //await selfieSegmentation.send({ image: this.webcamRef.current.video })
                    if(!this.webcamRef.current) return;
                    //await faceMesh.send({ image: this.webcamRef.current.video })
                },
            });
           
            this.camera.start();
        }
        if(animate_background){
            let anim
            var canvas = document.createElement('canvas')
            canvas.width = 800
            canvas.height = 800
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
    FaceMeshResult=(results)=>{
        

        // this.canvasCtx.save();
        // this.canvasCtx.clearRect(0, 0, this.width, this.height);
        // const video = webcamRef.current.video;
        const canvasElement=document.createElement("canvas");
        canvasElement.width=this.width;
        canvasElement.height=this.height;
        const canvasCtx=canvasElement.getContext("2d");
        
        canvasCtx.beginPath();
        if (results.multiFaceLandmarks) {
            
            
            for (const landmarks of results.multiFaceLandmarks) {
                break;
                this.connect(canvasCtx, landmarks,Facemesh.FACEMESH_TESSELATION, {
                    color: "#C0C0C070",
                    lineWidth: 1,
                });
                this.connect(canvasCtx, landmarks,Facemesh.FACEMESH_RIGHT_EYE, {
                    color: "#FF3030",
                });
                this.connect(canvasCtx, landmarks,Facemesh.FACEMESH_RIGHT_EYEBROW, {
                    color: "#FF3030",
                });
                this.connect(canvasCtx, landmarks,Facemesh.FACEMESH_LEFT_EYE, {
                    color: "#30FF30",
                });
                this.connect(canvasCtx, landmarks,Facemesh.FACEMESH_LEFT_EYEBROW, {
                    color: "#30FF30",
                });
                this.connect(canvasCtx, landmarks,Facemesh.FACEMESH_FACE_OVAL, {
                    color: "#E0E0E0",
                });
                this.connect(canvasCtx, landmarks,Facemesh.FACEMESH_LIPS, {
                    color: "#E0E0E0",
                });
            }

            var mylandmarks = results.multiFaceLandmarks[0]
            if (mylandmarks && mylandmarks.length >= 130) {
                var width =
                Math.abs(mylandmarks[162].x - mylandmarks[389].x) *
                this.width
              var height =
                Math.abs(mylandmarks[101].y - mylandmarks[105].y) *
                this.height

              var posX = mylandmarks[8].x* this.width;
              var posY = mylandmarks[8].y* this.height;
             
              var rotation =(mylandmarks[389].y - mylandmarks[162].y) * this.height * .4
              canvasCtx.translate(
                posX,
                posY
              )
              canvasCtx.rotate((rotation * Math.PI) / 180)
              canvasCtx.drawImage(this.sunglass,-width/2,-5, width, height)
              //canvasCtx.fillStyle ="#30FF307F";
              //canvasCtx.fillRect(0,0, 5,5)

              this.canvasCtx.drawImage(canvasElement,0,0,this.width,this.height);
              
            }
            this.loadFaceMask=true;
        }
        else{

        }
        this.canvasCtx.restore();
    }
    
    SelfieSegmentationResult = (results) => {
        
        if(!this.webcamRef.current||!this.loadFaceMask) return;
        if(!this.modelLoaded)
        {
          this.props.ShowLoadingBar(false);
          this.modelLoaded=true;
        }
        this.canvasCtx.save();
        this.canvasCtx.clearRect(0, 0, this.width, this.height);
        const canvasCtx = this.canvasCtx;
       // canvasCtx.globalCompositeOperation = 'source-over'
        // canvasCtx.save()
        // canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height)
        canvasCtx.drawImage(
          results.segmentationMask,
          0,
          0,
          this.width,
          this.height
        )
        var activeEffect = 'mask2'
        if (activeEffect === 'mask' || activeEffect === 'both') {
          canvasCtx.globalCompositeOperation = 'source-in';
          // This can be a color or a texture or whatever...
          canvasCtx.fillStyle = '#00FF007F';
          canvasCtx.fillRect(0, 0, this.width, this.height);
        } else {
          canvasCtx.globalCompositeOperation = 'source-out';
          canvasCtx.fillStyle = '#0000FF7F';
          canvasCtx.fillRect(0, 0, this.width, this.height);
        }
    
        // Only overwrite missing pixels.
        canvasCtx.globalCompositeOperation = 'destination-atop';
        //canvasCtx.drawImage(results.image, 0, 0, this.width, this.height);
        // if (activeEffect === 'mask' || activeEffect === 'both') {
        //   canvasCtx.globalCompositeOperation = 'source-in'
        //   // This can be a color or a texture or whatever...
        //   canvasCtx.fillStyle = '#00FF007F'
        //   canvasCtx.fillRect(0, 0, this.width, this.height)
        // } else {
        //   canvasCtx.globalCompositeOperation = 'source-out'
        //   canvasCtx.fillStyle = '#00FF007F';//this.state.current_color
        //   canvasCtx.fillRect(0, 0, this.width, this.height)
          // canvasCtx.drawImage(
          //   this.backgroundImage,
          //   0,
          //   0,
          //   this.width,
          //   this.height
          // )

          // canvasCtx.globalCompositeOperation = 'source-over'
          // //this.canvasCtx.drawImage(canvasElement,4,4,this.width+8,this.height+8);
          // var canvas2 = document.createElement("canvas");
          // canvas2.height = this.height
          // canvas2.width = this.width
          // var canvasCtx2 = canvas2.getContext('2d')
          // canvasCtx2.drawImage(
          //   results.segmentationMask,
          //   -30,
          //   -30,
          //   canvas2.width + 60,
          //   canvas2.height + 60
          // )
          // canvasCtx2.globalCompositeOperation = 'source-out'
          // canvasCtx2.fillStyle = this.state.current_color
          // canvasCtx2.fillRect(0, 0, canvas2.width, canvas2.height)
    
         
          //this.drawOuttline2(results.segmentationMask,canvas2);
          // canvasCtx2.globalCompositeOperation = 'destination-out'
          // canvasCtx2.drawImage(
          //   results.segmentationMask,
          //   0,
          //   0,
          //   canvas2.width,
          //   canvas2.height
          // )
          //this.canvasCtx.drawImage(canvas2,0,0,this.width,this.height);
          canvasCtx.restore()
        }
       

      drawOuttline2=(img,canvas)=>{

      

        var ctx = canvas.getContext('2d');

        var w = canvas.width;

        var h = canvas.height;

        canvas.width = w;

        canvas.height = h;

        var canvas2 = document.createElement("canvas");
        canvas2.height = this.height
        canvas2.width = this.width
        var canvasCtx2 = canvas2.getContext('2d')
        canvasCtx2.drawImage(img, 0, 0, w, h);

        var pathPoints =window.MarchingSquares.getBlobOutlinePoints(canvas2);

        var points = [];

        for(var i = 0;i < pathPoints.length;i += 10){

          points.push({

            x:pathPoints[i],

            y:pathPoints[i + 1],

          })

        }

        // ctx.clearRect(0, 0, w, h);

        ctx.beginPath();

        ctx.lineWidth = 20;

        ctx.strokeStyle = '#00CCFF';

        ctx.moveTo(points[0].x, points[0].y);

        for (var i = 1; i < points.length; i += 10) {

          var point = points[i];

          ctx.lineTo(point.x,point.y);

        }

        ctx.closePath();

        ctx.stroke();
        ctx.drawImage(canvas,0,0);

    }
    


      render() {
        var footerHeight = this.footerHeight;
        var width =this.width;
        var height =this.height;
        var documentWidth = window.innerWidth
        console.log("height:"+height);
        return (
          <>
            <Webcam
            ref={this.webcamRef}
            screenshotFormat="image/png"
            forceScreenshotSourceSize="true"
            videoConstraints={{facingMode: 'user',width:this.width,height:this.height}}
            width={this.width}
            height={this.height}
            mirrored
            style={{
                left: 0,
                right: 0,
                textAlign: 'center',
                zindex: 9,
            }}
            />
            {this.state.capturedImage&&<img src={this.state.capturedImage}></img>}
          </>
        )
      }
}

export default Test
