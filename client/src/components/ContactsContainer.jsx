import { apiClient } from "@/lib/api-client";
import NewDM from "./NewDM";
import ProfileInfo from "./ProfileInfo";
import { GET_ALL_CONTACTS_FOR_DM_ROUTE, GET_USER_CHANNELS_ROUTE } from "@/utils/constants";
import { useEffect } from "react";
import { useAppStore } from "@/store";
import { toast } from "sonner";
import ContactsList from "./ContactsList";
import CreateChannel from "./CreateChannel";

function ContactsContainer() {
    const {setDirectMessagesContacts , directMessagesContacts , selectedChatMessages , channels , setChannels} = useAppStore();
    
    useEffect(()=>{
        const getContacts = async () =>{
            try{
                const response = await apiClient.get(GET_ALL_CONTACTS_FOR_DM_ROUTE , {withCredentials : true});
                if(response.data.contacts){
                    setDirectMessagesContacts(response.data.contacts); 
                }            
            }catch(error){
                toast.error("There was an error fetching the recent Contacts")
            }
        }

        const getChannels = async () =>{
            try{
                const response = await apiClient.get(GET_USER_CHANNELS_ROUTE,
                    {withCredentials : true});
                if(response.data.channels){
                    setChannels(response.data.channels);
                }
            }catch(error){
                toast.error("There was an error fetching recent Channels")
            }
        }


        getContacts();
        getChannels();
    },[])


  return (
    <div className = "relative md:w-[35vw] lg:w-[30vw] xl:w-[25vw] border-r-2 border-[#2f3030] bg-[#1b1c24] w-full ">
        <div className="pt-3">
            <Logo/>
        </div>
        <div className="my-5">
            <div className="flex justify-between items-center pr-10">
                <Title text="Direct Messages"></Title>
                <NewDM/>
            </div>
            <div className="max-h-[38vh] overflow-y-auto scrollbar-hidden">
                <ContactsList contacts={directMessagesContacts}/>
            </div>         
        </div>
        <div className="my-5">
            <div className="flex justify-between items-center pr-10">
                <Title text="Channels"></Title>
                <CreateChannel/>
            </div>
            <div className="max-h-[38vh] overflow-y-auto scrollbar-hidden">
                <ContactsList contacts={channels} isChannel = {true}/>
            </div>   
        </div>
        <ProfileInfo/>
    </div>
  )
}

const Title = ({text}) => {
    return(
        <h6 className = "uppercase tracking-widest text-neutral-400 pl-10 font-bold text-opacity-90 text-sm">
            {text}
        </h6>
    )
}


const Logo = () => {
    return (
      <div className="flex p-5  justify-start items-center gap-2">
        <svg
          id="logo-38"
          width="78"
          height="32"
          viewBox="0 0 78 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {" "}
          <path
            d="M55.5 0H77.5L58.5 32H36.5L55.5 0Z"
            className="ccustom"
            fill="#8338ec"
          ></path>{" "}
          <path
            d="M35.5 0H51.5L32.5 32H16.5L35.5 0Z"
            className="ccompli1"
            fill="#975aed"
          ></path>{" "}
          <path
            d="M19.5 0H31.5L12.5 32H0.5L19.5 0Z"
            className="ccompli2"
            fill="#a16ee8"
          ></path>{" "}
        </svg>
        <span className="text-3xl font-semibold ">TalkNest</span>
      </div>
    );
  };

  export default ContactsContainer;