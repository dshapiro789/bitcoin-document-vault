'use client';

import Link from 'next/link';
import { FiShield, FiKey, FiGithub, FiUser, FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md text-center hover:shadow-lg transition duration-300">
      {icon}
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

interface PricingFeature {
  name: string;
}

const freePricingFeatures: PricingFeature[] = [
  { name: "Bitcoin-authenticated document access" },
  { name: "Bitcoin wallet integration" },
];

const premiumPricingFeatures: PricingFeature[] = [
  { name: "Bitcoin-authenticated document access" },
  { name: "Bitcoin wallet integration" },
  { name: "Unlimited storage" },
  { name: "Time-locking smart contracts" },
  { name: "Advanced encryption features" },
  { name: "Priority support" },
];

function PricingTier({ tier, price, features }: { tier: string, price: string, features: PricingFeature[] }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition duration-300">
      <h3 className="text-2xl font-bold mb-4 text-primary-orange">{tier}</h3>
      <p className="text-3xl font-bold mb-6">{price}</p>
      <ul className="text-left">
        {features.map((feature, index) => (
          <li key={index} className="mb-2 flex items-center">
            <FiCheck className="text-green-500 mr-2" />
            {feature.name}
          </li>
        ))}
      </ul>
      <button className="mt-6 bg-primary-orange text-white px-6 py-2 rounded-full text-lg font-semibold hover:bg-orange-600 transition duration-300">
        Choose Plan
      </button>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <div className="container mx-auto px-4 pt-20 pb-10 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl font-bold mb-4 text-primary-orange"
        >
          Welcome to BTC Doc Vault
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-xl mb-6 text-gray-700"
        >
          Secure your documents with the power of Bitcoin technology
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <Link href="/register" className="bg-primary-orange text-white px-6 py-2 rounded-full text-lg font-semibold hover:bg-orange-600 transition duration-300 mr-4">
            Get Started
          </Link>
          <Link href="/login" className="bg-white text-primary-orange border border-primary-orange px-6 py-2 rounded-full text-lg font-semibold hover:bg-orange-50 transition duration-300">
            Login
          </Link>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose BTC Doc Vault?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard 
            icon={<FiShield className="text-3xl mb-2 text-primary-orange mx-auto" />}
            title="Privacy First"
            description="Your documents are encrypted and only accessible by you."
          />
          <FeatureCard 
            icon={<FiKey className="text-3xl mb-2 text-primary-orange mx-auto" />}
            title="Bitcoin-Based Authentication"
            description="Use a Bitcoin seed and a custom passphrase to maintain control over your authentication credentials."
          />
          <FeatureCard 
            icon={<FiGithub className="text-3xl mb-2 text-primary-orange mx-auto" />}
            title="Open Source Transparency"
            description="Our code is open source, ensuring transparency and community-driven security improvements."
          />
          <FeatureCard 
            icon={<FiUser className="text-3xl mb-2 text-primary-orange mx-auto" />}
            title="No Personal Information Required"
            description="Register and log in without providing an email address or personal details, preserving your anonymity."
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <PricingTier tier="Free" price="$0/month" features={freePricingFeatures} />
          <PricingTier tier="Premium" price="$9.99/month" features={premiumPricingFeatures} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 mt-8 text-center">
        <h2 className="text-3xl font-bold mb-6 text-primary-orange">Ready to Secure Your Documents?</h2>
        <Link href="/register" className="inline-block bg-primary-orange text-white px-8 py-3 rounded-full text-xl font-semibold hover:bg-orange-600 transition duration-300">
          Get Started Now
        </Link>
      </div>
    </div>
  );
}