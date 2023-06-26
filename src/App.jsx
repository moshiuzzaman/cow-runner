import { createContext, useState } from 'react'
// import ReactGA from 'react-ga'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import NotFound from './components/404'
import LoadingBar from './components/LoadingBar'
import TrialFunctionComponent from './components/TrialFunctionComponent'
import PostGame from './components/RegistrationView/PostGame'
import PreGame from './components/RegistrationView/PreGame';
import AVPage from './components/RegistrationView/AvPage'


export const RegisterContext = createContext()

function App() {
 
  const [showLoadingBar, SetLoadingBarState] = useState(false)
 

  const ShowLoadingBar = (show) => {
    SetLoadingBarState(show)
  }

  return (
    <>
     
        <BrowserRouter>
          <Routes>

            <Route
              path="/pre-game"
              element={
                  <PreGame />
              }
            />
            <Route
              path="/post-game"
              element={
                  <PostGame />
              }
            />

            <Route
              path="/av"
              exact
              element={
                // <PrivateRouteForUser location="/av">
                  <AVPage />
                // </PrivateRouteForUser>
              }
            />
             <Route
              path="/"
              exact
              element={
                // <PrivateRouteForUser location="/av">
                  <AVPage />
                // </PrivateRouteForUser>
              }
            />


            <Route
              path="/trial"
              exact
              element={
                  <TrialFunctionComponent location="/trial"
                    ShowLoadingBar={ShowLoadingBar}
                  ></TrialFunctionComponent>
              }
            />
            <Route path="*" exact element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      {showLoadingBar && <LoadingBar></LoadingBar>}
    </>
  )
}

export default App
