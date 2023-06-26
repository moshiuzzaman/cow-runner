import { useContext } from 'react';
import { Navigate } from 'react-router-dom'
import { getCookie } from './../../utilities/CustomFunction';
import { RegisterContext } from './../../App';

const PrivateRouteForUser = ({ children, location }) => {
  let name=getCookie('userName')
  const [registerUser,setRegisterUser]=useContext(RegisterContext)

    return name!==''||registerUser.name!=='' ? children : <Navigate to="/" state={location} />
 
}

export default PrivateRouteForUser
