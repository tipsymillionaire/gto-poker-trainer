import TrainerInterface from '@/components/poker/TrainerInterface';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-12 bg-gradient-to-br from-gray-200 to-blue-100">
      <h1 className="text-2xl md:text-4xl font-bold mb-6 md:mb-10 text-gray-800 tracking-tight">
        GTO Preflop Trainer <span className='text-sm font-normal'>(vs Open - 40bb)</span>
      </h1>
      {/* Render the client component that handles all the interaction */}
      <TrainerInterface initialStack={40} />
    </main>
  );
}