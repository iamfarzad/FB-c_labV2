import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-dark-800 border-t border-dark-700">
      <div className="container mx-auto px-4 py-8 md:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <h3 className="text-lg font-semibold text-white">F.B/c Consulting</h3>
            <p className="mt-2 text-sm text-gray-400">AI-Powered Business Transformation.</p>
          </div>
          <div>
            <h4 className="font-semibold text-white">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/#services" className="text-gray-400 hover:text-white">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-gray-400 hover:text-white">
                  Live Demo
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white">Legal</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white">Contact</h4>
            <p className="mt-4 text-sm text-gray-400">Ready to see what AI can do for you?</p>
            <Link href="/#contact" className="mt-2 inline-block text-sm text-blue-400 hover:text-blue-300">
              Get in touch &rarr;
            </Link>
          </div>
        </div>
        <div className="mt-8 border-t border-dark-700 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} F.B/c Consulting. All rights reserved. Founded by Farzad Bayat.
        </div>
      </div>
    </footer>
  )
}
