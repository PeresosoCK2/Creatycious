import { useParams } from 'react-router-dom';
import AdForm from '../../components/AdForm';

export default function EditAd() {
  const { id } = useParams();
  return <AdForm adId={id} title="Editar Anuncio" submitLabel="Guardar Cambios" />;
}
