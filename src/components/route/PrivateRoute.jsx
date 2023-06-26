import { Navigate } from 'react-router-dom'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { API } from '../../utilities/constants'
import { useDispatch } from 'react-redux'
import { setAdminUsername } from '../../features/adminUsernameSlice'

const PrivateRoute = ({ children, location }) => {

  const [dataReady, setDataReady] = useState(false)
  const [auth, setAuth] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!dataReady) {
      axios
        .get(`${API}/admins`)
        .then((res) => {
          dispatch(setAdminUsername(res.data.username))
          setAuth(true)
          setDataReady(true)
        })
        .catch((err) => {
          setAuth(false)
          setDataReady(true)
        })
    }

    // eslint-disable-next-line
  }, [dataReady])

  if (dataReady)
    return auth ? children : <Navigate to="/admin/login" state={location} />
  else return null
}

export default PrivateRoute
