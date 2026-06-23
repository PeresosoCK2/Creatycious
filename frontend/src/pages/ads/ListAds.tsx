import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

interface Ad {
  id: number;
  title: string;
  description: string;
}

export default function ListAds() {
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    api<Ad[]>('/ads').then(setAds).catch(console.error);
  }, []);

  async function deleteAd(id: number) {
    if (!confirm('Eliminar anuncio?')) return;
    await api(`/ads/${id}`, { method: 'DELETE' });
    setAds(prev => prev.filter(a => a.id !== id));
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Mis anuncios</h1>
      <Link to="/ads/create" className="bg-blue-600 text-white px-4 py-2 rounded">
        Crear anuncio
      </Link>

      <ul className="mt-4 space-y-3">
        {ads.map(ad => (
          <li key={ad.id} className="p-3 border rounded flex justify-between">
            <div>
              <h3 className="font-semibold">{ad.title}</h3>
              <p className="opacity-70 text-sm">{ad.description}</p>
            </div>
            <div className="flex gap-2">
              <Link
                to={`/ads/edit/${ad.id}`}
                className="px-3 py-1 bg-yellow-500 text-white rounded"
              >
                Editar
              </Link>
              <button
                onClick={() => deleteAd(ad.id)}
                className="px-3 py-1 bg-red-600 text-white rounded"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
