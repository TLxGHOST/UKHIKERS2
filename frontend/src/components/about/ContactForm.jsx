// src/components/about/ContactForm.jsx
import React, { useState } from 'react';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, send the form data to a server here
    console.log('Form submitted:', formData);
    setFormSubmitted(true);

    // Reset form after submission
    setTimeout(() => {
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setFormSubmitted(false);
    }, 3000);
  };

  return (
    <div className="bg-[#1a2c35] p-6 rounded-xl">
      <h3 className="text-xl font-bold mb-4 text-white">Send Us a Message</h3>

      {formSubmitted ? (
        <div className="bg-green-800 text-white p-4 rounded-lg">
          <p>Thank you for your message! We'll get back to you soon.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium mb-1">Your Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#0b1d26] border border-[#273d47] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-600"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#0b1d26] border border-[#273d47] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-600"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="subject" className="block text-sm font-medium mb-1">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-[#0b1d26] border border-[#273d47] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-600"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="4"
              className="w-full px-4 py-2 bg-[#0b1d26] border border-[#273d47] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-yellow-600 resize-none"
              required
            ></textarea>
          </div>

          <button type="submit" className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-medium rounded-md transition-colors">
            Send Message
          </button>
        </form>
      )}
    </div>
  );
};

export default ContactForm;