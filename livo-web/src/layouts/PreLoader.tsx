
export const PreLoader = () => {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          {/* Logo Livo avec animation */}
          <div className="mb-4">
            <div className="w-20 h-20 bg-primary-500 rounded-full mx-auto flex items-center justify-center">
              <span className="text-white text-2xl font-bold">L</span>
            </div>
          </div>
          
          {/* Animation de loading */}
          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-3 h-3 bg-primary-500 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
          
          {/* Texte de chargement */}
          <p className="mt-4 text-gray-600 font-medium">Chargement de Livo...</p>
        </div>
      </div>
    )
  }