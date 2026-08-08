import { Link } from 'react-router-dom';
import { ArrowLeft, Map } from 'lucide-react';
import { useDocumentTitle } from '@/lib/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Page not found');

  return (
    <section className="lattice-bg flex min-h-[70vh] items-center px-6 py-20 md:px-8">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-ink-600 bg-ink-850/95 p-8 md:p-12">
        <p className="eyebrow text-syndrome">// 404 · LOST ON THE LATTICE</p>
        <h1 className="mt-4 font-display text-4xl font-bold text-text-hi md:text-5xl">That route is not in the map.</h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-text-mid">
          The shared link may be old or mistyped. Your locally stored learning progress has not been changed.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/" className="btn-primary">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Home
          </Link>
          <Link to="/map" className="btn-secondary">
            <Map className="h-4 w-4" aria-hidden="true" /> Knowledge map
          </Link>
        </div>
      </div>
    </section>
  );
}
