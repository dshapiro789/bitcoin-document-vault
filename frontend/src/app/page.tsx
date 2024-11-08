'use client';

import Link from 'next/link';
import { FiShield, FiKey, FiGithub, FiUser, FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="card hover:shadow-lg transition duration-300 flex flex-col items-center text-center">
      <div className="text-primary text-3xl mb-4 flex justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-text-light">{description}</p>
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
      <button className="btn-primary mt-6 w-full">
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
          className="text-5xl font-bold mb-4 text-primary"
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
          <Link href="/register" className="btn-primary mr-4">
            Get Started
          </Link>
          <Link href="/login" className="btn-outline">
            Login
          </Link>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose BTC Doc Vault?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard 
            icon={<FiShield className="text-3xl text-primary" />}
            title="Privacy First"
            description="Your documents are encrypted and only accessible by you."
          />
          <FeatureCard 
            icon={<FiKey className="text-3xl text-primary" />}
            title="Bitcoin-Based Authentication"
            description="Use a Bitcoin seed and a custom passphrase to maintain control over your account credentials."
          />
          <FeatureCard 
            icon={<FiGithub className="text-3xl text-primary" />}
            title="Open Source Transparency"
            description="Our code is open source, ensuring transparency and community-driven security improvements."
          />
          <FeatureCard 
            icon={<FiUser className="text-3xl text-primary" />}
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
        <h2 className="text-3xl font-bold mb-6 text-primary">Ready to Secure Your Documents?</h2>
        <Link href="/register" className="btn-primary inline-block text-xl">
          Get Started Now
        </Link>
      </div>

      {/* New Donation Section */}
      <div className="container mx-auto px-4 py-16 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6 text-primary">Support Development</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="w-48 h-48 relative">
              <Image
                src="/bitcoin-qr.png"  // Make sure to add the QR code image to your public folder
                alt="Bitcoin Donation QR Code"
                width={192}
                height={192}
                className="border-4 border-white shadow-lg rounded-lg"
              />
            </div>
            <div className="flex-1 max-w-xl">
              <p className="text-lg mb-3">Donate to support further development via Bitcoin (Silent Payment Address):</p>
              <div className="bg-white p-4 rounded-lg shadow-md break-all text-sm font-mono">
                sp1qqdak9clmvgxtrvcf36uwr93gddwwsyt734tsyemtf4xseeatxjuuwqm95sd7cctpt4ratnyg48c3n05ug5d5zfewlhf5kkaqzwkapn9wds8uh2w6
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}