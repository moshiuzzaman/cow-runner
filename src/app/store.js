import { configureStore } from '@reduxjs/toolkit'
import adminUsernameSlice from '../features/adminUsernameSlice'
import divisionSlice from '../features/divisionSlice'
import dobSlice from '../features/dobSlice'
import infoSlice from '../features/infoSlice'
import otpSentSlice from '../features/otpSentSlice'

export const store = configureStore({
  reducer: {
    dob: dobSlice,
    info: infoSlice,
    otpSent: otpSentSlice,
    division: divisionSlice,
    adminUsername: adminUsernameSlice,
  },
})
