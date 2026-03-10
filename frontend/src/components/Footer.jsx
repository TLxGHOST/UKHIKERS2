import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#0b1d26] pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div>
          <Link
            to="/"
            className="text-white font-[Playfair_Display] font-bold text-3xl mb-4 block"
          >
            UK HIKER
          </Link>

          <p className="text-[#8f9ca3] text-sm mt-4 mb-6">
            Get out there & discover your next slope, mountain & destination!
          </p>

          <p className="text-[#8f9ca3] text-xs">
            Copyright © 2025 Systumm Engineers. <br />
            All rights reserved.
          </p>
        </div>

        {/* Booking Message */}
        <div>
          <h3 className="text-white font-bold mb-6">
            Connect to us for bookings ❤️
          </h3>
        </div>

        {/* Developer */}
        <div>
          <h3 className="text-white font-bold mb-6">
            Developed by Systumm Engineers
          </h3>

          <ul className="space-y-4">
            {["The Team"].map((item) => (
              <li key={item}>
                <a
                  href="https://tejanshu.me"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#8f9ca3] hover:text-white transition-colors"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-white font-bold mb-6">Connect</h3>

          <div className="flex space-x-6">
            {[
              { icon: "fa-facebook", url: "https://facebook.com" },
              { icon: "fa-instagram", url: "https://instagram.com" },
            ].map((social) => (
              <a
                key={social.icon}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#8f9ca3] hover:text-white transition-colors text-lg"
              >
                <i className={`fab ${social.icon}`}></i>
              </a>
            ))}
          </div>

          <div className="mt-10 text-[#8f9ca3]">
            <p>
              Developed with ♥ by{" "}
              <a
                href="https://www.tejanshu.me/"
                className="text-[#fbd784]"
                target="_blank"
                rel="noopener noreferrer"
              >
                TLxGHOST
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
