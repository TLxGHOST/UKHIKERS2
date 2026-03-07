// src/components/about/TeamMember.jsx
import React from 'react';

const TeamMember = ({ member }) => {
  return (
    <div className="bg-[#1a2c35] rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-[1.02]">
      <div className="h-64 overflow-hidden relative bg-[#1a2c35]">
        <img
          src={member.imageUrl}
          alt={member.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/assets/images/about/team1.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1d26] to-transparent"></div>
      </div>
      <div className="p-5">
        <h3 className="text-xl font-bold text-white mb-1">{member.name}</h3>
        <span className="text-yellow-500 text-sm block mb-3">{member.role}</span>
        <p className="text-sm text-gray-300">{member.bio}</p>

        <div className="mt-4 flex space-x-3">
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <i className="fab fa-linkedin"></i>
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">
            <i className="fas fa-envelope"></i>
          </a>
        </div>
      </div>
    </div>
  );
};

export default TeamMember;