function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">
        IVR Analytics Portal - Tailwind Test
      </h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-red-500 text-white p-4 rounded shadow">
          Red
        </div>
        <div className="bg-green-500 text-white p-4 rounded shadow">
          Green
        </div>
        <div className="bg-blue-500 text-white p-4 rounded shadow">
          Blue
        </div>
        <div className="bg-yellow-500 text-white p-4 rounded shadow">
          Yellow
        </div>
        <div className="bg-purple-500 text-white p-4 rounded shadow">
          Purple
        </div>
        <div className="bg-pink-500 text-white p-4 rounded shadow">
          Pink
        </div>
        <div className="bg-indigo-500 text-white p-4 rounded shadow">
          Indigo
        </div>
        <div className="bg-teal-500 text-white p-4 rounded shadow">
          Teal
        </div>
      </div>
      <div className="mt-8 text-center text-gray-700">
        <p className="text-lg">If you see colored boxes above, Tailwind is working!</p>
      </div>
    </div>
  );
}

export default App;