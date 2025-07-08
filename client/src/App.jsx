import {BrowserRouter , Routes , Route, Navigate} from "react-router"
import Chat from "./components/Chat.jsx"
import Auth from "./components/Auth.jsx"
import Profile from "./components/Profile.jsx"
import { useAppStore } from "./store/index.js"
import { useEffect, useState } from "react"
import { apiClient } from "./lib/api-client.js"
import { GET_USER_INFO_ROUTE } from "./utils/constants.js"


const PrivateRoute = ({children}) =>{
    const {userInfo} = useAppStore();
    const isAuth = !!userInfo;
    return isAuth ? children : <Navigate to = "/auth"/>
}

const AuthRoute = ({children}) => {
    const {userInfo} = useAppStore();
    const isAuth = !!userInfo;
    return isAuth ? <Navigate to = "/chat"/> : children
}


function App() {

    const {userInfo , setUserInfo} = useAppStore();
    const [loading , setLoading] = useState(true);

    useEffect(()=>{
        const getUserInfo = async ()=>{
            try{
                const response = await apiClient.get(GET_USER_INFO_ROUTE , {withCredentials : true})
                if(response.status === 200){
                    setUserInfo(response.data.user)
                }else{
                    setUserInfo(undefined)
                }
            }catch(e){
                setUserInfo(undefined);
            }finally{
                setLoading(false);
            }
        }

        if(!userInfo){
            getUserInfo();
        }else{
            setLoading(false); 
        }
    },[userInfo , setUserInfo])

  if(loading){
    return <div>loading...</div>
  }

  return (
    <BrowserRouter>
        <Routes>
            <Route path = "/chat" element = {<PrivateRoute><Chat/></PrivateRoute>}></Route>
            <Route path = "/auth" element = {<AuthRoute><Auth/></AuthRoute>}></Route>
            <Route path = "/profile" element = {<PrivateRoute><Profile/></PrivateRoute>}></Route>
            <Route path = "/*" element = {<Navigate to = "/auth" replace/>}></Route>
        </Routes>   
    </BrowserRouter>
  )
}
export default App