import { getColor } from "@/lib/utils";
import { useAppStore } from "@/store"
import { HOST } from "@/utils/constants";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";

const ContactsList = ({contacts , isChannel = false}) => {

    const {
        selectedChatType,
        selectedChatData,
        setSelectedChatType,
        setSelectedChatData,
        setSelectedChatMessages,
    } = useAppStore();

    const handleClick = (contact) =>{
        if(isChannel) setSelectedChatType("channel");
        else setSelectedChatType("contact");
        
        setSelectedChatData(contact);

        if(selectedChatData && selectedChatData._id != contact._id){
            setSelectedChatMessages([])
        }
    };
  return (
    <div className ="mt-5">
        { contacts && 
            contacts.map((contact) => (
                <div key = {contact._id} className = {`
                pl-10 py-2 transition-all duration-300 cursor-pointer 
                ${selectedChatData && (selectedChatData._id == contact._id)
                    ? "bg-[#8417ff] hover:bg-[#6a00cc]"
                    : "hover:bg-[#f1f1f111]"
                }`}
                    onClick = {() => handleClick(contact)}
                >
                    <div className = "flex gap-5 items-center justify-start text-neutral-300">
                        {
                            !isChannel && <div className="flex items-center gap-3">
                                <div className="h-10 w-10 relative rounded-full overflow-hidden ">
                                    <Avatar >
                                        {contact.imageURL ? (<AvatarImage 
                                                src={`${HOST}/${contact.imageURL}`} 
                                                alt="profile picture" 
                                                className = "object-cover w-full h-full bg-black "/>)
                                            : (<div className={` ${getColor(contact.colorTheme)} 
                                                    uppercase h-10 w-10 text-2xl font-bold
                                                    border-[3px] flex items-center justify-center rounded-full`}> 
                                                {contact.firstName ? contact.firstName.split("").shift() 
                                                                    : contact.email.split("").shift()}
                                            </div>)}    
                                    </Avatar>
                                </div>
                            </div>
                        }
                        {
                            isChannel && (<div className = "h-10 w-10 flex items-center justify-center bg-[#ffffff22] rounded-full" >
                                #
                            </div>)
                        }
                        {isChannel ? (
                                <span>{contact.name}</span>
                            ) : (<span>{contact.firstName} {contact.lastName}</span>
                        )}
                    </div>
                </div>
            ))
        }
    </div>
  )
}
export default ContactsList