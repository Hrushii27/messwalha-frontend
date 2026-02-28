import React from 'react';
import { motion } from 'framer-motion';
import { Droplets, Terminal, Sparkles, Database, Check } from 'lucide-react';

const services = [
    {
        icon: <Droplets className="text-blue-500" size={32} />,
        title: "Droplet",
        description: "Powerful, scalable virtual machines",
        features: [
            "Build, deploy, and manage apps",
            "Manage your own infrastructure",
            "Highly scalable"
        ]
    },
    {
        icon: <Terminal className="text-blue-500" size={32} />,
        title: "App Platform",
        description: "Focus on code, not servers",
        features: [
            "Deploy directly from a repository",
            "Zero infrastructure management",
            "Built-in scaling & load balancing"
        ]
    },
    {
        icon: <Sparkles className="text-blue-600" size={32} />,
        title: "Gradient AI Agentic Cloud",
        description: "Build and scale with AI",
        features: [
            "Bare Metal or Virtualized GPUs",
            "Building Managed AI Agents",
            "Serverless Access to LLMs"
        ],
        highlighted: true
    },
    {
        icon: <Database className="text-blue-500" size={32} />,
        title: "Managed Database",
        description: "Worry-free database hosting",
        features: [
            "MongoDB, Kafka, MySQL, & more",
            "Zero infrastructure management",
            "Autoscale available"
        ]
    }
];

const CloudServices: React.FC = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5
            }
        }
    };

    return (
        <section className="py-20 bg-bg-main dark:bg-dark-900 transition-colors duration-300">
            <div className="container mx-auto px-4">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    variants={containerVariants}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            variants={cardVariants}
                            className={`p-8 rounded-xl border transition-all duration-300 flex flex-col h-full bg-white dark:bg-dark-800 ${service.highlighted
                                ? 'border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/50'
                                : 'border-border-color hover:border-blue-200 hover:shadow-md'
                                }`}
                        >
                            <div className="mb-6 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 w-fit">
                                {service.icon}
                            </div>

                            <h3 className={`text-xl font-black mb-3 tracking-tight ${service.highlighted ? 'text-blue-600 dark:text-blue-400' : 'text-text-primary dark:text-text-inverse'
                                }`}>
                                {service.title}
                            </h3>

                            <p className="text-text-muted dark:text-text-secondary text-sm font-bold mb-8 leading-relaxed">
                                {service.description}
                            </p>

                            <ul className="space-y-4 mt-auto">
                                {service.features.map((feature, fIndex) => (
                                    <li key={fIndex} className="flex items-start gap-3">
                                        <div className="mt-1 flex-shrink-0">
                                            <Check className="text-blue-500" size={16} />
                                        </div>
                                        <span className="text-sm font-medium text-text-secondary dark:text-text-muted">
                                            {feature}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

export default CloudServices;
