import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useParams, useNavigate } from "react-router-dom";

export default function EditAd() {
  const { id } = useParams();
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!id || isNaN(Number(id))) return;
    api(`/ads/${id}`).then((ad) => {
      setTitle(ad.title);
      setDescription(ad.description);
    });
  }, [id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await api(`/ads/${id}`, {
      method: "PUT",
      body: JSON.stringify({ title: title.trim(), description: description.trim() })
    });
    nav("/ads");
  }

  return (
    <form onSubmit={submit} className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">Editar Anuncio</h1>

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

      <button className="bg-blue-600 text-white px-4 py-2 rounded">
        Guardar Cambios
      </button>
    </form>
  );
}
