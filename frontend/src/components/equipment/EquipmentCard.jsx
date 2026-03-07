// src/components/equipment/EquipmentCard.jsx
import React from 'react';

const EquipmentCard = ({ item }) => {
  return (
    <div className="bg-[#1a2c35] rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-[1.02]">
      <div className="h-64 overflow-hidden relative bg-[#1a2c35]">
        <div className="absolute inset-0 flex items-center justify-center text-yellow-500">
          <i className="fas fa-campground text-4xl"></i>
        </div>
        <div className="w-full h-full bg-gradient-to-br from-[#0b1d26] to-[#1a2c35] opacity-70 transition-transform duration-500 hover:scale-110"></div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-bold text-white">{item.name}</h3>
          <span className="text-yellow-500 font-bold">  ₹{item.price.toFixed(2)}</span>
        </div>
        <p className="text-sm mb-4 text-gray-300">{item.description}</p>
        <div className="flex items-center justify-between">
          <span className="inline-block px-2 py-1 text-xs bg-[#0b1d26] rounded-md text-gray-300 capitalize">
            {item.category}
          </span>
          <button className="px-4 py-2 bg-yellow-600 text-white text-sm rounded-md transition-colors hover:bg-yellow-700">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentCard;