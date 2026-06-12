"use client";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import {
  auth,
  provider
} from "@/firebase";
import ReactMarkdown from "react-markdown";
import jsPDF from "jspdf";
import {
  Share2,
  Pencil,
  Trash2,
  Copy,
  ArrowUp,
  FileDown,
  Paperclip,
  FileText,
  X,
  Pin
} from "lucide-react";
import {
  useState,
  useEffect,
  useRef,
} from "react";
import {
  uploadPDF,
  askQuestion,
  getConversations,
  getConversationMessages,
  createConversation,
  deleteConversation,
  renameConversation,
} from "../services/api";

export default function Home() {
  const chatContainerRef =
useRef<HTMLDivElement>(null);

  const [uploadedFile, setUploadedFile] =
  useState("");

  const [pdfUrl, setPdfUrl] =
  useState("");

  const [uploadingPdf, setUploadingPdf] =
  useState(false);

  const [uploadStage, setUploadStage] =
  useState("");

  const removePdf = () => {
  setUploadedFile("");
  setPdfUrl("");
};

  const [user, setUser] =
  useState<any>(null);

  const [question, setQuestion] =
  useState("");

  const [messages, setMessages] =
  useState<any[]>([]);

  const [loading, setLoading] =
  useState(false);

  const [typingText, setTypingText] =
  useState("");

  const [conversationId, setConversationId] =
  useState<number | null>(null);

  const [conversations, setConversations] =
useState<any[]>([]);

const [menuOpen, setMenuOpen] =
useState<number | null>(null);

const [copied, setCopied] =
useState(false);

const [copiedMessageIndex,
setCopiedMessageIndex] =
useState<number | null>(null);

const [editingId, setEditingId] =
useState<number | null>(null);

const [recentlyUpdatedId,
setRecentlyUpdatedId] =
useState<number | null>(null);

const [expandedSources,
setExpandedSources] =
useState<number | null>(null);

const [editingTitle, setEditingTitle] =
useState("");

const [searchTerm, setSearchTerm] =
  useState("");

  const [pinnedChats, setPinnedChats] =
  useState<number[]>([]);
  useEffect(() => {

  const savedPins =
    localStorage.getItem(
      "pinnedChats"
    );

  if (savedPins) {

    setPinnedChats(
      JSON.parse(savedPins)
    );

  }

}, []);

  const [
  chatToDelete,
  setChatToDelete
] = useState<number | null>(
  null
);


useEffect(() => {

  const unsubscribe =
  onAuthStateChanged(
  auth,
  (currentUser) => {

    setUser(currentUser);

    if (!currentUser) {

      setMessages([]);

      setConversations([]);

      setConversationId( null);

      localStorage.removeItem(
        "conversationId"
      );

    }

  }
);

  return () =>
    unsubscribe();

}, []);

  useEffect(() => {

  if (chatContainerRef.current) {

    chatContainerRef.current.scrollTo({
      top:
        chatContainerRef.current
          .scrollHeight,
      behavior: "smooth",
    });

  }

}, [messages, loading]);

const handleUpload = async (
  selectedFile: File
) => {

  setUploadedFile(
    selectedFile.name
  );

  setUploadingPdf(true);
  setUploadStage(
  "⏳ Extracting text..."
);

  try {
    console.log(
  "UPLOAD STARTED",
  selectedFile.name
);

  if (!conversationId) {

  alert(
    "Create a chat first"
  );

  return;
}
setTimeout(() => {

  setUploadStage(
    "🧠 Creating embeddings..."
  );

}, 1000);

setTimeout(() => {

  setUploadStage(
    "📚 Indexing chunks..."
  );

}, 2000);
const data =
  await uploadPDF(
    selectedFile,
    conversationId
  );

    console.log(data);

    const url =
  URL.createObjectURL(selectedFile);

setPdfUrl(url);

setUploadingPdf(false);

setUploadStage(
  "✅ Ready for questions"
);


  }catch (error) {

  console.error(error);

  setUploadingPdf(false);

  setUploadedFile("");

  setUploadStage("❌ Upload failed");

}

};
const handleAsk = async () => {
  console.log("HANDLE ASK CALLED");

  if (!user) {
    alert("Please login first");
    return;
  }

  if (conversationId === null) {

  alert(
    "Create a chat first"
  );

  return;
}

  setRecentlyUpdatedId(
    conversationId
  );

setTimeout(() => {

  setRecentlyUpdatedId(
    null
  );

}, 1500);

  if (!question.trim())
    return;

const currentQuestion =
  question;

if (uploadedFile) {

  setMessages((prev) => [
    ...prev,
    {
      role: "file",
      fileName: uploadedFile,
      fileUrl: pdfUrl,
    },
    {
      role: "user",
      content: currentQuestion,
    },
  ]);

  setUploadedFile("");
  setPdfUrl("");
}
else {

  setMessages((prev) => [
    ...prev,
    {
      role: "user",
      content: currentQuestion,
    },
  ]);

}

  setQuestion("");

try {

  setLoading(true);

  const result =
    await askQuestion(
      conversationId,
      currentQuestion
    );
    if (
  conversations.find(
    (c) => c.id === conversationId
  )?.title === "New Chat"
) {

  const newTitle =
    currentQuestion.slice(0, 40);

  let current = "";

  for (
    let i = 0;
    i < newTitle.length;
    i++
  ) {

    current += newTitle[i];

    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              title: current,
            }
          : c
      )
    );

    await new Promise(
      (resolve) =>
        setTimeout(
          resolve,
          20
        )
    );

  }

}

  console.log("RESULT RECEIVED");
  console.log(result);

  const fullAnswer =
    result?.answer ||
    result?.error ||
    "⚠️ AI service is temporarily busy. Please wait for some time and try again.";

  setMessages((prev) => [
  ...prev,
  {
    role: "assistant",
    content: "",
    sources: result?.sources || [],
  },
]);

