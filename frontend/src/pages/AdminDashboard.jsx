import { useState, useEffect } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function AdminDashboard() {
  const token = localStorage.getItem("adminToken");

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [duration, setDuration] = useState("");
  const [thingsToCarry, setThingsToCarry] = useState("");

  const [paragraph, setParagraph] = useState("");
  const [image, setImage] = useState("");

  const [contentBlocks, setContentBlocks] = useState([]);

  const [treks, setTreks] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const fetchTreks = async () => {
    const res = await fetch(`${API}/blogs`);
    const data = await res.json();

    setTreks(data);
  };

  useEffect(() => {
    fetchTreks();
  }, []);

  const addParagraph = () => {
    if (!paragraph) return;

    setContentBlocks([
      ...contentBlocks,
      { type: "paragraph", text: paragraph },
    ]);

    setParagraph("");
  };

  const addImage = () => {
    if (!image) return;

    setContentBlocks([
      ...contentBlocks,
      {
        type: "image",
        src: image,
        alt: "trek image",
      },
    ]);

    setImage("");
  };

  const saveTrek = async () => {
    const url = editingId
      ? `${API}/admin/update-blog/${editingId}`
      : `${API}/admin/create-blog`;

    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,

      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify({
        title,
        excerpt,
        imageUrl,
        price,
        discount,
        difficulty,
        duration,
        thingsToCarry: thingsToCarry.split(","),

        content: contentBlocks,
      }),
    });

    alert(editingId ? "Trek Updated" : "Trek Created");

    setEditingId(null);

    setTitle("");
    setExcerpt("");
    setImageUrl("");
    setPrice("");
    setDiscount("");
    setDifficulty("");
    setDuration("");
    setThingsToCarry("");
    setContentBlocks([]);

    fetchTreks();
  };

  const deleteTrek = async (id) => {
    await fetch(`${API}/admin/delete-blog/${id}`, {
      method: "DELETE",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    fetchTreks();
  };

  const startEdit = (trek) => {
    setEditingId(trek._id);

    setTitle(trek.title || "");
    setExcerpt(trek.excerpt || "");
    setImageUrl(trek.imageUrl || "");
    setPrice(trek.price || "");
    setDiscount(trek.discount || "");
    setDifficulty(trek.difficulty || "");
    setDuration(trek.duration || "");
    setThingsToCarry((trek.thingsToCarry || []).join(","));

    setContentBlocks(trek.content || []);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0b1d26] text-white p-10">
      <h1 className="text-3xl mb-8 font-bold">Trek Admin Panel</h1>

      {/* TREK FORM */}

      <div className="max-w-xl space-y-4 mb-12">
        <input
          placeholder="Trek Title"
          className="w-full p-2 text-black rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Short Description"
          className="w-full p-2 text-black rounded"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
        />

        <input
          placeholder="Hero Image URL"
          className="w-full p-2 text-black rounded"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />

        <input
          placeholder="Price"
          className="w-full p-2 text-black rounded"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          placeholder="Discount %"
          className="w-full p-2 text-black rounded"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
        />

        <input
          placeholder="Difficulty"
          className="w-full p-2 text-black rounded"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
        />

        <input
          placeholder="Duration (ex: 3 Days)"
          className="w-full p-2 text-black rounded"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />

        <textarea
          placeholder="Things to Carry (comma separated)"
          className="w-full p-2 text-black rounded"
          value={thingsToCarry}
          onChange={(e) => setThingsToCarry(e.target.value)}
        />
      </div>

      {/* BLOG BUILDER */}

      <h2 className="text-2xl mb-4">Blog Content</h2>

      <div className="max-w-xl space-y-4 mb-10">
        <textarea
          placeholder="Write paragraph"
          className="w-full p-2 text-black rounded"
          value={paragraph}
          onChange={(e) => setParagraph(e.target.value)}
        />

        <button
          onClick={addParagraph}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Add Paragraph
        </button>

        <input
          placeholder="Image URL"
          className="w-full p-2 text-black rounded"
          value={image}
          onChange={(e) => setImage(e.target.value)}
        />

        <button onClick={addImage} className="bg-green-600 px-4 py-2 rounded">
          Add Image
        </button>
      </div>

      {/* PREVIEW */}

      <h2 className="text-xl mb-4">Blog Preview</h2>

      <div className="max-w-xl space-y-4 mb-10">
        {contentBlocks.map((block, i) => {
          if (block.type === "paragraph") {
            return <p key={i}>{block.text}</p>;
          }

          if (block.type === "image") {
            return <img key={i} src={block.src} className="rounded" />;
          }

          return null;
        })}
      </div>

      <button
        onClick={saveTrek}
        className="bg-yellow-600 px-6 py-2 rounded mb-12"
      >
        {editingId ? "Update Trek" : "Create Trek"}
      </button>

      {/* TREK LIST */}

      <h2 className="text-2xl mb-6">Existing Treks</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {treks.map((trek) => (
          <div key={trek._id} className="bg-[#1a2c35] p-4 rounded-lg">
            <img
              src={trek.imageUrl}
              className="h-40 w-full object-cover rounded"
            />

            <h3 className="mt-3 font-bold">{trek.title}</h3>

            <p className="text-yellow-400 text-sm mt-1">
              ₹{trek.price} {trek.discount ? `( ${trek.discount}% OFF )` : ""}
            </p>

            <button
              onClick={() => startEdit(trek)}
              className="mt-3 bg-blue-600 px-4 py-2 rounded mr-2"
            >
              Edit
            </button>

            <button
              onClick={() => deleteTrek(trek._id)}
              className="mt-3 bg-red-600 px-4 py-2 rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
