import Link from "next/link";
import {
MapPin,
Phone,
Mail,
} from "lucide-react";


export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="text-4xl font-bold text-white flex items-center gap-2"
            >
              JanSahay
            </Link>
            <p className="mt-4 text-gray-400 max-w-md">
              Connecting trusted local service providers with customers across
              Lucknow and nearby cities. Fast, reliable, and hassle-free help at
              your doorstep.
            </p>

            {/* <div className="flex gap-4 mt-8">
              <a href="#" className="hover:text-orange-500 transition">
                <FacebookIcon className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-orange-500 transition">
                <InstagramIcon className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-orange-500 transition">
                <TwitterIcon className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-orange-500 transition">
                <LinkedinIcon className="w-5 h-5" />
              </a>
            </div>
         */}
          </div>
          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-5">Company</h3>
            <div className="space-y-3 text-sm">
              <Link href="/about" className="block hover:text-white transition">
                About Us
              </Link>
              <Link
                href="/careers"
                className="block hover:text-white transition"
              >
                Careers
              </Link>
              <Link href="/blog" className="block hover:text-white transition">
                Blog
              </Link>
              <Link
                href="/contact"
                className="block hover:text-white transition"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-5">Services</h3>
            <div className="space-y-3 text-sm">
              <Link
                href="/services?category=plumbing"
                className="block hover:text-white transition"
              >
                Plumbing
              </Link>
              <Link
                href="/services?category=electrical"
                className="block hover:text-white transition"
              >
                Electrical
              </Link>
              <Link
                href="/services?category=tutoring"
                className="block hover:text-white transition"
              >
                Home Tutoring
              </Link>
              <Link
                href="/services?category=delivery"
                className="block hover:text-white transition"
              >
                Delivery
              </Link>
              <Link
                href="/services?category=cleaning"
                className="block hover:text-white transition"
              >
                Cleaning
              </Link>
            </div>
          </div>

          {/* Contact & Legal */}
          <div>
            <h3 className="text-white font-semibold mb-5">Get in Touch</h3>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 text-orange-500" />
                <div>
                  <p>Lucknow, Uttar Pradesh</p>
                  <p className="text-gray-500">India</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-orange-500" />
                <p>+91 8953883431</p>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-orange-500" />
                <p>anujtiwari720ya@gmail.com</p>
              </div>
            </div>

            <div className="mt-10">
              <h4 className="font-medium text-white mb-3">Legal</h4>
              <div className="text-sm space-y-2">
                <Link
                  href="/privacy"
                  className="block hover:text-white transition"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms"
                  className="block hover:text-white transition"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} JanSahay. All rights reserved.</p>
          <p className="mt-4 md:mt-0">
            Made with ❤️ for the people of{" "}
            <span className="text-orange-500">India</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
