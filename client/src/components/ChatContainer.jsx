import ChatHeader from "./ChatHeader"
import MessageBar from "./messageBar"
import MessageContainer from "./messageContainer"

function ChatContainer() {
  return (
    <div className = "fixed top-0 flex flex-col h-[100vh] w-[100vw] md:static md:flex-1 bg-[#1c1d25]  ">
        <ChatHeader/>
        <MessageContainer/>
        <MessageBar/>
    </div>
  )
}
export default ChatContainer