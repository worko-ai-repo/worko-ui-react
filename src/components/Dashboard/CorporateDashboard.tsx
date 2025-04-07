const CorporateDashboard = () => {
    return (
        
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((card) => (
          <div
            key={card}
            className="bg-white rounded-lg shadow p-4 text-center"
          >
            <h2 className="text-xl font-bold mb-2">Card {card}</h2>
            <p className="text-gray-600">Some info about this section.</p>
          </div>
        ))}
      </div>
    );
  };
  
  export default CorporateDashboard;
  