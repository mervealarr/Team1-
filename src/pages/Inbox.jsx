import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getInboxMessages, sendMessage, parseJwt } from "../api";

function Inbox() {
    const [messages, setMessages] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [newMessage, setNewMessage] = useState("");
    const [searchParams] = useSearchParams();

    const token = localStorage.getItem("token");
    const receiverIdFromUrl = searchParams.get("receiverId");
    const listingIdFromUrl = searchParams.get("listingId");

    const getCurrentUserId = () => {
        const payload = parseJwt(token);

        return Number(
            payload?.nameid ||
            payload?.sub ||
            payload?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
        );
    };

    const currentUserId = getCurrentUserId();

    const loadMessages = async () => {
        const data = await getInboxMessages();
        const messageList = Array.isArray(data) ? data : [];

        // 1. ADIM: Okunmamış mesaj sayısını hesapla ve Navbar'a gönder
        const unreadCount = messageList.filter(msg => 
            Number(msg.receiverId) === Number(currentUserId) && !msg.isRead
        ).length;

        window.dispatchEvent(new CustomEvent('unread-count-change', { detail: unreadCount }));

        // 2. ADIM: Bildirim zili kontrolü
        if (messageList.length > messages.length && messages.length > 0) {
            const latestMsg = messageList[messageList.length - 1];
            if (Number(latestMsg.senderId) !== Number(currentUserId)) {
                window.dispatchEvent(new CustomEvent('new-notification', { 
                    detail: latestMsg.content 
                }));
            }
        }

        setMessages(messageList);
    };

    useEffect(() => {
        loadMessages();
    }, []);

    const chats = useMemo(() => {
        const grouped = {};

        messages.forEach((msg) => {
            const otherUserId =
                Number(msg.senderId) === Number(currentUserId)
                    ? msg.receiverId
                    : msg.senderId;

            const key = `${msg.listingId}-${otherUserId}`;

            if (!grouped[key]) {
                grouped[key] = {
                    key,
                    listingId: msg.listingId,
                    otherUserId,
                    messages: []
                };
            }

            grouped[key].messages.push(msg);
        });

        const chatList = Object.values(grouped).map((chat) => ({
            ...chat,
            messages: chat.messages.sort(
                (a, b) => new Date(a.sentAt) - new Date(b.sentAt)
            ),
            lastMessage: chat.messages[chat.messages.length - 1]
        }));

        if (receiverIdFromUrl && listingIdFromUrl) {
            const key = `${listingIdFromUrl}-${receiverIdFromUrl}`;
            const exists = chatList.some((chat) => chat.key === key);

            if (!exists) {
                chatList.unshift({
                    key,
                    listingId: Number(listingIdFromUrl),
                    otherUserId: Number(receiverIdFromUrl),
                    messages: [],
                    lastMessage: {
                        content: "Yeni sohbet başlat"
                    }
                });
            }
        }

        return chatList;
    }, [messages, currentUserId, receiverIdFromUrl, listingIdFromUrl]);

    useEffect(() => {
        if (receiverIdFromUrl && listingIdFromUrl && chats.length > 0) {
            const key = `${listingIdFromUrl}-${receiverIdFromUrl}`;
            const chatFromUrl = chats.find((chat) => chat.key === key);

            if (chatFromUrl) {
                setSelectedChat(chatFromUrl);
            }
        }
    }, [chats, receiverIdFromUrl, listingIdFromUrl]);

    const activeChat = selectedChat || chats[0];

    const handleSend = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() || !activeChat) return;

        await sendMessage({
            receiverId: Number(activeChat.otherUserId),
            listingId: Number(activeChat.listingId),
            content: newMessage
        });

        setNewMessage("");
        await loadMessages();
    };

    return (
        <div style={{ padding: "120px 5% 40px 5%" }}>
            <h1 style={{ marginBottom: "24px" }}>Mesajlarım</h1>

            {chats.length === 0 ? (
                <div
                    style={{
                        padding: "24px",
                        border: "1px solid var(--border-color)",
                        borderRadius: "16px",
                        background: "var(--card-bg)",
                        color: "var(--text-secondary)"
                    }}
                >
                    Henüz mesaj yok.
                </div>
            ) : (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "320px 1fr",
                        height: "600px",
                        border: "1px solid var(--border-color)",
                        borderRadius: "18px",
                        overflow: "hidden",
                        background: "var(--card-bg)"
                    }}
                >
                    <div
                        style={{
                            borderRight: "1px solid var(--border-color)",
                            overflowY: "auto"
                        }}
                    >
                        {chats.map((chat) => (
                            <div
                                key={chat.key}
                                onClick={() => setSelectedChat(chat)}
                                style={{
                                    padding: "18px",
                                    cursor: "pointer",
                                    borderBottom: "1px solid var(--border-color)",
                                    background:
                                        activeChat?.key === chat.key
                                            ? "rgba(124, 92, 255, 0.18)"
                                            : "transparent"
                                }}
                            >
                                <strong>Kullanıcı #{chat.otherUserId}</strong>
                                <p style={{ margin: "6px 0", color: "var(--text-secondary)" }}>
                                    İlan #{chat.listingId}
                                </p>
                                <p style={{ fontSize: "0.9rem" }}>
                                    {chat.lastMessage?.content || "Yeni sohbet başlat"}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: "flex", flexDirection: "column" }}>
                        <div
                            style={{
                                padding: "18px",
                                borderBottom: "1px solid var(--border-color)"
                            }}
                        >
                            <strong>Kullanıcı #{activeChat.otherUserId}</strong>
                            <p style={{ color: "var(--text-secondary)" }}>
                                İlan #{activeChat.listingId}
                            </p>
                        </div>

                        <div
                            style={{
                                flex: 1,
                                padding: "20px",
                                overflowY: "auto",
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px"
                            }}
                        >
                            {activeChat.messages.length === 0 ? (
                                <p style={{ color: "var(--text-secondary)" }}>
                                    Bu ilan için mesaj yazmaya başlayabilirsin.
                                </p>
                            ) : (
                                activeChat.messages.map((msg) => {
                                    const isMine = Number(msg.senderId) === Number(currentUserId);

                                    return (
                                        <div
                                            key={msg.id}
                                            style={{
                                                alignSelf: isMine ? "flex-end" : "flex-start",
                                                maxWidth: "65%",
                                                padding: "12px 16px",
                                                borderRadius: "16px",
                                                background: isMine
                                                    ? "linear-gradient(135deg, #4f8cff, #7c5cff)"
                                                    : "rgba(255,255,255,0.08)",
                                                color: "white"
                                            }}
                                        >
                                            {msg.content}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <form
                            onSubmit={handleSend}
                            style={{
                                display: "flex",
                                gap: "12px",
                                padding: "16px",
                                borderTop: "1px solid var(--border-color)"
                            }}
                        >
                            <input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Mesaj yaz..."
                                style={{
                                    flex: 1,
                                    padding: "14px",
                                    borderRadius: "12px",
                                    border: "1px solid var(--border-color)",
                                    background: "transparent",
                                    color: "var(--text-primary)"
                                }}
                            />

                            <button
                                type="submit"
                                style={{
                                    padding: "14px 24px",
                                    borderRadius: "12px",
                                    border: "none",
                                    background: "linear-gradient(135deg, #4f8cff, #7c5cff)",
                                    color: "white",
                                    fontWeight: "bold",
                                    cursor: "pointer"
                                }}
                            >
                                Gönder
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Inbox;