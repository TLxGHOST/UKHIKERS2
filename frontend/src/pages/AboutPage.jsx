// src/pages/AboutPage.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TeamMember from '../components/about/TeamMember';
import ContactForm from '../components/about/ContactForm';

const AboutPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Team members data
  const teamMembers = [
    {
      id: 1,
      name: "Deepanshu Bhartwal",
      role: "Founder & CEO",
      bio: "With over 5 years of trekking experience across the state , Deepanshu founded UKHIKER with a vision to create dreams that meets the demands of serious mountaineers.",
      imageUrl: "/assets/images/about/team1.jpg"
      // },
      // {
      //   id: 2,
      //   name: "David Ridge",
      //   role: "Head of Product Design",
      //   bio: "David combines his passion for mountains with engineering expertise to design gear that withstands extreme conditions while providing comfort and functionality.",
      //   imageUrl: "/assets/images/about/team2.jpg"
      // },
      // {
      //   id: 3,
      //   name: "Michelle Trekker",
      //   role: "Content Director",
      //   bio: "Former outdoor magazine editor and experienced trail guide, Michelle leads our content strategy and educational initiatives for the mountain community.",
      //   imageUrl: "/assets/images/about/team3.jpg"
      // },
      // {
      //   id: 4,
      //   name: "James Alpine",
      //   role: "Environmental Officer",
      //   bio: "An environmental scientist specializing in alpine ecosystems, James ensures our operations and products minimize impact on the fragile mountain environments we cherish.",
      //   imageUrl: "/assets/images/about/team2.jpg"
      // }
    }
  ];

  // Company milestones
  const milestones = [
    {
      year: 2022,
      title: "Foundation of UKHIKER",
      description: "UKHIKER was established with a focus on creating premium mountain Experience for enthusiasts ."
    },
    {
      year: 2022,
      title: "Group making",
      description: "Our flagship consists of professional mountaineers believing in team work to summit peaks."
    },
    {
      year: 2023,
      title: "Sustainability Initiative",
      description: "Committed to saving environment ."
    },
    {
      year: 2024,
      title: "Expansion",
      description: "UKHIKER has became available all across country supporting adventures on every corner of UTTARAKHAND."
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0b1d26] font-[Inter] text-[#d1d1d1]">
      <Navbar isScrolled={isScrolled} active="About" />

      {/* Hero Section */}
      <div className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-b from-[#0b1d26] via-[#0c2029] to-[#0b1d26]">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 font-[Playfair_Display] text-white">Our Story</h1>
        <p className="max-w-2xl mx-auto text-lg">
          Founded by passionate mountaineers, UKHIKER has grown from a small idea to a what it is now,
          always with one mission: to create exceptional unforgettable mountain experiences.
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Brand Story */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-8 font-[Playfair_Display] text-white relative">
            <span className="inline-block mr-2 text-yellow-500">//</span>
            UKHIKER Philosophy
          </h2>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="h-[400px] relative bg-[#1a2c35] rounded-xl overflow-hidden shadow-lg">
              <img
                src="/assets/images/about/company.jpg"
                alt="Mountain landscape"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-yellow-500 bg-black bg-opacity-50">
                <i className="fas fa-mountain text-6xl mb-4 animate-bounce"></i>
                <h3 className="text-2xl font-bold text-white tracking-wider">UKHIKER</h3>
                <p className="text-sm mt-2 text-gray-300">EST. 2022</p>
              </div>
            </div>
            <div>
              <p className="text-lg mb-6">
                At <span className="text-yellow-500 font-semibold">UKHIKER</span>, we see mountains not just as landscapes, but as living classrooms and sources of inspiration. Every summit, every trail, and every challenge is an opportunity to grow, connect, and discover.
              </p>
              <p className="text-lg mb-6">
                Born in the heart of the Himalayas, our passion for climbing is woven into our story. We noticed that many visitors struggled to find authentic experiences in Uttarakhand, while local enthusiasts lacked guidance and resources. UKHIKER was created to bridge this gap—empowering adventurers of all backgrounds to explore safely, responsibly, and with purpose.
              </p>
              <p className="text-lg mb-6">
                Our philosophy is simple: <span className="text-yellow-500 font-semibold">live, worship, and inspire</span>.
              </p>
              <p className="text-lg">
                Join us as we champion a community built on respect for nature, a spirit of adventure, and a commitment to leaving the mountains better than we found them.
              </p>
            </div>
          </div>
        </div>

        {/* Company Milestones */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-8 font-[Playfair_Display] text-white relative">
            <span className="inline-block mr-2 text-yellow-500">//</span>
            Our Journey
          </h2>

          <div className="relative border-l-2 border-yellow-600 pl-8 ml-4 space-y-12">
            {milestones.map((milestone, index) => (
              <div key={index} className="relative">
                <span className="absolute -left-[42px] flex items-center justify-center w-8 h-8 bg-yellow-600 rounded-full">
                  <span className="w-3 h-3 bg-white rounded-full"></span>
                </span>
                <h3 className="text-xl font-bold text-white">{milestone.year}: {milestone.title}</h3>
                <p className="mt-2">{milestone.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-8 font-[Playfair_Display] text-white relative">
            <span className="inline-block mr-2 text-yellow-500">//</span>
            Our Team
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map(member => (
              <TeamMember key={member.id} member={member} />
            ))}
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold mb-8 font-[Playfair_Display] text-white relative">
            <span className="inline-block mr-2 text-yellow-500">//</span>
            Our Values
          </h2>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-[#1a2c35] p-6 rounded-xl">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0b1d26] rounded-full mb-4">
                <i className="fas fa-mountain text-yellow-500 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Performance</h3>
              <p>We create experience flawlessly in the most challenging conditions, because in the mountains, living isn't just about comfort – it's about safety and survival.</p>
            </div>

            <div className="bg-[#1a2c35] p-6 rounded-xl">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0b1d26] rounded-full mb-4">
                <i className="fas fa-leaf text-yellow-500 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Sustainability</h3>
              <p>We're committed to protecting the wild places we love through responsibilities, and active environmental advocacy.</p>
            </div>

            <div className="bg-[#1a2c35] p-6 rounded-xl">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#0b1d26] rounded-full mb-4">
                <i className="fas fa-users text-yellow-500 text-2xl"></i>
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Community</h3>
              <p>We foster a  community of outdoor enthusiasts, sharing knowledge, promoting responsible recreation, and inspiring the next generation of adventurers.</p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div>
          <h2 className="text-3xl font-bold mb-8 font-[Playfair_Display] text-white relative">
            <span className="inline-block mr-2 text-yellow-500">//</span>
            Get in Touch
          </h2>

          <div className="grid md:grid-cols-2 gap-10">
            {/* <ContactForm /> */}

            <div>
              <div className="bg-[#1a2c35] p-6 rounded-xl mb-6">
                <h3 className="text-xl font-bold mb-4 text-white">Connect With us for Bookings</h3>
                <p className="mb-2"><i className="fas fa-map-marker-alt mr-2 text-yellow-500"></i> Saraswati Vihar , Ajabpur Khurd , Dehradun</p>
                <p className="mb-2"><i className="fas fa-phone-alt mr-2 text-yellow-500"></i> +91 </p>
                <p><i className="fas fa-envelope mr-2 text-yellow-500"></i> ukhikers@gmail.com</p>

                {/* <div className="mt-6">
                  <h4 className="font-medium text-white mb-2">Hours:</h4>
                  <p className="mb-1">Monday - Friday: 9am - 7pm</p>
                  <p className="mb-1">Saturday: 10am - 6pm</p>
                  <p>Sunday: 11am - 5pm</p>
                </div> */}
              </div>

              <div className="flex space-x-4">
                <a href="#" className="inline-flex items-center justify-center w-10 h-10 bg-[#1a2c35] rounded-full hover:bg-yellow-600 transition-colors">
                  <i className="fab fa-instagram text-white"></i>
                </a>
                <a href="#" className="inline-flex items-center justify-center w-10 h-10 bg-[#1a2c35] rounded-full hover:bg-yellow-600 transition-colors">
                  <i className="fab fa-facebook-f text-white"></i>
                </a>
                <a href="#" className="inline-flex items-center justify-center w-10 h-10 bg-[#1a2c35] rounded-full hover:bg-yellow-600 transition-colors">
                  <i className="fab fa-twitter text-white"></i>
                </a>
                <a href="#" className="inline-flex items-center justify-center w-10 h-10 bg-[#1a2c35] rounded-full hover:bg-yellow-600 transition-colors">
                  <i className="fab fa-youtube text-white"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AboutPage;