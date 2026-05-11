import { Link, useLocation } from "wouter";
import { useTheme } from "./ThemeProvider";
import { Moon, Sun, Menu, X, Brain, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMood } from "@/contexts/MoodContext";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/services/authService";

export default function Navigation() {
  const [location] = useLocation();
  const { theme: colorTheme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme: moodTheme } = useMood();
  const { user } = useAuth();

  const navItems = [
    { label: "Home",        path: "/" },
    { label: "Check-In",    path: "/checkin" },
    { label: "Dashboard",   path: "/dashboard" },
    { label: "Experts",     path: "/experts" },
    { label: "Doctor Portal", path: "/doctor" },
    { label: "Org Portal",  path: "/org" },
  ];

  const accentColor = moodTheme?.accent ?? "hsl(var(--primary))";
  const borderColor = moodTheme ? `${moodTheme.accent}30` : "rgba(255,255,255,0.15)";

  return (
    <motion.nav
      className="sticky top-0 z-50 w-full"
      style={{
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderBottom: `1px solid ${borderColor}`,
      }}
      animate={{ borderBottomColor: borderColor }}
      transition={{ duration: 1, ease: "easeInOut" }}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <motion.div
              className="rounded-xl p-1.5 transition-all duration-300"
              style={{
                background: moodTheme
                  ? `linear-gradient(135deg, ${moodTheme.particle1}25, ${moodTheme.accent}20)`
                  : "rgba(99,102,241,0.1)",
              }}
              animate={{
                background: moodTheme
                  ? `linear-gradient(135deg, ${moodTheme.particle1}25, ${moodTheme.accent}20)`
                  : "rgba(99,102,241,0.1)",
              }}
              transition={{ duration: 1 }}
            >
              <Brain
                size={22}
                style={{ color: accentColor }}
                className="transition-colors duration-700"
              />
            </motion.div>
            <span className="text-xl font-semibold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MANAS
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => {
              const isActive = location === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className="relative text-sm font-medium transition-colors duration-300"
                  style={{ color: isActive ? accentColor : undefined }}
                  data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <span className={!isActive ? "text-muted-foreground hover:text-foreground transition-colors" : ""}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute -bottom-[22px] left-0 right-0 h-0.5 rounded-full"
                      style={{ background: accentColor }}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(colorTheme === "dark" ? "light" : "dark")}
              className="rounded-full w-9 h-9 ml-2 text-muted-foreground hover:text-primary transition-colors"
              data-testid="button-theme-toggle"
            >
              {colorTheme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </Button>

            {/* User avatar + sign-out */}
            {user && (
              <div className="flex items-center gap-2 ml-1">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName ?? "User"}
                    className="w-8 h-8 rounded-full border-2 border-white/60 shadow-sm"
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                    style={{ background: accentColor }}
                  >
                    {(user.displayName ?? user.email ?? "U")[0].toUpperCase()}
                  </div>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => signOut()}
                  className="rounded-full w-8 h-8 text-muted-foreground hover:text-destructive transition-colors"
                  title="Sign out"
                >
                  <LogOut size={15} />
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Nav Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(colorTheme === "dark" ? "light" : "dark")}
              className="rounded-full w-9 h-9 text-muted-foreground"
            >
              {colorTheme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-muted-foreground"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.75)",
              backdropFilter: "blur(20px)",
              borderBottom: `1px solid ${borderColor}`,
            }}
          >
            <div className="flex flex-col py-4 px-4 gap-2">
              {navItems.map((item) => {
                const isActive = location === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-sm font-medium px-4 py-2.5 rounded-xl transition-all duration-200"
                    style={
                      isActive
                        ? {
                            background: moodTheme ? `${moodTheme.accent}15` : "rgba(99,102,241,0.1)",
                            color: accentColor,
                          }
                        : {}
                    }
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
