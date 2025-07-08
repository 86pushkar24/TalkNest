import { FaPlus } from "react-icons/fa"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle , DialogHeader} from "./ui/dialog";
import { Input } from "./ui/input";
import Lottie from "react-lottie";
import { animationDefaultOptions, getColor } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { HOST, SEARCH_CONTACTS_ROUTE } from "@/utils/constants";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { useAppStore } from "@/store";
import { DialogDescription } from "@radix-ui/react-dialog";

  

function NewDM() {

    const {setSelectedChatType , setSelectedChatData , selectedChatType} = useAppStore()

    const [newContactModal , setNewContactModal] = useState(false);
    const [searchedContacts , setSearchedContacts] = useState([]);

    const searchContact = async (searchTerm) =>{
        try{
            if(searchTerm.length > 0){
                const response = await apiClient.post(SEARCH_CONTACTS_ROUTE , 
                    {searchTerm} ,
                    {withCredentials : true}
                )
                if(response.status === 200 && response.data.contacts){
                    setSearchedContacts(response.data.contacts)
                }
            }else{
                setSearchedContacts([]);
            }
        }catch(error){
            console.log(error);
        }
    }

    const selectNewContact = (contact) =>{
        setNewContactModal(false);
        setSearchedContacts([]);
        setSelectedChatData(contact);
        setSelectedChatType("contact");
    }

  return (
    <>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger>
                    <FaPlus className=" text-neutral-400 text-opacity-90
                    font-light text-start cursor-pointer hover:text-neutral-100
                    transition-all duration-300 "
                    onClick={() => setNewContactModal(true)}
                    />
                </TooltipTrigger>
                <TooltipContent className="bg-[#1c1b1e] border-none text-white p-2 rounded-b-sm">
                   Search New Contacts
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
        <Dialog open = {newContactModal} onOpenChange = {setNewContactModal} >
            <DialogContent className="bg-[#181920] text-white items-center border-none w-[400px] h-[400px] flex flex-col">
                <DialogDescription className="hidden"/>
                <DialogHeader>
                    <DialogTitle>Search or start a New Chat</DialogTitle>
                </DialogHeader>
                <div className="w-full">
                    <Input placeholder="Search a Contact" className="rounded-lg p-6 mt-5 border-none bg-[#2c2e3b]"
                    onChange = {(e) => searchContact(e.target.value)}/>
                </div>
                <div className="overflow-y-scroll w-full">
                    {searchedContacts.length > 0 && (
                    <ScrollArea className="h-[250px] w-full">
                        <div className = "flex flex-col gap-5 ml-5">
                            {searchedContacts.map( (contact) => (
                                <div key = {contact._id}
                                    className="flex gap-3 items-center cursor-pointer"
                                    onClick={() => selectNewContact(contact)}
                                >
                                    <div className="h-12 w-12 relative rounded-full overflow-hidden ">
                                        <Avatar>
                                            {contact.imageURL ? (<AvatarImage 
                                                    src={`${HOST}/${contact.imageURL}`} 
                                                    alt="profile picture"  
                                                    className = "object-cover w-full h-full bg-black "/>)
                                                : (<div className={` ${getColor(contact.colorTheme)} 
                                                        uppercase h-12 w-12 text-2xl font-bold
                                                        border-[3px] flex items-center justify-center rounded-full`}> 
                                                    {contact.firstName ? contact.firstName.split("").shift() 
                                                                        : contact.email.split("").shift()}
                                                </div>)}    
                                        </Avatar>
                                    </div>
                                    <div className="flex flex-col">
                                        <span>
                                        {
                                            contact.firstName && contact.lastName 
                                            ? `${contact.firstName} ${contact.lastName}`
                                            : `${contact.email}`
                                        }
                                        </span>
                                        <span className="text-xs">
                                            {contact.email}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                    )}
                </div>
                {
                    searchedContacts.length <= 0 && (<div className = "mt-5 flex-1 md:flex flex-col justify-center items-start  duration-1000 transition-all ">
                        <div className="text-opacity-80 flex flex-col gap-5 items-center 
                        mt-5 lg:text-2xl text-xl transition-all duration-300 text-center w-full">
                            <h3 className="poppins-medium">
                                Hi<span className="text-purple-500">! </span>
                                Search new 
                                <span className="text-purple-500"> Contact. </span>
                            </h3>
                        </div>
                </div>)
                }
            </DialogContent>
        </Dialog>

    </>
  )
}
export default NewDM