import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "./ui/button";
import { useEffect, useState } from "react"
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { LOGIN_ROUTE, SIGNUP_ROUTE } from "@/utils/constants";
import { useNavigate } from "react-router";
import { useAppStore } from "@/store";



function Auth() {
    const navigate = useNavigate();
    const {setUserInfo} = useAppStore();
    const [email , setEmail] = useState("");
    const [password , setPassword] = useState("");
    const [confirmPassword , setConfirmPassword] = useState("");

    const validateSignup = ()=>{
        if(!email.length){
            toast.error("Email is required");
            return false;
        }
        if(!password.length){
            toast.error("Password is reuired");
            return false;
        }

        if(password !== confirmPassword){
            toast.error(`Password and Confirm Password should be same , ${password} ${confirmPassword}`)  
            return false;
        }

        return true;
    }

    const ValidateLogin = ()=>{
        if(!email.length){
            toast.error("Email is required");
            return false;
        }
        if(!password.length){
            toast.error("Password is required");
            return false;
        }
        return true;
    }
    
    const handleLogin = async ()=>{
        try{
            if(ValidateLogin()){
                const response = await apiClient.post(LOGIN_ROUTE , {email , password} , {withCredentials : true});
                console.log(response.status);
                if(response.status === 200){
                    setUserInfo(response.data.user);
                    if(response.data.user.profileSetup) navigate("/chat");
                    else navigate("/profile");
                }
            }
        }catch(error){
            if(error.response){
                toast.error(`${error.response.data.msg}`)
            }else{
                toast.error("Our servers are currently unavailable. Please try again in a few minutes.");
            }
            setEmail("");
            setPassword("");
        }
        
    }

    const handleSignup = async ()=>{
        if(validateSignup()){
            const response = await apiClient.post(SIGNUP_ROUTE , {email , password} , {withCredentials : true});
            if(response.status === 201){
                console.log(response.data);
                setUserInfo(response.data.user);
                navigate("/profile");
            }
        }
    }

  return (
    <div className = "w-screen h-screen flex justify-center items-center">
        <div className="h-[80%] w-[80%] md:w-[60%] lg:w-[40%] shadow-2xl border-2 border-white bg-white flex justify-center rounded-3xl ">
            <div className="flex flex-col gap-10 justify-center items-center w-full">

                <div className="flex justify-center items-center flex-col gap-1">
                    <div className="flex justify-center items-center">
                        <h1 className = "text-5xl font-bold md:text-6xl">Welcome</h1>
                    </div>
                    <p className="font-light text-center">Chat with your friends anytime anywhere</p>
                </div>

                <div className="flex justify-center items-center w-full">
                    <Tabs defaultValue="login" className="w-3/4">
                        <TabsList className = "w-full rounded-none bg-transparent">
                            <TabsTrigger value="login"
                            className="data-[state=active]:bg-transparent data-[state=active]:text-black
                             data-[state=active]:font-semibold data-[state=active]:border-b-black p-3 text-black transition-all duration-300 rounded-none w-full border-b-2">Login</TabsTrigger>
                            <TabsTrigger value="signup" className="data-[state=active]:bg-transparent data-[state=active]:text-black
                             data-[state=active]:font-semibold data-[state=active]:border-b-black p-3 text-black transition-all duration-300 rounded-none w-full border-b-2">Signup</TabsTrigger>
                        </TabsList>
                        <TabsContent value="login" className = "mt-5 flex flex-col gap-5">

                            <Input type="email" placeholder="Email" value = {email} onChange = {(e) => {setEmail(e.target.value)}} className="rounded-none p-3"></Input>
                            <Input type="password" placeholder="Password" value = {password} onChange = {(e) => {setPassword(e.target.value)}} className="rounded-none p-3"></Input>

                            <Button className= "rounded-none" onClick = {handleLogin}>Submit</Button>

                        </TabsContent>
                        <TabsContent value="signup" className = "mt-5 flex flex-col gap-5">

                            <Input type="email" placeholder="Email" value = {email} onChange = {(e) => {setEmail(e.target.value)}} className="rounded-none p-3"></Input>
                            <Input type="password" placeholder="Password" value = {password} onChange = {(e) => {setPassword(e.target.value)}} className="rounded-none p-3"></Input>
                            <Input type="password" placeholder="Confirm Password" value = {confirmPassword} onChange = {(e) => {setConfirmPassword(e.target.value)}} className="rounded-none p-3"></Input>

                            <Button className = "rounded-none" onClick = {handleSignup} >Submit</Button>

                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    </div>
  )
}
export default Auth