import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useParams, useNavigate } from "react-router-dom";

export default function EditAd() {
  const { id } = useParams();
  const nav = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api(`/ads/${id}`)
      .then((ad) => {
        setTitle(ad.title);
        setDescription(ad.description);
      })
      .catch((err: Error) => setError(`Failed to load ad: ${err.message}`))
      .finally(() => setLoading(false));
  }, [id]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api(`/ads/${id}`, {
        method: "PUT",
        body: JSON.stringify({ title, description })
      });
      nav("/ads");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update ad");
      }
    }
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <form onSubmit={submit} className="p-6 max-w-xl mx-auto space-y-4">
      <h1 className="text-xl font-bold">Editar Anuncio</h1>

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

      <button className="bg-blue-600 text-white px-4 py-2 rounded">
        Guardar Cambios
      </button>
    </form>
  );
}
