"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, MapPin, Users } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);

  const features = [
    {
      title: "Hassle-free Signaling",
      description: "Signal your friends without switching apps. Send quick pings to coordinate your ride.",
      image: "/features/signaling.gif",
      icon: <MessageSquare className="w-6 h-6 text-orange-500" />,
      tag: "Instant Ping",
      isMobile: true,
    },
    {
      title: "Real-time Ride Coordination",
      description: "Sync your squad effortlessly. See who's joining, who's ready, and coordinate pickup points in a unified, live dashboard.",
      image: "/features/coordination.png",
      icon: <Users className="w-6 h-6 text-blue-500" />,
      tag: "Social Sync",
      isMobile: true,
    },
    {
      title: "Real-time Tracking",
      description: "Never ask 'Where are you?' again. Watch your friends move on the map in real-time with precise ETAs and live route updates.",
      image: "/features/tracking.png",
      icon: <MapPin className="w-6 h-6 text-emerald-500" />,
      tag: "Live Map",
      isMobile: true,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10 max-w-4xl"
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-medium tracking-tight text-primary bg-secondary rounded-full border border-gray-100">
            Version Alpha is here!
          </span>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-gray-900 mb-8">
            Ride in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Perfect Sync</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            TandemSync brings groups together on the road. Plan, track, and chat—all in one seamless experience.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="h-14 px-8 text-lg cursor-pointer rounded-full bg-primary hover:opacity-90 transition-opacity"
              onClick={() => router.push("/dashboard")}
            >
              Start a Trip <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              className="h-14 px-8 text-lg cursor-pointer rounded-full bg-primary hover:opacity-90 transition-opacity"
              onClick={() => router.push("/joinRide?rideCode=4356d086&invitedBy=69d1494b943c6b06ff877c4e")}
            >
              Join Puluthi Ride<ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 text-lg cursor-pointer rounded-full border-2"
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Explore Features
            </Button>
          </div>
        </motion.div>
        
        {/* Abstract Background Element */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-50/50 rounded-full blur-3xl -z-0" />
      </section>

      {/* Feature Sections */}
      <section id="features" className="py-24 space-y-32">
        {features.map((feature, index) => (
          <FeatureSection key={index} feature={feature} reverse={Boolean(index & 1)} />
        ))}
      </section>

      {/* Video/Demo Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto flex flex-col items-center gap-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-gray-900">See it in action</h2>
              <p className="text-gray-500 max-w-xl mx-auto">
                Watch how TandemSync makes group coordination secondary and the journey primary.
              </p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative w-full max-w-[320px] aspect-[9/19.5] rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white bg-black mx-auto"
            >
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                src="https://tandem-sync.s3.ap-south-1.amazonaws.com/tandem-sync-video.mp4"
                controls
                playsInline
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 bg-white">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl tracking-tight">TandemSync.</span>
          </div>
          
          <div className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} TandemSync. Designed for the open road.
          </div>
          
          {/* <div className="flex gap-6 text-sm text-gray-500 font-medium">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Twitter</a>
          </div> */}
        </div>
      </footer>
    </div>
  );
}

function FeatureSection({ feature, reverse }: { feature: any, reverse?: boolean }) {
  return (
    <div className="container mx-auto px-6">
      <div className={`flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-16 md:gap-24`}>
        <motion.div 
          initial={{ opacity: 0, x: reverse ? 50 : -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="flex-1 space-y-6"
        >
          <div className="flex items-center gap-3">
             <div className="p-3 bg-gray-50 rounded-2xl">
               {feature.icon}
             </div>
             <span className="text-sm font-semibold uppercase tracking-widest text-gray-400">{feature.tag}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            {feature.title}
          </h2>
          <p className="text-lg text-gray-500 leading-relaxed max-w-lg">
            {feature.description}
          </p>
          {/* <ul className="space-y-4 pt-4">
            {["Premium UX", "End-to-end sync", "Works offline"].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-gray-600">
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
                {item}
              </li>
            ))}
          </ul> */}
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8, rotate: reverse ? -2 : 2 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className={`flex-1 w-full ${feature.isMobile ? 'max-w-[320px] mx-auto' : ''}`}
        >
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-[40px] blur-2xl opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className={`relative ${feature.isMobile ? 'aspect-[9/19.5]' : 'aspect-[4/3]'} rounded-[32px] overflow-hidden border-8 border-white shadow-2xl bg-white`}>
              <Image 
                src={feature.image} 
                alt={feature.title}
                fill
                className="object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
