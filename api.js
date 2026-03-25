
// api.js - Handles all API interactions with the backend server, including authentication, chat management, library management, AI generation, and profile management. Also includes a migration function to sync localStorage data to MongoDB on first load.
const API = (() => {

  const BASE_URL = "https://p-search-ai.onrender.com/api";

  async function getToken() {
    const user = window.__firebaseCurrentUser;
    if (!user) throw new Error("User not logged in");
    return await user.getIdToken(true);
  }

  async function request(method, path, body = null) {
    try {
      const token = await getToken();
      const opts = {
        method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
      };
      if (body) opts.body = JSON.stringify(body);
      const res  = await fetch(`${BASE_URL}${path}`, opts);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      return data;
    } catch (err) {
      console.error(`❌ API [${method} ${path}]:`, err.message);
      throw err;
    }
  }

  // CHATS
  const getAllChats    = ()             => request("GET",    "/chats");
  const getChat        = (id)           => request("GET",    `/chats/${id}`);
  const createChat     = (opts = {})    => request("POST",   "/chats", opts);
  const updateChat     = (id, data)     => request("PATCH",  `/chats/${id}`, data);
  const deleteChat     = (id)           => request("DELETE", `/chats/${id}`);
  const deleteAllChats = ()             => request("DELETE", "/chats");
  const syncChats      = (chats)        => request("POST",   "/chats/sync", { chats });
  const sendMessage    = (id, text, image, fileData, model = "default") =>
    request("POST", `/chats/${id}/message`, { text, image, fileData, model });

  // LIBRARY
  const getLibrary       = (model)          => request("GET",    `/library${model ? "?model="+model : ""}`);
  const getFile          = (id)             => request("GET",    `/library/file/${id}`);
  const deleteFile       = (id)             => request("DELETE", `/library/file/${id}`);
  const deleteChatFiles  = (chatId)         => request("DELETE", `/library/chat/${chatId}`);
  const syncLibrary      = (lib, model)     => request("POST",   "/library/sync", { library: lib, model });
  const uploadFileBase64 = (fd, cid, ct, m) => request("POST",   "/library/upload-base64", { fileData: fd, chatId: cid, chatTitle: ct, model: m || "default" });

  // AI
  const generateAI    = (msgs, model, fd) => request("POST", "/ai/generate", { messages: msgs, model, fileData: fd });
  const generateTitle = (msg)             => request("POST", "/ai/title", { message: msg });

  // PROFILE
  const getProfile    = ()     => request("GET",    "/profile");
  const updateProfile = (data) => request("PATCH",  "/profile", data);
  const deleteProfile = ()     => request("DELETE", "/profile");

  // MIGRATION
  async function migrateFromLocalStorage() {
    if (localStorage.getItem("db_migrated") === "true") {
      console.log("✅ Already synced with MongoDB");
      return;
    }

    console.log("🔄 Syncing localStorage data to MongoDB...");

    // Chats
    try {
      const localChats = JSON.parse(localStorage.getItem("chats") || "{}");
      if (Object.keys(localChats).length > 0) {
        const r = await syncChats(localChats);
        console.log(`✅ Chats synced: ${r.created} new, ${r.skipped} existing`);
      }
    } catch (e) { console.warn("⚠️ Chat sync failed:", e.message); }

    // Library
    try {
      const lib = JSON.parse(localStorage.getItem("library") || "{}");
      for (const [model, modelLib] of Object.entries(lib)) {
        const total = Object.values(modelLib).reduce((s, c) => s + (c.files?.length || 0), 0);
        if (total > 0) {
          const r = await syncLibrary(modelLib, model);
          console.log(`✅ Library [${model}]: ${r.created} files synced`);
        }
      }
    } catch (e) { console.warn("⚠️ Library sync failed:", e.message); }

    // Profile
    try {
      const p = JSON.parse(localStorage.getItem("userProfile") || "{}");
      if (p.username || p.bio || p.theme) {
        await updateProfile({
          username: p.username || "",
          phone:    p.phone    || "",
          bio:      p.bio      || "",
          theme:    p.theme    || "dark",
          fontSize: p.fontSize || "medium",
          avatar:   p.avatar   || null,
        });
        console.log("✅ Profile synced");
      }
    } catch (e) { console.warn("⚠️ Profile sync failed:", e.message); }

    localStorage.setItem("db_migrated", "true");
    console.log("🎉 MongoDB sync complete!");
  }

  async function checkHealth() {
    try {
      const r = await fetch(BASE_URL.replace("/api","") + "/health");
      return (await r.json()).status === "ok";
    } catch { return false; }
  }

  return {
    getAllChats, getChat, createChat, updateChat, deleteChat, deleteAllChats, sendMessage, syncChats,
    getLibrary, getFile, deleteFile, deleteChatFiles, uploadFileBase64, syncLibrary,
    generateAI, generateTitle,
    getProfile, updateProfile, deleteProfile,
    migrateFromLocalStorage, checkHealth,
  };
})();

// ← YEH LINE ADD KARO
window.API = API;

window.addEventListener("load", async () => {
  const ok = await API.checkHealth();
  console.log(ok ? "✅ Backend online: http://localhost:5000" : "⚠️ Backend offline — using localStorage");
});