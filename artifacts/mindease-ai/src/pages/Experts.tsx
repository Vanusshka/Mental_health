import { useState } from "react";
import { motion } from "framer-motion";
import { Star, MapPin, Clock, BadgeCheck, MessageCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";

interface Expert {
  id: number;
  name: string;
  initials: string;
  specialty: string;
  experience: number;
  rating: number;
  reviews: number;
  price: number;
  available: "Online" | "Offline" | "Both";
  studentFriendly: boolean;
  location: string;
  tags: string[];
  gradient: string;
  bio: string;
}

const experts: Expert[] = [
  {
    id: 1, name: "Dr. Ananya Krishnan", initials: "AK", specialty: "Anxiety & Stress Management", experience: 12,
    rating: 4.9, reviews: 218, price: 800, available: "Both", studentFriendly: true,
    location: "Banjara Hills, Hyderabad", tags: ["CBT", "Mindfulness", "Trauma"],
    gradient: "from-violet-500 to-purple-600",
    bio: "Specializing in cognitive-behavioral therapy and mindfulness-based stress reduction for over a decade."
  },
  {
    id: 2, name: "Dr. Rahul Mehta", initials: "RM", specialty: "Depression & Mood Disorders", experience: 9,
    rating: 4.8, reviews: 164, price: 600, available: "Online", studentFriendly: true,
    location: "Jubilee Hills, Hyderabad", tags: ["DBT", "Depression", "Grief"],
    gradient: "from-blue-500 to-cyan-500",
    bio: "Compassionate therapist with a focus on evidence-based treatment for depression and emotional dysregulation."
  },
  {
    id: 3, name: "Dr. Priya Shetty", initials: "PS", specialty: "Relationship & Family Therapy", experience: 15,
    rating: 4.7, reviews: 302, price: 1200, available: "Both", studentFriendly: false,
    location: "Madhapur, Hyderabad", tags: ["Couples", "Family", "Communication"],
    gradient: "from-rose-500 to-pink-500",
    bio: "Helping families and couples navigate conflict, communication barriers, and deeper emotional bonds."
  },
  {
    id: 4, name: "Dr. Vikram Rao", initials: "VR", specialty: "Burnout & Career Stress", experience: 7,
    rating: 4.9, reviews: 91, price: 700, available: "Online", studentFriendly: true,
    location: "HITEC City, Hyderabad", tags: ["Burnout", "Work Stress", "Coaching"],
    gradient: "from-teal-500 to-emerald-500",
    bio: "Former IT professional turned therapist — I understand tech industry burnout from the inside."
  },
  {
    id: 5, name: "Dr. Meera Pillai", initials: "MP", specialty: "Youth Mental Health", experience: 11,
    rating: 4.8, reviews: 187, price: 500, available: "Both", studentFriendly: true,
    location: "Secunderabad, Hyderabad", tags: ["Adolescents", "ADHD", "Study Stress"],
    gradient: "from-amber-500 to-orange-500",
    bio: "Dedicated to supporting young people through academic pressure, identity development, and emotional regulation."
  },
  {
    id: 6, name: "Dr. Sanjay Iyer", initials: "SI", specialty: "Trauma & PTSD", experience: 18,
    rating: 5.0, reviews: 74, price: 1500, available: "Offline", studentFriendly: false,
    location: "Film Nagar, Hyderabad", tags: ["EMDR", "PTSD", "Trauma-Informed"],
    gradient: "from-indigo-500 to-blue-600",
    bio: "Internationally certified trauma therapist with expertise in EMDR and somatic approaches to healing."
  },
];

const specialties = ["All", "Anxiety", "Depression", "Relationship", "Burnout", "Youth", "Trauma"];
const availabilities = ["All", "Online", "Offline", "Both"];

function InitialsAvatar({ initials, gradient }: { initials: string; gradient: string }) {
  return (
    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0`}>
      {initials}
    </div>
  );
}

export default function Experts() {
  const [selectedSpecialty, setSelectedSpecialty] = useState("All");
  const [selectedAvailability, setSelectedAvailability] = useState("All");

  const filtered = experts.filter((e) => {
    const specMatch = selectedSpecialty === "All" || e.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase()) || e.tags.some(t => t.toLowerCase().includes(selectedSpecialty.toLowerCase()));
    const avMatch = selectedAvailability === "All" || e.available === selectedAvailability || e.available === "Both";
    return specMatch && avMatch;
  });

  return (
    <PageTransition>
      <div className="container mx-auto max-w-6xl px-6 py-12">
        <div className="text-center mb-10">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-medium text-primary uppercase tracking-widest mb-3"
          >
            Find Your Guide
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-4xl font-semibold tracking-tight mb-3"
          >
            Connect with Wellness Experts
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-xl mx-auto"
          >
            Vetted mental health professionals in Hyderabad — online, offline, and student-friendly options.
          </motion.p>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap gap-6 mb-8"
        >
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Specialty</p>
            <div className="flex flex-wrap gap-2">
              {specialties.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSpecialty(s)}
                  data-testid={`filter-specialty-${s.toLowerCase()}`}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedSpecialty === s
                      ? "bg-primary text-white shadow-md shadow-primary/20"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Availability</p>
            <div className="flex gap-2">
              {availabilities.map((a) => (
                <button
                  key={a}
                  onClick={() => setSelectedAvailability(a)}
                  data-testid={`filter-availability-${a.toLowerCase()}`}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedAvailability === a
                      ? "bg-secondary text-white shadow-md"
                      : "bg-muted text-muted-foreground hover:bg-muted/70"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((expert, i) => (
            <motion.div
              key={expert.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="p-5 rounded-2xl bg-card border border-border hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              data-testid={`expert-card-${expert.id}`}
            >
              <div className="flex gap-4 mb-4">
                <InitialsAvatar initials={expert.initials} gradient={expert.gradient} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-sm leading-tight">{expert.name}</h3>
                    {expert.studentFriendly && (
                      <span className="flex-shrink-0 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                        Student
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{expert.specialty}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <Star size={11} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs font-medium">{expert.rating}</span>
                    <span className="text-xs text-muted-foreground">({expert.reviews})</span>
                    <BadgeCheck size={12} className="text-primary ml-1" />
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed mb-4 line-clamp-2">{expert.bio}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {expert.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Clock size={11} />
                  <span>{expert.experience}y exp</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={11} />
                  <span className="truncate">{expert.location.split(",")[0]}</span>
                </div>
                <div className={`flex items-center gap-1 ${expert.available === "Online" ? "text-emerald-500" : expert.available === "Offline" ? "text-orange-500" : "text-blue-500"}`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  <span>{expert.available}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Per session</p>
                  <p className="text-sm font-semibold">₹{expert.price}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-full h-8 text-xs gap-1" data-testid={`button-contact-${expert.id}`}>
                    <MessageCircle size={12} /> Contact
                  </Button>
                  <Button size="sm" className="rounded-full h-8 text-xs gap-1 bg-gradient-to-r from-primary to-secondary hover:opacity-90" data-testid={`button-book-${expert.id}`}>
                    <Calendar size={12} /> Book
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg font-medium">No experts match your filters</p>
            <p className="text-sm mt-2">Try adjusting the specialty or availability filters</p>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
