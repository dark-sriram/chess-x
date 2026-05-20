import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl mb-6 opacity-30">♟</div>
      <h1 className="font-serif text-4xl font-bold mb-3">Page Not Found</h1>
      <p className="text-cm-muted mb-8 text-lg">Looks like this move was illegal.</p>
      <Link to="/" className="px-6 py-3 bg-cm-accent text-white rounded-xl font-semibold hover:bg-cm-accent-l transition-colors">
        Back to Home
      </Link>
    </div>
  );
}
