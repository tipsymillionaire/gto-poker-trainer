import TrainerInterface from '@/components/poker/TrainerInterface';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-12">
      <h1 className="text-2xl md:text-4xl font-bold mb-6 md:mb-10 text-white tracking-tight">
        GTO Preflop Trainer 
      </h1>
      {/* Render the client component that handles all the interaction */}
      <TrainerInterface initialStack={40} />
    </main>
  );
}