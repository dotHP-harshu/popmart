function Skeleton({ variant = 'card' }: { variant?: 'card' | 'list' | 'stats' }) {
  if (variant === 'stats') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white border-2 border-black p-6 animate-pulse">
            <div className="h-4 bg-gray-200 w-20 mb-3" />
            <div className="h-8 bg-gray-200 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border-2 border-black p-4 flex items-center gap-4 animate-pulse">
            <div className="h-10 w-10 bg-gray-200" />
            <div className="flex-1">
              <div className="h-4 bg-gray-200 w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white border-2 border-black overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-200" />
          <div className="p-4">
            <div className="h-4 bg-gray-200 w-3/4 mb-2" />
            <div className="h-3 bg-gray-200 w-1/2 mb-3" />
            <div className="h-8 bg-gray-200 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
