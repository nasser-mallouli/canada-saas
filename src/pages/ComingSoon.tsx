import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';

interface ComingSoonProps {
  title: string;
  description: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        <Badge variant="coming-soon" className="mb-6 text-lg px-6 py-2">
          Coming Soon
        </Badge>
        <h1 className="text-5xl font-bold text-secondary-900 mb-6">{title}</h1>
        <p className="text-xl text-secondary-600 mb-8">{description}</p>
        <p className="text-secondary-500 mb-8">
          We're working hard to bring you this feature. Check back soon!
        </p>
        <Link to="/">
          <Button size="lg">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
