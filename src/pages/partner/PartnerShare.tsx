import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

// Minimalista page for screenshot - CSS fixo, sem menus
export default function PartnerShare() {
  const { token } = useParams();

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '2rem', 
      backgroundColor: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <Card style={{ maxWidth: '600px', margin: '0 auto' }}>
        <CardContent style={{ padding: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            Compartilhar Link de Parceiro
          </h1>
          <p style={{ color: '#666', marginBottom: '1rem' }}>
            Token: {token}
          </p>
          <p style={{ color: '#666' }}>
            Esta é uma página minimalista para compartilhamento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

