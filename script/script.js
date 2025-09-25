    function getGreeting() {
      const now = new Date();
      const hour = now.getHours();
      if (hour >= 4 && hour < 10) return "Hai, Selamat Pagi";
      if (hour >= 10 && hour < 15) return "Hai, Selamat Siang";
      if (hour >= 15 && hour < 18) return "Hai, Selamat Sore";
      return "Hai, Selamat Malam";
    }

    const greetingText = document.getElementById("greetingText");
    const chatMessages = document.getElementById("chatMessages");
    const chatForm = document.getElementById("chatForm");
    const chatInput = document.getElementById("chatInput");
    const chatHistory = document.getElementById("chatHistory");
    const editTitleOverlay = document.getElementById("editTitleOverlay");
    const editTitleTextarea = document.getElementById("editTitleTextarea");
    const btnCancelEditTitle = document.getElementById("btnCancelEditTitle");
    const btnSaveEditTitle = document.getElementById("btnSaveEditTitle");
    const btnNewChat = document.getElementById("btnNewChat");
    const btnMic = document.getElementById("btnMic");

    let chatSessions = [];
    let currentSessionId = null;
    let editingSessionId = null;

    greetingText.textContent = getGreeting();
    function scrollChatToBottom() {
      const container = document.getElementById("chatContainer");
      container.scrollTop = container.scrollHeight;
    }
    function createUserBubble(text) {
      const bubble = document.createElement("div");
      bubble.classList.add("chat-bubble", "user");
      bubble.textContent = text;
      return bubble;
    }


    function createAIBubble(text) {
      const block = document.createElement("div");
      block.className =
        "self-start max-w-[75%] text-white whitespace-pre-wrap break-words";
      block.textContent = text;
      return block;
    }
    function renderChatMessages() {
      chatMessages.innerHTML = "";
      if (!currentSessionId) return;
      const session = chatSessions.find((s) => s.id === currentSessionId);
      if (!session) return;
      session.messages.forEach((msg) => {
        if (msg.role === "user") {
          chatMessages.appendChild(createUserBubble(msg.content));
        } else if (msg.role === "ai") {
          chatMessages.appendChild(createAIBubble(msg.content));
        }
      });
      scrollChatToBottom();
    }

    function renderChatHistory() {
      chatHistory.innerHTML = "";
      chatSessions.forEach((session) => {
        const item = document.createElement("div");
        item.classList.add("chat-item");


        item.setAttribute("tabindex", "0");
        item.setAttribute("role", "button");
        item.setAttribute("aria-label", `Buka sesi obrolan: ${session.title}`);

        const titleSpan = document.createElement("span");
        titleSpan.className = "truncate max-w-[calc(100%-72px)]";
        titleSpan.textContent = session.title;
        item.appendChild(titleSpan);
        const btnContainer = document.createElement("div");
        btnContainer.className = "flex items-center space-x-2";

        const btnEdit = document.createElement("button");
        btnEdit.className =
          "text-gray-600 hover:text-white transition-colors p-1";
        btnEdit.setAttribute("aria-label", `Ubah judul obrolan: ${session.title}`);
        btnEdit.title = "Ubah judul obrolan";
        btnEdit.innerHTML = '<i class="fas fa-pen"></i>';
        btnEdit.addEventListener("click", (e) => {
          e.stopPropagation();
          openEditTitleOverlay(session.id);
        });
        btnContainer.appendChild(btnEdit);

        const btnDelete = document.createElement("button");
        btnDelete.className =
          "text-red-600 hover:text-red-800 transition-colors p-1";
        btnDelete.setAttribute("aria-label", `Hapus obrolan: ${session.title}`);
        btnDelete.title = "Hapus obrolan";
        btnDelete.innerHTML = '<i class="fas fa-trash"></i>';
        btnDelete.addEventListener("click", (e) => {
          e.stopPropagation();
          deleteChatSession(session.id);
        });
        btnContainer.appendChild(btnDelete);
        item.appendChild(btnContainer);
        item.addEventListener("click", () => {
          openChatSession(session.id);
        });
        item.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openChatSession(session.id);
          }
        });

        chatHistory.appendChild(item);
      });
    }
    function openChatSession(id) {
      currentSessionId = id;
      renderChatMessages();
      highlightActiveChatHistory();
    }

    function highlightActiveChatHistory() {
      const children = chatHistory.children;
      for (let i = 0; i < children.length; i++) {
        const el = children[i];
        const session = chatSessions[i];

        if (!currentSessionId || !session) {
          el.classList.remove("bg-[#161616]", "font-semibold");
          el.classList.add("bg-[#27272a]", "text-white");
          continue;
        }

        if (session.id === currentSessionId) {
          el.classList.remove("bg-[#27272a]");
          el.classList.add("bg-[#161616]", "text-white", "font-semibold");
        } else {
          el.classList.remove("bg-[#161616]", "font-semibold");
          el.classList.add("bg-[#27272a]", "text-white");
        }
      }
    }


    function deleteChatSession(id) {
      const idx = chatSessions.findIndex((s) => s.id === id);
      if (idx === -1) return;
      chatSessions.splice(idx, 1);
      if (currentSessionId === id) {
        if (chatSessions.length > 0) {
          currentSessionId = chatSessions[0].id;
        } else {
          currentSessionId = null;
          chatMessages.innerHTML = "";
        }
      }
      renderChatHistory();
      renderChatMessages();
      highlightActiveChatHistory();
    }

    function openEditTitleOverlay(id) {
      editingSessionId = id;
      const session = chatSessions.find((s) => s.id === id);
      if (!session) return;
      editTitleTextarea.value = session.title;
      editTitleOverlay.classList.remove("hidden");
      editTitleTextarea.focus();
    }

    function closeEditTitleOverlay() {
      editingSessionId = null;
      editTitleOverlay.classList.add("hidden");
      editTitleTextarea.value = "";
    }

    function saveEditedTitle() {
      if (!editingSessionId) return;
      const newTitle = editTitleTextarea.value.trim();
      if (newTitle.length === 0) {
        alert("Judul tidak boleh kosong.");
        return;
      }
      const session = chatSessions.find((s) => s.id === editingSessionId);
      if (!session) return;
      session.title = newTitle;
      renderChatHistory();
      if (currentSessionId === editingSessionId) {
      }
      closeEditTitleOverlay();
    }

    function createNewChatSession(firstUserMessage = "") {
      const id = crypto.randomUUID();
      const title = firstUserMessage.trim() || "Obrolan Baru";
      const newSession = {
        id,
        title,
        messages: [],
      };
      if (firstUserMessage.trim()) {
        newSession.messages.push({ role: "user", content: firstUserMessage.trim() });
      }
      chatSessions.unshift(newSession);
      currentSessionId = id;
      renderChatHistory();
      renderChatMessages();
      highlightActiveChatHistory();
    }

    function updateSessionTitleFromFirstUserMessage(session) {
      if (!session) return;
      if (session.messages.length === 0) return;
      const firstUserMsg = session.messages.find((m) => m.role === "user");
      if (!firstUserMsg) return;
      if (
        session.title === "Obrolan Baru" ||
        session.title.trim() === "" ||
        session.title === null
      ) {
        session.title = firstUserMsg.content.length > 30 ? firstUserMsg.content.slice(0, 30) + "..." : firstUserMsg.content;
        renderChatHistory();
      }
    }

    function appendMessageToCurrentSession(role, content) {
      if (!currentSessionId) {
        createNewChatSession();
      }
      const session = chatSessions.find((s) => s.id === currentSessionId);
      if (!session) return;
      session.messages.push({ role, content });
      if (role === "user") {
        updateSessionTitleFromFirstUserMessage(session);
      }
      renderChatMessages();
    }

    chatForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;
      appendMessageToCurrentSession("user", text);
      chatInput.value = "";
      chatInput.style.height = "auto";
      scrollChatToBottom();

      try {
        const aiResponse = await fetchOpenRouterResponse(text);
        appendMessageToCurrentSession("ai", aiResponse);
        scrollChatToBottom();
      } catch (err) {
        appendMessageToCurrentSession("ai", "Maaf, terjadi kesalahan saat memproses permintaan Anda.");
        scrollChatToBottom();
      }
    });

    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        chatForm.requestSubmit();
      } else if (e.key === "Enter" && e.shiftKey) {
        const lines = chatInput.value.split("\n").length;
        if (lines >= 4) {
          e.preventDefault();
        }
      }
    });
    chatInput.addEventListener("input", () => {
      chatInput.style.height = "auto";
      chatInput.style.height = chatInput.scrollHeight + "px";
      const maxHeight = parseInt(getComputedStyle(chatInput).lineHeight) * 4 + 16;
      if (chatInput.scrollHeight > maxHeight) {
        chatInput.style.overflowY = "auto";
        chatInput.style.height = maxHeight + "px";
      } else {
        chatInput.style.overflowY = "hidden";
      }
    });
    btnNewChat.addEventListener("click", () => {
      createNewChatSession();
      chatInput.focus();
    });

    btnCancelEditTitle.addEventListener("click", () => {
      closeEditTitleOverlay();
    });
    btnSaveEditTitle.addEventListener("click", () => {
      saveEditedTitle();
    });

    editTitleOverlay.addEventListener("click", (e) => {
      if (e.target === editTitleOverlay) {
        closeEditTitleOverlay();
      }
    });
    let recognition;
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition = new SpeechRecognition();
      recognition.lang = "id-ID";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.addEventListener("result", (event) => {
        const transcript = event.results[0][0].transcript;
        chatInput.value += transcript + " ";
        chatInput.style.height = "auto";
        chatInput.style.height = chatInput.scrollHeight + "px";
        chatInput.focus();
      });

      recognition.addEventListener("end", () => {
        btnMic.classList.remove("text-red-600");
      });
    } else {
      btnMic.disabled = true;
      btnMic.title = "Speech recognition tidak didukung di browser ini";
    }

    btnMic.addEventListener("click", () => {
      if (!recognition) return;
      if (btnMic.classList.contains("text-red-600")) {
        recognition.stop();
        btnMic.classList.remove("text-red-600");
      } else {
        recognition.start();
        btnMic.classList.add("text-red-600");
      }
    });
    const uploadImageInput = document.getElementById("uploadImage");
    uploadImageInput.addEventListener("change", () => {
      const file = uploadImageInput.files[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        alert("File harus berupa gambar.");
        uploadImageInput.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = function (e) {
        appendMessageToCurrentSession("user", "[Gambar diunggah]");
        const imgBubble = document.createElement("div");
        imgBubble.className =
          "self-end max-w-[75%] rounded-2xl rounded-br-none overflow-hidden border border-blue-600 mr-2";
        const img = document.createElement("img");
        img.src = e.target.result;
        img.alt = "Gambar yang diunggah oleh pengguna";
        img.className = "w-full h-auto object-contain";
        imgBubble.appendChild(img);
        chatMessages.appendChild(imgBubble);
        scrollChatToBottom();
      };
      reader.readAsDataURL(file);
      uploadImageInput.value = "";
    });


    async function fetchOpenRouterResponse(userMessage) {
      // NOTE: Replace 'YOUR_OPENROUTER_API_KEY' with your actual API key
      const API_KEY = "YOUR_OPENROUTER_API_KEY";
      const url = "https://openrouter.ai/api/v1/chat/completions";

      const body = {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: userMessage }],
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const data = await response.json();
      if (
        data &&
        data.choices &&
        data.choices.length > 0 &&
        data.choices[0].message &&
        data.choices[0].message.content
      ) {
        return data.choices[0].message.content.trim();
      } else {
        throw new Error("Invalid API response");
      }
    }

    createNewChatSession();