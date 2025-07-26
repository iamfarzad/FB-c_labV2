import Link from "next/link"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-primary">F.B Consulting</h3>
            <p className="text-sm text-muted-foreground">
              Expert AI automation consultant with 10,000+ hours of hands-on experience in artificial intelligence implementation.
            </p>
          </div>

          {/* Services */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-primary">AI Services</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/consulting" className="text-muted-foreground hover:text-primary transition-colors" title="Custom AI consulting and automation services">
                  AI Consulting & Automation
                </Link>
              </li>
              <li>
                <Link href="/workshop" className="text-muted-foreground hover:text-primary transition-colors" title="Hands-on AI training workshops for teams">
                  AI Training Workshops
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-muted-foreground hover:text-primary transition-colors" title="Try AI assistant demo for business automation">
                  AI Assistant Demo
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-primary">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors" title="About AI consultant Farzad Bayat and his expertise">
                  About Farzad Bayat
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors" title="Contact AI consultant for free consultation">
                  Contact & Consultation
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-primary">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://linkedin.com/in/farzadbayat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  title="Connect with AI consultant Farzad Bayat on LinkedIn"
                >
                  LinkedIn Profile
                </a>
              </li>
              <li>
                <a
                  href="mailto:hello@farzadbayat.com"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  title="Email AI consultant directly for inquiries"
                >
                  hello@farzadbayat.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} F.B Consulting. All rights reserved. Expert AI automation consulting services.
          </p>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors" title="Get in touch for AI consulting services">
              Get AI Consultation
            </Link>
            <span className="text-muted-foreground">|</span>
            <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors" title="Learn about our AI expertise and experience">
              Our AI Expertise
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
