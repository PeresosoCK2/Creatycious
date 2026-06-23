import { useState } from "react";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function CreateAd() {
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await api("/ads", {
      method: "POST",
      body: JSON.stringify({ title: title.trim(), description: description.trim() })
    });
    nav("/ads");
  }

  return (
    <form onSubmit={submit} className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">Crear Anuncio</h1>
      <input
        className="border p-2 w-full"
        placeholder="Titulo"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={200}
        required
      />
      <textarea
        className="border p-2 w-full"
        placeholder="Descripcion"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        maxLength={5000}
      />

      <button className="bg-green-600 text-white px-4 py-2 rounded">
        Guardar
      </button>
    </form>
  );
}
