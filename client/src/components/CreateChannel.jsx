import { FaPlus } from "react-icons/fa"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle , DialogHeader} from "./ui/dialog";
import { Input } from "./ui/input";
import { apiClient } from "@/lib/api-client";
import { CREATE_CHANNEL_ROUTE, GET_ALL_CONTACTS_ROUTE, HOST, SEARCH_CONTACTS_ROUTE } from "@/utils/constants";
import { useAppStore } from "@/store";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Button } from "./ui/button";
import MultipleSelector from "./ui/multiSelect";
import { toast } from "sonner";

  

function CreateChannel() {
    const {addChannel} = useAppStore();
    const [newChannelModal , setNewChannelModal] = useState(false);
    const [allContacts, setAllContacts] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [channelName, setChannelName] = useState("");

   

    useEffect(()=>{
        const getData = async ()=>{
            const response = await apiClient.get(GET_ALL_CONTACTS_ROUTE , {withCredentials: true});
            setAllContacts(response.data.contacts);
        }
        getData();
    },[])

   const createChannel = async () =>{
        try{
            if(channelName.length > 0 && selectedContacts.length > 0){
                const response = await apiClient.post(CREATE_CHANNEL_ROUTE ,
                    {   
                        name : channelName , 
                        members : selectedContacts.map((contact) => contact.value),
                    },
                    {withCredentials : true}
                );

                if(response.data.channel){
                    setChannelName("");
                    setAllContacts([]);
                    setNewChannelModal(false);
                    addChannel(response.data.channel);
                }
            }else{
                toast.error("Channel Name or Channel Members are invalid");
            }
        }catch(error){
            toast.error("There was an error creating the channel , Please Try Again Later")
        }
   }

  return (
    <>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <FaPlus className=" text-neutral-400 text-opacity-90
                    font-light text-start cursor-pointer hover:text-neutral-100
                    transition-all duration-300 "
                    onClick={() => setNewChannelModal(true)}
                    />
                </TooltipTrigger>
                <TooltipContent className="bg-[#1c1b1e] border-none text-white p-2 rounded-b-sm">
                    Create New Channel
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
        <Dialog open = {newChannelModal} onOpenChange = {setNewChannelModal} >
            <DialogContent className="bg-[#181920] text-white items-center border-none w-[400px] h-[400px] flex flex-col">
                <DialogDescription className="hidden"/>
                <DialogHeader>
                    <DialogTitle>Select Contacts For New Channel</DialogTitle>
                </DialogHeader>
                <div className="w-full">
                    <Input placeholder="Channel Name" className="rounded-lg p-6 mt-5 border-none bg-[#2c2e3b]"
                    onChange = {(e) => setChannelName(e.target.value)}
                    value = {channelName}/>
                </div>
                <div className="w-full">
                    <MultipleSelector className = "rounded-lg bg-[#2c2e3b] border-none py-2 text-white"
                        defaultOptions = {allContacts}
                        placeholder = "Search Contacts"
                        value = {selectedContacts}
                        onChange = {setSelectedContacts}
                        emptyIndicator = {
                            <p className="text-center text-lg leading-10 text-white/90 bg-[#2c2e3b] ">
                                No Result Found
                            </p>
                        }
                        hidePlaceholderWhenSelected   
                    />
                </div>
                <div className="w-full">
                    <Button className = "w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300" 
                    onClick = {createChannel}>Create Channel</Button>
                </div>
            </DialogContent>
        </Dialog>

    </>
  )
}
export default CreateChannel