const words =
  fullAnswer.split(" ");

let currentText = "";

for (
  let i = 0;
  i < words.length;
  i++
) {

  currentText +=
    words[i] + " ";

  await new Promise(
    (resolve) =>
      setTimeout(
        resolve,
        35
      )
  );

  setMessages((prev) => {

    const updated =
      [...prev];

    updated[
      updated.length - 1
    ] = {
      ...updated[
        updated.length - 1
      ],
      content:
        currentText,
    };

    return updated;

  });

}

} catch (error) {

  console.error(error);

  setMessages((prev) => [
    ...prev,
    {
      role: "assistant",
      content:
        "⚠️ AI service is temporarily busy. Please wait for some time and try again.",
      sources: [],
    },
  ]);

} finally {

  setLoading(false);

}

};
useEffect(() => {

  if (!user) return;

  loadConversations();

}, [user]);
useEffect(() => {

  if (!user) return;

  const savedId =
    localStorage.getItem(
      "conversationId"
    );

  if (savedId) {

    const id =
      Number(savedId);

    const exists =
      conversations.some(
        (c) => c.id === id
      );

    if (exists) {

      loadMessages(id);

    } else {

      localStorage.removeItem(
        "conversationId"
      );

      setMessages([]);

      setConversationId(null);

    }

  }

}, [user, conversations]);

