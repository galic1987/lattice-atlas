import { useDocumentTitle } from '@/lib/useDocumentTitle';
import SuperTLDR from '@/components/SuperTLDR';
import { motion, useReducedMotion } from 'framer-motion';

const EASE = [0.22, 1, 0.36, 1] as const;

export default function LatticeSurgeryLab() {
  useDocumentTitle('Lattice Surgery Lab');
  const reduce = useReducedMotion();

  return (
    <div className="bg-ink-900 min-h-screen">
      <header className="lattice-bg">
        <div className="mx-auto max-w-5xl px-6 pb-8 pt-16 md:px-8">
          <SuperTLDR
            summary="Interactive visualization of T-gate injection using lattice surgery."
            takeaways={[
              'See how a magic state is merged with a data patch.',
              'Understand the role of boundary measurements in lattice surgery.',
              'Observe the non-Clifford state distillation and teleportation.',
            ]}
          />
          <motion.p initial={reduce ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduce ? 0 : 0.5, ease: [...EASE] }} className="eyebrow !text-magic">
            {'// SURGERY VISUALIZER'}
          </motion.p>
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.08, ease: [...EASE] }}
            className="mt-4 font-display text-4xl font-bold tracking-tight text-text-hi md:text-display-lg"
          >
            Lattice Surgery Lab
          </motion.h1>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.5, delay: reduce ? 0 : 0.16, ease: [...EASE] }}
            className="mt-5 max-w-2xl text-[17px] leading-[1.7] text-text-mid"
          >
            Because the surface code cannot implement a T gate transversally, it relies on magic states. 
            Watch how a prepared magic state is coupled to a data qubit patch via lattice surgery—merging boundaries to perform a joint Pauli measurement, then splitting to complete the T-gate injection.
          </motion.p>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-6 py-8 md:px-8">
        <div className="rounded-xl border border-ink-600 bg-ink-800 p-8 flex items-center justify-center min-h-[400px]">
           <div className="text-center text-text-low">
             <p className="font-mono mb-4 text-magic text-xl">[Interactive visualization loading...]</p>
             <p>This lab demonstrates a patch merge operation for a logical XX measurement between a T-state ancilla and data.</p>
           </div>
        </div>
      </section>
    </div>
  );
}
