import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Zap, Target, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Zap,
      title: 'Gamified Progress',
      description: 'Level up through 30 workouts, earn badges, and track your transformation'
    },
    {
      icon: Target,
      title: 'Home Workouts',
      description: 'Train anywhere, anytime with curated workout plans designed for dads'
    },
    {
      icon: Shield,
      title: 'Nutrition Guidance',
      description: 'Balanced meal tips to fuel your journey from Dad Bod to weapon'
    },
    {
      icon: Users,
      title: 'Brotherhood Community',
      description: 'Real-time chat with fellow dads on the same mission'
    }
  ];

  return (
    <div className="min-h-screen bg-background noise-bg">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1640888652225-529c8cd4be50?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxmaXQlMjBtYW4lMjB3b3JraW5nJTIwb3V0JTIwaG9tZSUyMGd5bXxlbnwwfHx8fDE3NzMwMjc3ODR8MA&ixlib=rb-4.1.0&q=85')` }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter uppercase text-foreground mb-6">
              Turn Your Dad Bod
              <br />
              <span className="text-primary">Into A Weapon</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Join the brotherhood. Complete workouts, level up, earn badges. Track your progress at your own pace and transform your body.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                data-testid="get-started-button"
                onClick={() => navigate('/signup')}
                className="bg-primary text-white hover:bg-primary/90 rounded-sm font-bold uppercase tracking-wider h-12 px-8 text-base"
              >
                Get Started
              </Button>
              <Button
                data-testid="login-button"
                onClick={() => navigate('/login')}
                className="bg-secondary text-white hover:bg-secondary/80 rounded-sm font-medium h-12 px-8 text-base"
              >
                Login
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight uppercase mb-4">Why Dad Bod to Weapon?</h2>
          <p className="text-base md:text-lg text-muted-foreground">Everything you need to transform your body and mindset</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-sm p-6 hover:border-primary/50 transition-colors duration-300"
            >
              <feature.icon className="w-12 h-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight uppercase mb-6">
            Ready To Transform?
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mb-8">
            Join hundreds of dads who are leveling up their fitness game
          </p>
          <Button
            data-testid="cta-get-started-button"
            onClick={() => navigate('/signup')}
            className="bg-primary text-white hover:bg-primary/90 rounded-sm font-bold uppercase tracking-wider h-12 px-8 text-base"
          >
            Start Your Journey
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Landing;
