import { Link } from "wouter";
import { Brain, Heart, Mail, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <Brain size={20} />
              </div>
              <span className="text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                MindEase AI
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Your intelligent companion for emotional wellness. AI-powered support, personalized insights, and a safe space to grow.
            </p>
            <div className="flex items-center gap-4 mt-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-twitter">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-instagram">
                <Instagram size={18} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-linkedin">
                <Linkedin size={18} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" data-testid="link-mail">
                <Mail size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-foreground">Platform</h4>
            <ul className="space-y-2">
              {[
                { label: "Mood Check-In", path: "/mood" },
                { label: "AI Chat", path: "/chat" },
                { label: "Dashboard", path: "/dashboard" },
                { label: "Experts", path: "/experts" },
              ].map((item) => (
                <li key={item.path}>
                  <Link href={item.path} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-foreground">Support</h4>
            <ul className="space-y-2">
              {["Privacy Policy", "Terms of Service", "Help Center", "Contact Us"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 MindEase AI. Made with <Heart size={12} className="inline text-accent" /> for mental wellness.
          </p>
          <p className="text-xs text-muted-foreground">
            Not a substitute for professional mental health care.
          </p>
        </div>
      </div>
    </footer>
  );
}
