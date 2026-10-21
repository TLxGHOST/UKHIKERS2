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
            UK HIKERS
          </Link>

          <p className="text-[#8f9ca3] text-sm mt-4 mb-6">
            Get out there & discover your next slope, mountain & destination!
          </p>

          <p className="text-[#8f9ca3] text-xs">
            Copyright © {new Date().getFullYear()} UK Hikers. <br />
            All rights reserved.
          </p>
        </div>

        {/* Booking Links */}
        <div>
          <h3 className="text-white font-bold mb-6">Plan your next trek</h3>
          <ul className="space-y-3 text-sm">
            <li><Link to="/equipment" className="text-[#8f9ca3] hover:text-white transition-colors">Explore treks</Link></li>
            <li><Link to="/track-booking" className="text-[#8f9ca3] hover:text-white transition-colors">Track a booking</Link></li>
            <li><Link to="/about" className="text-[#8f9ca3] hover:text-white transition-colors">About UK Hikers</Link></li>
          </ul>
        </div>

        {/* Developer */}
        {/* <div>
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
        </div> */}

        {/* Social */}
        <div>
          <h3 className="text-white font-bold mb-6">Connect</h3>

          <p className="text-[#8f9ca3] text-sm">
            For an existing request, use Track Booking with your booking ID and email or phone.
          </p>

          <div className="mt-10 text-[#8f9ca3]">
            <p>
              Developed with ♥ by{" "}
              <a
                href="https://www.tejanshu.dev/"
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