const loadConversations =
  async () => {

    try {

      if (!user) return;

const data =
  await getConversations(
    user.email
  );

      console.log(
        "Conversations:",
        data
      );

      setConversations(
        data
      );

    } catch (error) {

      console.error(
        error
      );

    }

};
const loadMessages =
  async (
    id: number
  ) => {

    try {

      const data =
        await getConversationMessages(
          id
        );

      console.log(
        "Messages:",
        data
      );

      setConversationId(
        id
      );

      localStorage.setItem(
        "conversationId",
        String(id)
      );

      setMessages(
        data
      );

    } catch (error) {

      console.error(
        error
      );

    }

};
const handleNewChat = async () => {

  if (!user) {
    console.log("User not loaded yet");
    return;
  }

  try {

    const data =
      await createConversation(
        "New Chat",
        user.email
      );

    await loadConversations();

    setConversationId(
      data.conversation_id
    );

    localStorage.setItem(
      "conversationId",
      String(data.conversation_id)
    );

    setMessages([]);

  } catch (error) {

    console.error(error);

  }

};
const handleLogoClick = () => {

  setMessages([]);

  setUploadedFile("");

  setPdfUrl("");

};
const togglePinChat = (
  id: number
) => {

  if (
    pinnedChats.includes(id)
  ) {

    setPinnedChats(
      pinnedChats.filter(
        (chatId) =>
          chatId !== id
      )
    );

  } else {

    setPinnedChats([
      ...pinnedChats,
      id
    ]);

  }

};
useEffect(() => {

  localStorage.setItem(
    "pinnedChats",
    JSON.stringify(
      pinnedChats
    )
  );

}, [pinnedChats]);
const handleDeleteChat =
  async (
    id: number
  ) => {

    try {

      await deleteConversation(
        id
      );
      setPinnedChats(
      pinnedChats.filter(
      (chatId) =>
      chatId !== id
  )
);

      await loadConversations();

      setMessages([]);

    } catch (error) {

      console.error(
        error
      );

    }

};
const handleRenameChat =
  async (
    id: number
  ) => {

    const newTitle =
      prompt(
        "Enter new chat title"
      );

    if (!newTitle)
      return;

    try {

      await renameConversation(
        id,
        newTitle
      );

      await loadConversations();

    } catch (error) {

      console.error(
        error
      );

    }
};
const copyMessage = async (
  text: string,
  index: number
) => {

  try {

    await navigator.clipboard.writeText(
      text
    );

    setCopiedMessageIndex(
      index
    );

    setTimeout(() => {

      setCopiedMessageIndex(
        null
      );

    }, 1500);

  } catch (error) {

    console.error(
      error
    );

  }

};
const login = async () => {

  try {

    await signInWithPopup(
      auth,
      provider
    );

  } catch (error) {

    console.error(error);

  }

};

const handleLogout = async () => {

  localStorage.removeItem(
    "conversationId"
  );

  setMessages([]);

  setConversations([]);

  setConversationId(null);

  setUser(null);

  await signOut(auth);

};
const shareChat = async () => {

  try {

    await navigator.clipboard.writeText(
      window.location.href
    );

    setCopied(true);

    setTimeout(() => {

      setCopied(false);

    }, 2000);

  } catch (error) {

    console.error(error);

  }

};

