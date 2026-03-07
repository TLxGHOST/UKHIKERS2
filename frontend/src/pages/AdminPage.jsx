import { useState } from "react";

const API = "http://localhost:5000/api";

export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const token = localStorage.getItem("token");

  const submit = async () => {
    await fetch(`${API}/admin/create-blog`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        excerpt,
        imageUrl,
      }),
    });

    alert("Blog created");
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Create Blog</h2>

      <input placeholder="Title" onChange={(e) => setTitle(e.target.value)} />

      <input
        placeholder="Excerpt"
        onChange={(e) => setExcerpt(e.target.value)}
      />

      <input
        placeholder="Image URL"
        onChange={(e) => setImageUrl(e.target.value)}
      />

      <button onClick={submit}>Create Blog</button>
    </div>
  );
}
