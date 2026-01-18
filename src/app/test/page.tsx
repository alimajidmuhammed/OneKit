export default function TestPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-4xl font-bold text-primary-900 mb-4">
        Tailwind Test Page
      </h1>
      
      <div className="bg-primary-500 text-white p-6 rounded-lg mb-4">
        Primary Color Box
      </div>
      
      <div className="bg-accent-500 text-white p-6 rounded-lg mb-4">
        Accent Color Box
      </div>
      
      <button className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700">
        Launch Enterprise Editor
      </button>
      
      <div className="mt-8 p-6 border border-gray-200 rounded-lg">
        <p className="text-lg">If you see colors and proper text, Tailwind works!</p>
      </div>
    </div>
  )
}
