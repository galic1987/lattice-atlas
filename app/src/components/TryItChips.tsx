/**
 * "// TRY IT IN THE LAB" chips — link a topic drawer to the workbench tool
 * where the learner can practice that topic (src/lib/topicTools.ts registry).
 */
import { Link } from 'react-router-dom';
import { FlaskConical, ArrowRight } from 'lucide-react';
import { TOPIC_TOOLS } from '@/lib/topicTools';

export default function TryItChips({ topicId }: { topicId: string }) {
  const links = TOPIC_TOOLS[topicId];
  if (!links) return null;
  return (
    <div className="mt-5">
      <span className="font-mono text-[10px] uppercase tracking-wider text-text-low">
        // Try it in the lab
      </span>
      <div className="mt-2 flex flex-col gap-2">
        {links.map((link) => (
          <Link
            key={link.tool}
            to={`/lab?tab=${link.tool}`}
            className="group flex items-center gap-2.5 rounded-lg border border-plaquette/30 bg-plaquette/5 px-3.5 py-2.5 text-[13px] text-text-mid transition-colors hover:border-plaquette/60 hover:bg-plaquette/10 hover:text-text-hi"
          >
            <FlaskConical className="h-4 w-4 shrink-0 text-plaquette" />
            <span>
              <strong className="font-semibold text-text-hi">{link.label}.</strong> {link.task}
            </span>
            <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 text-text-low transition-transform group-hover:translate-x-0.5 group-hover:text-plaquette" />
          </Link>
        ))}
      </div>
    </div>
  );
}
