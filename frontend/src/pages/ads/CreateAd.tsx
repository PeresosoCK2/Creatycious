import { useState } from "react";
import { api } from "../../services/api";
import { useNavigate } from "react-router-dom";

export default function CreateAd() {
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api("/ads", {
        method: "POST",
        body: JSON.stringify({ title, description })
      });
      nav("/ads");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create ad");
      }
    }
  }

  return (
    <form onSubmit={submit} className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">Crear Anuncio</h1>

      {error && <div style={{ color: "red" }}>{error}</div>}

      <input
        className="border p-2 w-full"
        placeholder="Titulo"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="border p-2 w-full"
        placeholder="Descripcion"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button className="bg-green-600 text-white px-4 py-2 rounded">
        Guardar
      </button>
    </form>
  );
}
