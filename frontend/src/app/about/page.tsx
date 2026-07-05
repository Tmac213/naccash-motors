"use client";

import { Car, MapPin, ShieldCheck, Trophy, Users } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-wider mb-6 text-white">About Naccash Motors</h1>
        <p className="text-lg text-gray-400">
          Lebanon's premier Car Dealer & Importer, founded by Mohamad Naccash. We specialize in bringing the finest selection of premium vehicles to discerning clients.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
        <div>
          <img 
            src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80" 
            alt="Showroom" 
            className="rounded-lg shadow-2xl shadow-black/50 w-full object-cover h-[400px]"
          />
        </div>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white uppercase tracking-wider">Our Story</h2>
          <p className="text-gray-400 leading-relaxed">
            At Naccash Motors, we believe that buying a vehicle should be an exceptional experience. With years of expertise in the automotive import industry, we have established a network that spans across the globe, allowing us to source and import the highest quality vehicles directly to Lebanon.
          </p>
          <p className="text-gray-400 leading-relaxed">
            Whether you are looking for a reliable family SUV, a luxury sedan, or an exotic sports car, our team is dedicated to finding exactly what you need. We handle all the complexities of importing, customs, and registration, so you can simply enjoy the drive.
          </p>
          <div className="pt-4">
            <Link href="/inventory" className="inline-block bg-red-600 text-white font-bold uppercase tracking-wider px-8 py-3 rounded-lg hover:bg-red-500 transition-colors">
              View Our Inventory
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
        <div className="bg-dark-card p-6 border border-white/10 rounded text-center">
          <Trophy className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-white font-bold mb-2 uppercase tracking-wider">Premium Selection</h3>
          <p className="text-gray-400 text-sm">We handpick every vehicle to ensure it meets our strict standards of quality and excellence.</p>
        </div>
        <div className="bg-dark-card p-6 border border-white/10 rounded text-center">
          <ShieldCheck className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-white font-bold mb-2 uppercase tracking-wider">Trusted Importer</h3>
          <p className="text-gray-400 text-sm">We handle all logistics, guaranteeing a secure and transparent import process to Lebanon.</p>
        </div>
        <div className="bg-dark-card p-6 border border-white/10 rounded text-center">
          <Users className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-white font-bold mb-2 uppercase tracking-wider">Client First</h3>
          <p className="text-gray-400 text-sm">Your satisfaction is our priority. We offer bespoke services tailored to your exact needs.</p>
        </div>
        <div className="bg-dark-card p-6 border border-white/10 rounded text-center">
          <Car className="w-10 h-10 text-red-500 mx-auto mb-4" />
          <h3 className="text-white font-bold mb-2 uppercase tracking-wider">Full Service</h3>
          <p className="text-gray-400 text-sm">From sourcing to delivery, we provide an end-to-end service for a seamless experience.</p>
        </div>
      </div>

    </div>
  );
}