const exportChatPDF = () => {

  const pdf = new jsPDF();

  let y = 20;

  pdf.setFontSize(18);

  pdf.text(
    "AI Research Paper Assistant",
    20,
    y
  );

  y += 15;

  messages.forEach(
    (message) => {

      const role =
        message.role === "user"
          ? "User"
          : "Assistant";

      const text =
        `${role}: ${message.content}`;

      const lines =
        pdf.splitTextToSize(
          text,
          170
        );

      pdf.setFontSize(12);

      pdf.text(
        lines,
        20,
        y
      );

      y +=
        lines.length * 7 + 10;

      if (y > 260) {

        pdf.addPage();

        y = 20;

      }

    }
  );

  pdf.save(
    "chat-history.pdf"
  );

};
  return (
    <main className="h-screen bg-[#0f1115] text-white flex overflow-hidden">

      {/* Sidebar */}
      <aside className="w-80 bg-[#0b0d11] border-r border-white/5 flex flex-col">

        <div className="p-5">
          <button
          onClick={handleNewChat}
           disabled={!user}
            className="
w-full
flex
items-center
gap-2
px-4
py-3
rounded-2xl
bg-blue-500/10
border
border-blue-400/20
hover:bg-blue-500/20
hover:border-blue-400/40
hover:scale-[1.02]
transition-all
duration-200
cursor-pointer
font-medium
"
          >
            + New Chat
          </button>
        </div>

        <div
  className="
    px-4
    flex-1
    overflow-y-auto
  "
>

          <h2 className="text-xs uppercase tracking-widest text-gray-500 mb-4">
            Conversations
          </h2>
          <input
  type="text"
  placeholder="🔍 Search chats..."
  value={searchTerm}
  onChange={(e) =>
    setSearchTerm(e.target.value)
  }
  className="
    w-full
    mb-4
    px-3
    py-2
    rounded-xl
    bg-white/5
    border
    border-white/10
    text-xl
    outline-none
    focus:border-blue-500
  "
/>

<div className="space-y-2 pb-4">

  {conversations
  .filter((conversation) =>
    conversation.title
      .toLowerCase()
      .includes(
        searchTerm.toLowerCase()
      )
  )
  .sort((a, b) => {

    const aPinned =
      pinnedChats.includes(a.id);

    const bPinned =
      pinnedChats.includes(b.id);

    if (
      aPinned &&
      !bPinned
    ) {
      return -1;
    }

    if (
      !aPinned &&
      bPinned
    ) {
      return 1;
    }

    return 0;

  })
  .map(
    (conversation) => (
      <div
  key={conversation.id}
  onClick={() =>
  loadMessages(
    conversation.id
  )
}
  className={`
  relative
  group
  flex
  items-center
  justify-between
  p-3
  rounded-xl
  cursor-pointer
  transition-all
  duration-300

  ${
    conversation.id ===
    conversationId
      ? `
        bg-white/10
        border
        border-white/10
      `
      : `
        hover:bg-white/5
      `
  }
`}
>
  {editingId === conversation.id ? (

  <input
    autoFocus
    value={editingTitle}
    onChange={(e) =>
      setEditingTitle(e.target.value)
    }
    onBlur={async () => {

      await renameConversation(
        conversation.id,
        editingTitle
      );

      loadConversations();

      setEditingId(null);

    }}
    onKeyDown={async (e) => {

      if (e.key === "Enter") {

        await renameConversation(
          conversation.id,
          editingTitle
        );

        loadConversations();

        setEditingId(null);

      }

    }}
    className="
      bg-transparent
      border
      border-white/20
      rounded-lg
      px-2
      py-1
      text-lg
      w-full
      outline-none
    "
  />

) : (

  <div className="flex items-center gap-2">

  {pinnedChats.includes(
  conversation.id
) && (
  <Pin
    size={12}
    className="
      text-gray-500
      shrink-0
    "
    fill="currentColor"
  />
)}

  <span
    className={`
      text-lg
      transition-all
      duration-500
      ease-out
      ${
        recentlyUpdatedId ===
        conversation.id
          ? "text-blue-300 scale-105"
          : ""
      }
    `}
  >
    {conversation.title}
  </span>

</div>
  

)}

  <button
  onClick={(e) => {

    e.stopPropagation();

    setMenuOpen(
      menuOpen === conversation.id
        ? null
        : conversation.id
    );

  }}
  className="
    opacity-0
    group-hover:opacity-100
    transition
    px-2
    text-gray-400
    hover:text-white
    cursor-pointer
  "
>
  ⋮
</button>
{menuOpen === conversation.id && (

  <div
    className="
      absolute
      right-2
      top-12
      bg-[#1a1d24]
      border
      border-white/10
      rounded-xl
      shadow-xl
      overflow-hidden
      z-50
      min-w-[180px]
      cursor-pointer
    "
  >

    <button
  onClick={shareChat}
  className="
    w-full
    flex
    items-center
    gap-3
    px-4
    py-3
    hover:bg-white/5
    cursor-pointer
  "
>
  <Share2 size={16} />
  Share
</button>
<button
  onClick={(e) => {

    e.stopPropagation();

    togglePinChat(
      conversation.id
    );

    setMenuOpen(null);

  }}
  className="
    w-full
    flex
    items-center
    gap-3
    px-4
    py-3
    hover:bg-white/5
    cursor-pointer
  "
>
  <Pin
  size={16}
  className="
    text-gray-400
  "
/>

{pinnedChats.includes(
  conversation.id
)
  ? "Unpin Chat"
  : "Pin Chat"}
</button>

    <button
  onClick={() => {

    setEditingId(
      conversation.id
    );

    setEditingTitle(
      conversation.title
    );

    setMenuOpen(null);

  }}
  className="
    w-full
    flex
    items-center
    gap-3
    px-4
    py-3
    hover:bg-white/5
    cursor-pointer
  "
>
  <Pencil size={16} />
  Rename
</button>

    <button
  onClick={(e) => {

    e.stopPropagation();

    setChatToDelete(
    conversation.id
    );

  }
}
      className="
        w-full
        flex
        items-center
        gap-3
        px-4
        py-3
        text-red-400
        hover:bg-red-500/10
        cursor-pointer
      "
    >
      <Trash2 size={16} />
      Delete
    </button>

  </div>

)}

</div>

    )
  )}

</div>
  
        </div>
<div
  className="
    mt-auto
    m-3
    p-4
    rounded-2xl
    bg-blue-500/5
    border
    border-blue-400/20
    shadow-lg
    transition-all
    duration-200
    hover:bg-blue-500/10
    hover:border-blue-400/40
    hover:scale-[1.02]
  "
>

  {!user ? (

    <button
      onClick={login}
  className="
  mt-auto
  m-3
  p-4
  rounded-2xl
  bg-blue-500/5
  border
  border-blue-400/20
  shadow-lg
  transition-all
  duration-200
  hover:bg-blue-500/10
  hover:border-blue-400/40
  cursor-pointer
"
    >
      Sign in with Google
    </button>

  ) : (

    <div className="flex items-center gap-3">

      <img
        src={user.photoURL}
        alt=""
        className="
          w-18
          h-18
          rounded-full
        "
      />

      <div className="flex-1">

  <p className="
    text-lg
    font-semibold
    text-white
  ">
    {user.displayName}
  </p>

</div>

      <button
        onClick={handleLogout}
className="
  text-red-400
  text-sm
  cursor-pointer
  hover:text-red-300
  transition-all
  cursor-pointer
"
      >
        Logout
      </button>

    </div>

  )}

</div>
      </aside>

      {/* Main Area */}
      <section className="flex-1 relative overflow-hidden">

        {/* Background Glow */}
        <div className="absolute inset-0">

          <div
            className="
              absolute
              top-[-300px]
              left-[20%]
              w-[700px]
              h-[700px]
              rounded-full
              bg-white/[0.03]
              blur-3xl
            "
          />

          <div
            className="
              absolute
              bottom-[-300px]
              right-[10%]
              w-[700px]
              h-[700px]
              rounded-full
              bg-white/[0.02]
              blur-3xl
            "
          />

        </div>

        {/* Header */}
 <div className="
  sticky
  top-0
  z-50
  border-b
  border-white/5
  px-8
  py-5
  
  bg-black/30
">

  <div className="flex items-center justify-between">

  <h1
    onClick={handleLogoClick}
    className="
      font-semibold
      text-xl
      cursor-pointer
      hover:text-blue-300
      transition
    "
  >
    AI Research Paper Assistant
  </h1>

  <div className="flex items-center gap-4 mb-4">

    {copied && (
      <div className="text-green-400 text-sm">
        ✅ Link Copied
      </div>
    )}

  </div>

</div>

</div>
{/* Messages */}

        {/* Hero */}
<div
  ref={chatContainerRef}
  className="
    relative
    z-10
    flex
    flex-col
    items-center
    px-6
    pt-10
    h-full
    overflow-y-auto
    pb-52
  "
>
          {messages.length === 0 ? (

  <>
  <h2
    className="
      text-6xl
      lg:text-7xl
      font-bold
      tracking-tight
      mb-4
      bg-gradient-to-r
      from-white
      via-gray-200
      to-gray-500
      bg-clip-text
      text-transparent
    "
  >
    Research Paper Assistant
  </h2>

  <p className="text-gray-400 text-xl mb-12">
    Upload a paper and start chatting
  </p>

  <div
    className="
      flex
      flex-wrap
      justify-center
      gap-5
      mt-4
      max-w-5xl
    "
  >

    <div
      className="
        px-8
        py-5
        rounded-2xl
        bg-white/5
        border
        border-white/10
        text-lg
        font-medium
        hover:bg-white/10
        transition
      "
    >
      📄 Upload PDF
    </div>

    <div
      className="
        px-8
        py-5
        rounded-2xl
        bg-white/5
        border
        border-white/10
        text-lg
        font-medium
        hover:bg-white/10
        transition
      "
    >
      🧠 Ask Questions
    </div>

    <div
      className="
        px-8
        py-5
        rounded-2xl
        bg-white/5
        border
        border-white/10
        text-lg
        font-medium
        hover:bg-white/10
        transition
      "
    >
      📚 Generate Summaries
    </div>

    <div
      className="
        px-8
        py-5
        rounded-2xl
        bg-white/5
        border
        border-white/10
        text-lg
        font-medium
        hover:bg-white/10
        transition
      "
    >
      🔍 View Sources
    </div>

  </div>
</>


) : (

  <div
  className="
    w-[80%]
    max-w-6xl
    mx-auto
    pt-8
    pb-64
  "
>

    {messages.map(
      (message, index) => (

        <div
          key={index}
          className={`
  mb-6
  p-5
  rounded-2xl
  text-2xl
  leading-relaxed

  ${
    message.role === "user"
      ? "bg-white/10 ml-auto max-w-[80%]"

      : message.role === "file"
      ? "ml-auto w-fit"

      : "max-w-full"
  }
`}
        >
 <div className="relative group">

{message.role === "file" ? (

  <a
    href={`https://ai-paper-analyzer-production.up.railway.app/${message.fileUrl}`}
    target="_blank"
    rel="noopener noreferrer"
    className="
      flex
      items-center
      gap-4
      p-4
      rounded-2xl
      border
      border-white/10
      bg-white/5
      hover:bg-white/10
      transition-all
      duration-300
      max-w-md
      cursor-pointer
      ml-auto
    "
  >
    <div
      className="
        w-12
        h-12
        rounded-xl
        bg-white/10
        flex
        items-center
        justify-center
        shrink-0
      "
    >
      <FileText size={24} />
    </div>

    <div className="overflow-hidden">
      <p className="font-medium truncate">
        {message.fileName}
      </p>

      <p className="text-sm text-gray-400">
        PDF Document
      </p>
    </div>

  </a>

) : (

  <ReactMarkdown>
    {String(message.content)}
  </ReactMarkdown>

)}

{message.role === "assistant" && (

  <button
    onClick={() =>
  copyMessage(
    message.content,
    index
  )
}
    className="
      absolute
      top-2
      right-2
      opacity-0
      group-hover:opacity-100
      transition
      text-gray-400
      hover:text-white
      bg-white/5
      rounded-lg
      p-2
      cursor-pointer
    "
  >
    {copiedMessageIndex === index
  ? "Copied!"
  : <Copy size={18} />
}
  </button>

)}

</div>
{message.role === "assistant" &&
 message.sources?.length > 0 && (

  <div className="mt-4">

    <button
      onClick={() =>
        setExpandedSources(
          expandedSources === index
            ? null
            : index
        )
      }
      className="
        text-sm
        text-blue-400
        hover:text-blue-300
        cursor-pointer
      "
    >
      {expandedSources === index
        ? "Hide Sources ▲"
        : "Sources ▼"}
    </button>
    {expandedSources === index && (

  <div
    className="
      mt-3
      p-4
      rounded-xl
      bg-white/5
      border
      border-white/10
      text-sm
      whitespace-pre-wrap
      max-h-96
      overflow-y-auto
    "
  >

    {message.sources.map(
      (
        source: string,
        i: number
      ) => (

        <div
          key={i}
          className="mb-6"
        >

          <div
            className="
              text-blue-400
              mb-2
              font-medium
            "
          >
            Chunk {i + 1}
          </div>

          <div
            className="
              text-gray-300
            "
          >
            {source}
          </div>

        </div>

      )
    )}
  </div>

)}

  </div>

)}
</div>
      )
    )}

{loading && (

  <div
    className="
      flex
      gap-2
      p-5
      mb-20
    "
  >

    <div
      className="
        w-3
        h-3
        bg-gray-400
        rounded-full
        animate-bounce
      "
    />

    <div
      className="
        w-3
        h-3
        bg-gray-400
        rounded-full
        animate-bounce
        [animation-delay:150ms]
      "
    />

    <div
      className="
        w-3
        h-3
        bg-gray-400
        rounded-full
        animate-bounce
        [animation-delay:300ms]
      "
    />

  </div>

)}
  </div>

)}
          

        </div>
        {/* Chat Input */}
<div
  className="
    fixed
    bottom-0
    left-80
    right-0
    h-48
    bg-[#0f1115]
    z-40
    flex
    items-end
    justify-center
    pb-6
  "
>
  

          <div
            className="
              w-[80%]
              max-w-6xl
              bg-[#1a1d24]
              relative z-50
              bg-[#1a1d24]
              border
              border-white/10
              rounded-[40px]
              p-7
              shadow-xl
            "
          >
{(uploadedFile || uploadingPdf) && (
  <div
    className="
      flex
      items-center
      gap-4
      px-5
      py-5
      rounded-xl
      bg-white/10
      w-fit
      mb-3
    "
  >
    <FileText size={18} />

    <div>

  <p className="text-lg font-semibold">
    {uploadedFile}
  </p>

  <p
  className="
    text-base
    text-green-400
    mt-2
    font-medium
  "
>
  {uploadStage}
</p>

</div>

    {!uploadingPdf && (
  <X
    size={18}
    onClick={() => {
      setUploadedFile("");
      setPdfUrl("");
    }}
    className="
      cursor-pointer
      hover:text-red-400
    "
  />
)}

</div>
)}
{messages.length === 0 && (

  <div
    className="
      flex
      gap-3
      mb-4
      overflow-x-auto
    "
  >

    {[
      "Give me a summary",
      "What is the methodology?",
      "What are the key findings?",
      "Explain this paper like I'm a beginner"
    ].map((q) => (

      <button
        key={q}
        onClick={() =>
          setQuestion(q)
        }
        className="
          px-4
          py-2
          rounded-full
          bg-white/5
          border
          border-white/10
          hover:bg-white/10
          transition
          whitespace-nowrap
          text-sm
          cursor-pointer
        "
      >
        {q}
      </button>

    ))}

  </div>

)}
<div className="flex items-center gap-4 min-h-[60px]">

<>
  <label
  htmlFor="pdf-upload"
  className="
    text-gray-400
    hover:text-white
    cursor-pointer
    transition
    flex
    items-center
  "
>
  <Paperclip size={24} />
</label>

  <input
    id="pdf-upload"
    type="file"
    accept=".pdf"
    className="hidden"
    onChange={(e) => {
  const file =
    e.target.files?.[0];

  if (!file) return;

  handleUpload(file);
}}
  />
</>

<textarea
  placeholder="Ask anything about the paper..."
  value={question}
  onChange={(e) =>
    setQuestion(
      e.target.value
    )
  }
  onKeyDown={(e) => {

    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {

      e.preventDefault();

      handleAsk();

    }

  }}

  onInput={(e) => {

  const target =
    e.target as HTMLTextAreaElement;

  target.style.height =
    "auto";

  target.style.height =
    Math.min(
      target.scrollHeight,
      220
    ) + "px";

}}

  rows={1}
  className="
    flex-1
    bg-transparent
    outline-none
    text-white
    text-[28px]
    placeholder:text-gray-400
    resize-none
    overflow-y-auto
    max-h-[180px]
  "
/>

<button
  onClick={handleAsk}
  className="
    w-16
    h-16
    rounded-full
    bg-white
    text-black
    flex
    items-center
    justify-center
    shadow-lg
    hover:scale-110
    transition-all
    duration-200
    cursor-pointer
  "
>
  <ArrowUp size={28} />
</button>
{messages.length > 0 && (

  <button
    onClick={exportChatPDF}
    className="
      h-16
      px-8
      rounded-2xl
      bg-white/10
      border
      border-white/20
      hover:bg-white/15
      transition-all
      duration-300
      text-lg
      font-semibold
      flex
      items-center
      justify-center
      whitespace-nowrap
      gap-2
cursor-pointer
hover:scale-105
    "
  >
    <FileDown size={20} />
<span>Export Chat</span>
  </button>

)}

            </div>

          </div>

        </div>

      </section>

    {chatToDelete && (

  <div
    className="
      fixed
      inset-0
      bg-black/60
      flex
      items-center
      justify-center
      z-50
    "
  >

    <div
      className="
        bg-[#171b26]
        border
        border-white/10
        rounded-2xl
        p-8
        w-[450px]
      "
    >

      <h3 className="text-2xl font-bold mb-3">
        Delete Conversation?
      </h3>

      <p
        className="
          text-gray-300
          mb-8
        "
      >
        This action cannot be undone.
      </p>

      <div
        className="
          flex
          justify-end
          gap-3
        "
      >

        <button
          onClick={() =>
            setChatToDelete(
              null
            )
          }
          className="
            px-4
            py-2
            rounded-lg
            bg-white/10
            cursor-pointer
          "
        >
          Cancel
        </button>

        <button
          onClick={async () => {

            await handleDeleteChat(
              chatToDelete
            );

            setChatToDelete(
              null
            );

          }}
          className="
            px-4
            py-2
            rounded-lg
            bg-red-600
            cursor-pointer
          "
        >
          Delete
        </button>

      </div>

    </div>

  </div>

)}
    </main>
  );
}