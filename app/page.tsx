import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <h1 className="text-4xl font-bold text-blue-600 mb-8">Create Your Own DTF Transfer Design</h1>
      <p className="text-xl text-gray-700 mb-10 max-w-2xl text-center">
        Create your custom design with our Picsart editor and order it as a DTF Transfer print.
      </p>
      <Link 
        href="/editor" 
        className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-8 rounded-lg font-semibold text-lg transition-colors"
      >
        Start Design Editor
      </Link>
    </main>
  );
}
