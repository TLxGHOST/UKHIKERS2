import { useEffect, useState } from "react";
import api from "../api/axios";

const AdminTreks = () => {
  const [treks, setTreks] = useState([]);
  const [slots, setSlots] = useState({});
  const [loading, setLoading] = useState(true);

  // Add Trek form
  const [showAddTrek, setShowAddTrek] = useState(false);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [difficulty, setDifficulty] = useState("moderate");
  const [duration, setDuration] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // Edit Trek form
  const [editingTrek, setEditingTrek] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDifficulty, setEditDifficulty] = useState("moderate");
  const [editDuration, setEditDuration] = useState("");
  const [editExcerpt, setEditExcerpt] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");

  // 🆕 Content Builder for Add Trek
  const [contentBlocks, setContentBlocks] = useState([]);
  const [editContentBlocks, setEditContentBlocks] = useState([]);

  // Add Slot form
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [selectedTrek, setSelectedTrek] = useState("");
  const [slotDate, setSlotDate] = useState("");
  const [totalSeats, setTotalSeats] = useState("");

  // Fetch all treks
  const fetchTreks = async () => {
    try {
      const res = await api.get("/blogs");
      setTreks(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch treks:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch slots for a specific trek
  const fetchSlots = async (trekId) => {
    try {
      const res = await api.get(`/slots/trek/${trekId}`);
      setSlots((prev) => ({
        ...prev,
        [trekId]: res.data.data || [],
      }));
    } catch (err) {
      console.error("Failed to fetch slots:", err);
    }
  };

  useEffect(() => {
    fetchTreks();
  }, []);

  useEffect(() => {
    treks.forEach((trek) => {
      fetchSlots(trek._id);
    });
  }, [treks]);

  // 🆕 Content Block Helpers
  const addContentBlock = (type, isEdit = false) => {
    const newBlock = {
      type,
      text: type !== "image" ? "" : "",
      src: type === "image" ? "" : undefined,
      alt: type === "image" ? "" : undefined,
      caption: type === "image" ? "" : undefined,
    };

    if (isEdit) {
      setEditContentBlocks([...editContentBlocks, newBlock]);
    } else {
      setContentBlocks([...contentBlocks, newBlock]);
    }
  };

  const updateContentBlock = (index, field, value, isEdit = false) => {
    if (isEdit) {
      const updated = [...editContentBlocks];
      updated[index] = { ...updated[index], [field]: value };
      setEditContentBlocks(updated);
    } else {
      const updated = [...contentBlocks];
      updated[index] = { ...updated[index], [field]: value };
      setContentBlocks(updated);
    }
  };

  const removeContentBlock = (index, isEdit = false) => {
    if (isEdit) {
      setEditContentBlocks(editContentBlocks.filter((_, i) => i !== index));
    } else {
      setContentBlocks(contentBlocks.filter((_, i) => i !== index));
    }
  };

  const moveContentBlock = (index, direction, isEdit = false) => {
    const blocks = isEdit ? [...editContentBlocks] : [...contentBlocks];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    [blocks[index], blocks[newIndex]] = [blocks[newIndex], blocks[index]];

    if (isEdit) {
      setEditContentBlocks(blocks);
    } else {
      setContentBlocks(blocks);
    }
  };

  // Add new trek
  const handleAddTrek = async (e) => {
    e.preventDefault();
    try {
      await api.post("/blogs", {
        title,
        price: Number(price),
        difficulty,
        duration,
        excerpt,
        imageUrl,
        content: contentBlocks,
        location: "Uttarakhand",
        tags: ["trekking"],
      });

      alert("Trek added successfully!");
      setShowAddTrek(false);
      setTitle("");
      setPrice("");
      setDifficulty("moderate");
      setDuration("");
      setExcerpt("");
      setImageUrl("");
      setContentBlocks([]);
      fetchTreks();
    } catch (err) {
      console.error("Failed to add trek:", err);
      alert(
        "Failed to add trek. Error: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  // Edit trek
  const handleEditTrek = (trek) => {
    setEditingTrek(trek._id);
    setEditTitle(trek.title);
    setEditPrice(trek.price);
    setEditDifficulty(trek.difficulty || "moderate");
    setEditDuration(trek.duration);
    setEditExcerpt(trek.excerpt || "");
    setEditImageUrl(trek.imageUrl || "");
    setEditContentBlocks(trek.content || []);
  };

  // Save edited trek
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/blogs/${editingTrek}`, {
        title: editTitle,
        price: Number(editPrice),
        difficulty: editDifficulty,
        duration: editDuration,
        excerpt: editExcerpt,
        imageUrl: editImageUrl,
        content: editContentBlocks,
      });

      alert("Trek updated successfully!");
      setEditingTrek(null);
      setEditContentBlocks([]);
      fetchTreks();
    } catch (err) {
      console.error("Failed to update trek:", err);
      alert(
        "Failed to update trek. Error: " +
          (err.response?.data?.message || err.message),
      );
    }
  };

  // Delete trek
  const handleDeleteTrek = async (trekId) => {
    if (
      !confirm(
        "Are you sure you want to delete this trek? This will also affect associated slots and bookings.",
      )
    )
      return;

    try {
      await api.delete(`/blogs/${trekId}`);
      alert("Trek deleted successfully!");
      fetchTreks();
    } catch (err) {
      console.error("Failed to delete trek:", err);
      alert("Failed to delete trek");
    }
  };

  // Add new slot
  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!selectedTrek || !slotDate || !totalSeats) {
      alert("Please fill all fields");
      return;
    }

    try {
      await api.post("/slots", {
        trekId: selectedTrek,
        date: slotDate,
        totalSeats: Number(totalSeats),
      });

      alert("Slot added successfully!");
      setShowAddSlot(false);
      setSlotDate("");
      setTotalSeats("");
      setSelectedTrek("");
      fetchSlots(selectedTrek);
    } catch (err) {
      console.error("Failed to add slot:", err);
      alert("Failed to add slot");
    }
  };

  // Delete slot
  const handleDeleteSlot = async (slotId, trekId) => {
    if (!confirm("Delete this slot?")) return;

    try {
      await api.delete(`/slots/${slotId}`);
      fetchSlots(trekId);
    } catch (err) {
      console.error("Failed to delete slot:", err);
    }
  };

  // Render content block preview
  const renderBlockPreview = (block, index, isEdit = false) => {
    switch (block.type) {
      case "paragraph":
        return (
          <div className="flex items-start space-x-2 mb-2 p-2 bg-gray-50 rounded">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Text
            </span>
            <p className="text-sm text-gray-700 flex-1">
              {block.text?.substring(0, 80) || "Empty paragraph"}
            </p>
          </div>
        );
      case "heading":
        return (
          <div className="flex items-start space-x-2 mb-2 p-2 bg-gray-50 rounded">
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
              H2
            </span>
            <h3 className="text-sm font-bold text-gray-700 flex-1">
              {block.text || "Empty heading"}
            </h3>
          </div>
        );
      case "subheading":
        return (
          <div className="flex items-start space-x-2 mb-2 p-2 bg-gray-50 rounded">
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              H3
            </span>
            <h4 className="text-sm font-semibold text-gray-700 flex-1">
              {block.text || "Empty subheading"}
            </h4>
          </div>
        );
      case "image":
        return (
          <div className="flex items-start space-x-2 mb-2 p-2 bg-gray-50 rounded">
            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
              IMG
            </span>
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                {block.src || "No image URL"}
              </p>
              {block.caption && (
                <p className="text-xs text-gray-500 italic">{block.caption}</p>
              )}
            </div>
          </div>
        );
      case "list":
        return (
          <div className="flex items-start space-x-2 mb-2 p-2 bg-gray-50 rounded">
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              List
            </span>
            <p className="text-sm text-gray-700 flex-1">
              {block.items?.length || 0} items
            </p>
          </div>
        );
      case "conclusion":
        return (
          <div className="flex items-start space-x-2 mb-2 p-2 bg-gray-50 rounded">
            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
              End
            </span>
            <p className="text-sm text-gray-700 flex-1">
              {block.text?.substring(0, 80) || "Empty conclusion"}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return <div className="p-6">Loading treks...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Treks & Slots Management
        </h1>

        <div className="space-x-3">
          <button
            onClick={() => setShowAddTrek(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            + Add Trek
          </button>
          <button
            onClick={() => setShowAddSlot(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Add Slot
          </button>
        </div>
      </div>

      {/* ============= ADD TREK MODAL ============= */}
      {showAddTrek && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-10">
          <div className="bg-white p-6 rounded-lg w-[700px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-black">Add New Trek</h2>
            <form onSubmit={handleAddTrek} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Title *"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border p-2 rounded text-black"
                  required
                />
                <input
                  type="number"
                  placeholder="Price *"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full border p-2 rounded text-black"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full border p-2 rounded text-black"
                >
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="difficult">Difficult</option>
                </select>
                <input
                  type="text"
                  placeholder="Duration (e.g., 3 days) *"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full border p-2 rounded text-black"
                  required
                />
              </div>

              <textarea
                placeholder="Excerpt (short description)"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full border p-2 rounded text-black"
                rows="2"
              />

              <input
                type="text"
                placeholder="Main Image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full border p-2 rounded text-black"
              />

              {/* 🆕 CONTENT BUILDER */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-black">Content Builder</h3>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={() => addContentBlock("paragraph")}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      + Text
                    </button>
                    <button
                      type="button"
                      onClick={() => addContentBlock("heading")}
                      className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200"
                    >
                      + Heading
                    </button>
                    <button
                      type="button"
                      onClick={() => addContentBlock("subheading")}
                      className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                    >
                      + Subheading
                    </button>
                    <button
                      type="button"
                      onClick={() => addContentBlock("image")}
                      className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200"
                    >
                      + Image
                    </button>
                    <button
                      type="button"
                      onClick={() => addContentBlock("list")}
                      className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200"
                    >
                      + List
                    </button>
                    <button
                      type="button"
                      onClick={() => addContentBlock("conclusion")}
                      className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                    >
                      + Conclusion
                    </button>
                  </div>
                </div>

                {contentBlocks.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No content blocks yet. Click a button above to add content.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {contentBlocks.map((block, index) => (
                      <div
                        key={index}
                        className="border rounded p-3 bg-gray-50"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold uppercase text-gray-600">
                            {block.type} #{index + 1}
                          </span>
                          <div className="space-x-1">
                            <button
                              type="button"
                              onClick={() => moveContentBlock(index, -1)}
                              disabled={index === 0}
                              className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => moveContentBlock(index, 1)}
                              disabled={index === contentBlocks.length - 1}
                              className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => removeContentBlock(index)}
                              className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {block.type === "paragraph" ||
                        block.type === "conclusion" ? (
                          <textarea
                            placeholder={`Enter ${block.type} text...`}
                            value={block.text}
                            onChange={(e) =>
                              updateContentBlock(index, "text", e.target.value)
                            }
                            className="w-full border p-2 rounded text-black text-sm"
                            rows="3"
                          />
                        ) : block.type === "heading" ||
                          block.type === "subheading" ? (
                          <input
                            type="text"
                            placeholder={`Enter ${block.type}...`}
                            value={block.text}
                            onChange={(e) =>
                              updateContentBlock(index, "text", e.target.value)
                            }
                            className="w-full border p-2 rounded text-black text-sm"
                          />
                        ) : block.type === "image" ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Image URL"
                              value={block.src}
                              onChange={(e) =>
                                updateContentBlock(index, "src", e.target.value)
                              }
                              className="w-full border p-2 rounded text-black text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Alt text"
                              value={block.alt}
                              onChange={(e) =>
                                updateContentBlock(index, "alt", e.target.value)
                              }
                              className="w-full border p-2 rounded text-black text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Caption (optional)"
                              value={block.caption}
                              onChange={(e) =>
                                updateContentBlock(
                                  index,
                                  "caption",
                                  e.target.value,
                                )
                              }
                              className="w-full border p-2 rounded text-black text-sm"
                            />
                          </div>
                        ) : block.type === "list" ? (
                          <textarea
                            placeholder="Enter list items (one per line)"
                            value={block.items?.join("\n") || ""}
                            onChange={(e) =>
                              updateContentBlock(
                                index,
                                "items",
                                e.target.value.split("\n"),
                              )
                            }
                            className="w-full border p-2 rounded text-black text-sm"
                            rows="4"
                          />
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-2 pt-3">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Save Trek
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddTrek(false);
                    setContentBlocks([]);
                  }}
                  className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============= EDIT TREK MODAL ============= */}
      {editingTrek && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto py-10">
          <div className="bg-white p-6 rounded-lg w-[700px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-black">Edit Trek</h2>
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Title *"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full border p-2 rounded text-black"
                  required
                />
                <input
                  type="number"
                  placeholder="Price *"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full border p-2 rounded text-black"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={editDifficulty}
                  onChange={(e) => setEditDifficulty(e.target.value)}
                  className="w-full border p-2 rounded text-black"
                >
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="difficult">Difficult</option>
                </select>
                <input
                  type="text"
                  placeholder="Duration *"
                  value={editDuration}
                  onChange={(e) => setEditDuration(e.target.value)}
                  className="w-full border p-2 rounded text-black"
                  required
                />
              </div>

              <textarea
                placeholder="Excerpt"
                value={editExcerpt}
                onChange={(e) => setEditExcerpt(e.target.value)}
                className="w-full border p-2 rounded text-black"
                rows="2"
              />

              <input
                type="text"
                placeholder="Main Image URL"
                value={editImageUrl}
                onChange={(e) => setEditImageUrl(e.target.value)}
                className="w-full border p-2 rounded text-black"
              />

              {/* 🆕 EDIT CONTENT BUILDER */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-black">Content Builder</h3>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={() => addContentBlock("paragraph", true)}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      + Text
                    </button>
                    <button
                      type="button"
                      onClick={() => addContentBlock("heading", true)}
                      className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200"
                    >
                      + Heading
                    </button>
                    <button
                      type="button"
                      onClick={() => addContentBlock("subheading", true)}
                      className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                    >
                      + Subheading
                    </button>
                    <button
                      type="button"
                      onClick={() => addContentBlock("image", true)}
                      className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded hover:bg-orange-200"
                    >
                      + Image
                    </button>
                    <button
                      type="button"
                      onClick={() => addContentBlock("list", true)}
                      className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded hover:bg-yellow-200"
                    >
                      + List
                    </button>
                    <button
                      type="button"
                      onClick={() => addContentBlock("conclusion", true)}
                      className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
                    >
                      + Conclusion
                    </button>
                  </div>
                </div>

                {editContentBlocks.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No content blocks. Click a button above to add content.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {editContentBlocks.map((block, index) => (
                      <div
                        key={index}
                        className="border rounded p-3 bg-gray-50"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold uppercase text-gray-600">
                            {block.type} #{index + 1}
                          </span>
                          <div className="space-x-1">
                            <button
                              type="button"
                              onClick={() => moveContentBlock(index, -1, true)}
                              disabled={index === 0}
                              className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => moveContentBlock(index, 1, true)}
                              disabled={index === editContentBlocks.length - 1}
                              className="text-xs px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => removeContentBlock(index, true)}
                              className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        {block.type === "paragraph" ||
                        block.type === "conclusion" ? (
                          <textarea
                            placeholder={`Enter ${block.type} text...`}
                            value={block.text}
                            onChange={(e) =>
                              updateContentBlock(
                                index,
                                "text",
                                e.target.value,
                                true,
                              )
                            }
                            className="w-full border p-2 rounded text-black text-sm"
                            rows="3"
                          />
                        ) : block.type === "heading" ||
                          block.type === "subheading" ? (
                          <input
                            type="text"
                            placeholder={`Enter ${block.type}...`}
                            value={block.text}
                            onChange={(e) =>
                              updateContentBlock(
                                index,
                                "text",
                                e.target.value,
                                true,
                              )
                            }
                            className="w-full border p-2 rounded text-black text-sm"
                          />
                        ) : block.type === "image" ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              placeholder="Image URL"
                              value={block.src}
                              onChange={(e) =>
                                updateContentBlock(
                                  index,
                                  "src",
                                  e.target.value,
                                  true,
                                )
                              }
                              className="w-full border p-2 rounded text-black text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Alt text"
                              value={block.alt}
                              onChange={(e) =>
                                updateContentBlock(
                                  index,
                                  "alt",
                                  e.target.value,
                                  true,
                                )
                              }
                              className="w-full border p-2 rounded text-black text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Caption (optional)"
                              value={block.caption}
                              onChange={(e) =>
                                updateContentBlock(
                                  index,
                                  "caption",
                                  e.target.value,
                                  true,
                                )
                              }
                              className="w-full border p-2 rounded text-black text-sm"
                            />
                          </div>
                        ) : block.type === "list" ? (
                          <textarea
                            placeholder="Enter list items (one per line)"
                            value={block.items?.join("\n") || ""}
                            onChange={(e) =>
                              updateContentBlock(
                                index,
                                "items",
                                e.target.value.split("\n"),
                                true,
                              )
                            }
                            className="w-full border p-2 rounded text-black text-sm"
                            rows="4"
                          />
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex space-x-2 pt-3">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingTrek(null);
                    setEditContentBlocks([]);
                  }}
                  className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============= ADD SLOT MODAL ============= */}
      {showAddSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4 text-black">Add New Slot</h2>
            <form onSubmit={handleAddSlot} className="space-y-3">
              <select
                value={selectedTrek}
                onChange={(e) => setSelectedTrek(e.target.value)}
                className="w-full border p-2 rounded text-black"
                required
              >
                <option value="">Select Trek</option>
                {treks.map((trek) => (
                  <option key={trek._id} value={trek._id}>
                    {trek.title}
                  </option>
                ))}
              </select>
              <input
                type="date"
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
                className="w-full border p-2 rounded text-black"
                required
              />
              <input
                type="number"
                placeholder="Total Seats"
                value={totalSeats}
                onChange={(e) => setTotalSeats(e.target.value)}
                className="w-full border p-2 rounded text-black"
                required
              />

              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add Slot
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSlot(false)}
                  className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============= TREKS LIST ============= */}
      <div className="space-y-6">
        {treks.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No treks found. Click "+ Add Trek" to create one.
          </div>
        ) : (
          treks.map((trek) => (
            <div key={trek._id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start space-x-4">
                  {trek.imageUrl && (
                    <img
                      src={trek.imageUrl}
                      alt={trek.title}
                      className="w-24 h-16 object-cover rounded"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-black">
                      {trek.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      ₹{trek.price} | {trek.difficulty} | {trek.duration}
                    </p>
                    {trek.excerpt && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        {trek.excerpt}
                      </p>
                    )}
                    {trek.content && trek.content.length > 0 && (
                      <p className="text-xs text-blue-600 mt-1">
                        {trek.content.length} content block(s)
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditTrek(trek)}
                    className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTrek(trek._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Slots for this trek */}
              <div className="border-t pt-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium text-black">Slots:</h4>
                  <button
                    onClick={() => {
                      setSelectedTrek(trek._id);
                      setShowAddSlot(true);
                    }}
                    className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                  >
                    + Add Slot
                  </button>
                </div>
                {slots[trek._id]?.length > 0 ? (
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-600 border-b">
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Total</th>
                        <th className="pb-2">Booked</th>
                        <th className="pb-2">Available</th>
                        <th className="pb-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {slots[trek._id].map((slot) => (
                        <tr key={slot._id} className="text-sm border-b">
                          <td className="py-2 text-black">
                            {new Date(slot.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-2 text-black">{slot.totalSeats}</td>
                          <td className="py-2 text-black">
                            {slot.bookedSeats}
                          </td>
                          <td className="py-2">
                            <span
                              className={`font-medium ${
                                slot.totalSeats - slot.bookedSeats > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {slot.totalSeats - slot.bookedSeats}
                            </span>
                          </td>
                          <td className="py-2">
                            <button
                              onClick={() =>
                                handleDeleteSlot(slot._id, trek._id)
                              }
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-gray-500 py-2">
                    No slots added yet
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminTreks;
