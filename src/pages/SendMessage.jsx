import { useState } from "react";
import { sendMessage } from "../api";

function SendMessage() {
    const [receiverId, setReceiverId] = useState("");
    const [listingId, setListingId] = useState("");
    const [content, setContent] = useState("");

    const token = localStorage.getItem("token");

    const handleSubmit = async (e) => {
        e.preventDefault();

        await sendMessage(token, {
            receiverId: Number(receiverId),
            listingId: Number(listingId),
            content
        });

        alert("Message sent successfully!");
        setReceiverId("");
        setListingId("");
        setContent("");
    };

    return (
        <div style={{ padding: "120px 5% 40px 5%" }}>
            <h1 style={{ marginBottom: "24px" }}>Send Message</h1>

            <form
                onSubmit={handleSubmit}
                style={{
                    maxWidth: "600px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px"
                }}
            >
                <input
                    placeholder="Receiver ID"
                    value={receiverId}
                    onChange={(e) => setReceiverId(e.target.value)}
                    style={{
                        padding: "14px",
                        borderRadius: "10px",
                        border: "1px solid var(--border-color)",
                        background: "var(--card-bg)",
                        color: "var(--text-primary)"
                    }}
                />

                <input
                    placeholder="Listing ID"
                    value={listingId}
                    onChange={(e) => setListingId(e.target.value)}
                    style={{
                        padding: "14px",
                        borderRadius: "10px",
                        border: "1px solid var(--border-color)",
                        background: "var(--card-bg)",
                        color: "var(--text-primary)"
                    }}
                />

                <textarea
                    placeholder="Write your message"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows="5"
                    style={{
                        padding: "14px",
                        borderRadius: "10px",
                        border: "1px solid var(--border-color)",
                        background: "var(--card-bg)",
                        color: "var(--text-primary)",
                        resize: "vertical"
                    }}
                />

                <button
                    type="submit"
                    style={{
                        padding: "14px",
                        borderRadius: "12px",
                        border: "none",
                        background: "linear-gradient(135deg, #4f8cff, #7c5cff)",
                        color: "white",
                        fontWeight: "bold",
                        cursor: "pointer"
                    }}
                >
                    Send
                </button>
            </form>
        </div>
    );
}

export default SendMessage;