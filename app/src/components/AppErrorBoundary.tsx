import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  resetKey?: string;
}

interface State {
  failed: boolean;
}

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Lattice Atlas route failed to render', error, info);
  }

  componentDidUpdate(previous: Props) {
    if (this.state.failed && previous.resetKey !== this.props.resetKey) {
      this.setState({ failed: false });
    }
  }

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <main className="flex min-h-screen items-center justify-center bg-ink-900 px-6 text-center text-text-mid">
        <div className="max-w-lg rounded-2xl border border-syndrome/40 bg-ink-850 p-8">
          <p className="eyebrow text-syndrome">// RENDERING ERROR</p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-text-hi">This page did not load.</h1>
          <p className="mt-4 leading-7">
            Your local progress is still stored in this browser. Reload the page, or return to the learning map.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button type="button" className="btn-primary" onClick={() => window.location.reload()}>
              Reload page
            </button>
            <a className="btn-secondary" href={import.meta.env.BASE_URL}>
              Return home
            </a>
          </div>
        </div>
      </main>
    );
  }
}
