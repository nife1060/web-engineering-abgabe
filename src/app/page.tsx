import Link from "next/link";
import CourseCard from "@/components/CourseCard";
import { mockCourses } from "@/lib/data";

const features = [
  { icon: "🎓", title: "Expert-Led Courses", description: "Learn from industry professionals with real-world experience in their fields." },
  { icon: "🏗️", title: "Easy Course Builder", description: "Create and publish your own courses with our intuitive builder." },
  { icon: "📊", title: "Track Your Progress", description: "Stay motivated with detailed progress tracking across all your enrolled courses." },
  { icon: "💳", title: "Sell Your Knowledge", description: "Monetize your expertise. Set your price and earn revenue from every enrollment." },
  { icon: "📱", title: "Learn Anywhere", description: "Access your courses on any device. Pick up exactly where you left off." },
  { icon: "📈", title: "Creator Analytics", description: "Understand your audience with detailed analytics on course performance and revenue." },
];

const testimonials = [
  { name: "Maria S.", role: "Frontend Developer", text: "I landed my first dev job after completing the Web Development Bootcamp. The quality is incredible.", avatar: "MS" },
  { name: "Tom K.", role: "Course Creator", text: "I published my first course in a weekend. LearnHub makes it so easy to share your knowledge.", avatar: "TK" },
  { name: "Jana R.", role: "UX Designer", text: "The structured learning path helped me transition careers. Worth every cent.", avatar: "JR" },
];

const plans = [
  {
    name: "Free", price: "€0", period: "forever",
    description: "Get started and explore the platform.",
    features: ["Browse all courses", "Enroll in 1 free course", "Basic progress tracking"],
    cta: "Get started free", href: "/register", highlight: false,
  },
  {
    name: "Pro", price: "€19", period: "per month",
    description: "Everything you need to learn without limits.",
    features: ["Unlimited course access", "Advanced progress tracking", "Certificate of completion", "Priority support"],
    cta: "Start free trial", href: "/register", highlight: true,
  },
  {
    name: "Creator", price: "€39", period: "per month",
    description: "Build, publish, and grow your course business.",
    features: ["All Pro features", "Unlimited course creation", "Revenue analytics dashboard", "Custom pricing per course", "Stripe payout integration"],
    cta: "Start creating", href: "/register", highlight: false,
  },
];

export default function Home() {
  const featuredCourses = mockCourses.slice(0, 3);

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-purple-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-400 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 text-center lg:text-left">
            <span className="inline-block bg-purple-500/30 border border-purple-400/40 text-purple-200 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              The SaaS Course Platform
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Learn anything.<br />
              <span className="text-purple-300">Teach anyone.</span>
            </h1>
            <p className="text-lg text-purple-100 mb-8 max-w-xl mx-auto lg:mx-0">
              Join thousands of learners and creators on LearnHub — the platform that makes it
              simple to discover, create, and sell online courses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/register" className="bg-white text-purple-900 font-bold px-8 py-4 rounded-xl hover:bg-purple-50 transition text-lg shadow-lg">
                Start free trial
              </Link>
              <Link href="/courses" className="border border-white/40 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition text-lg">
                Browse courses
              </Link>
            </div>
            <p className="mt-5 text-sm text-purple-300">No credit card required · Cancel anytime</p>
          </div>
          <div className="flex-1 hidden lg:grid grid-cols-2 gap-4 max-w-sm">
            {mockCourses.slice(0, 4).map((c) => (
              <div key={c.id} className="bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                <div className="w-full h-24 bg-white/10 rounded-lg mb-3 overflow-hidden">
                  <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover opacity-80" />
                </div>
                <p className="text-xs font-semibold text-purple-200 line-clamp-2">{c.title}</p>
                <p className="text-xs text-yellow-400 mt-1">★ {c.rating}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 pb-10 flex flex-wrap gap-8 justify-center lg:justify-start">
          {[["12,000+", "Students"], ["200+", "Courses"], ["50+", "Expert Creators"], ["4.8★", "Avg. Rating"]].map(([stat, label]) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-extrabold text-white">{stat}</div>
              <div className="text-sm text-purple-300">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Everything you need to learn and earn</h2>
            <p className="text-gray-500 max-w-xl mx-auto">LearnHub brings together learners and creators in one powerful, easy-to-use platform.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f) => (
              <div key={f.title} className="p-6 rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition group">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-purple-700 transition">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">Featured Courses</h2>
              <p className="text-gray-500 mt-2">Hand-picked by our editorial team</p>
            </div>
            <Link href="/courses" className="text-purple-600 font-semibold hover:text-purple-800 text-sm">View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">What our users say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <p className="text-gray-600 text-sm leading-relaxed mb-5">&quot;{t.text}&quot;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-sm">{t.avatar}</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-500">Start free. Upgrade when you&apos;re ready.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-8 border-2 flex flex-col ${plan.highlight ? "border-purple-600 bg-purple-600 text-white shadow-2xl scale-105" : "border-gray-200 bg-white text-gray-900"}`}>
                {plan.highlight && <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 w-fit">Most Popular</span>}
                <h3 className={`text-xl font-bold mb-1 ${plan.highlight ? "text-white" : "text-gray-900"}`}>{plan.name}</h3>
                <p className={`text-sm mb-5 ${plan.highlight ? "text-purple-200" : "text-gray-500"}`}>{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span className={`text-sm ml-1 ${plan.highlight ? "text-purple-200" : "text-gray-400"}`}>/{plan.period}</span>
                </div>
                <ul className="flex-1 space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <span className={plan.highlight ? "text-green-300" : "text-green-500"}>✓</span>
                      <span className={plan.highlight ? "text-purple-100" : "text-gray-600"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href} className={`text-center font-semibold py-3 rounded-xl transition ${plan.highlight ? "bg-white text-purple-700 hover:bg-purple-50" : "bg-purple-600 text-white hover:bg-purple-700"}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-purple-700 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">Ready to start your journey?</h2>
          <p className="text-purple-200 mb-8 text-lg">Join over 12,000 learners already on LearnHub. Sign up free today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-white text-purple-700 font-bold px-8 py-4 rounded-xl hover:bg-purple-50 transition text-lg">Sign up free</Link>
            <Link href="/courses" className="border border-white/40 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 transition text-lg">Browse courses</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">L</span>
                </div>
                <span className="font-bold text-white text-lg">LearnHub</span>
              </div>
              <p className="text-sm max-w-xs">The SaaS course platform for modern learners and creators.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              <div>
                <h4 className="font-semibold text-white mb-3">Platform</h4>
                <ul className="space-y-2">
                  <li><Link href="/courses" className="hover:text-white transition">Browse Courses</Link></li>
                  <li><Link href="/creator" className="hover:text-white transition">Teach on LearnHub</Link></li>
                  <li><Link href="#pricing" className="hover:text-white transition">Pricing</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-3">Account</h4>
                <ul className="space-y-2">
                  <li><Link href="/login" className="hover:text-white transition">Log in</Link></li>
                  <li><Link href="/register" className="hover:text-white transition">Sign up</Link></li>
                  <li><Link href="/dashboard" className="hover:text-white transition">Dashboard</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-white mb-3">Company</h4>
                <ul className="space-y-2">
                  <li><span>About</span></li>
                  <li><span>Blog</span></li>
                  <li><span>Contact</span></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-gray-800 text-xs text-center">
            © {new Date().getFullYear()} LearnHub. This is a prototype / preview website — features and content are not final.
          </div>
        </div>
      </footer>
    </div>
  );
}
