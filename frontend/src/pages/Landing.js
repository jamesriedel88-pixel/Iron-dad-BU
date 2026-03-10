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
            <p className="text-xl md:text-2xl font-semibold text-accent mb-4">
              Be the strong dad your kids look up to
            </p>
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
          <p className="text-base md:text-lg text-muted-foreground mb-4">Everything you need to transform your body and mindset</p>
          <p className="text-sm md:text-base text-muted-foreground max-w-3xl mx-auto mb-8">
            Designed by a <span className="text-primary font-semibold">Personal Trainer with over 15 years of experience</span>, 
            <span className="text-primary font-semibold"> Gym Owner</span>, and most importantly, a <span className="text-primary font-semibold">Dad</span> who 
            understands the challenges of balancing fitness with family life.
          </p>
          
          {/* Trainer Photo */}
          <div className="max-w-2xl mx-auto mb-12">
            <img 
              src="https://customer-assets.emergentagent.com/job_fit-dad-forge/artifacts/1whs245i_3478211F-BA62-47A1-967D-5C2159D401DA.JPG"
              alt="Personal trainer instructing class in gym"
              className="w-full h-auto rounded-sm border border-border shadow-lg"
            />
          </div>
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

      {/* Pricing Section */}
      <div className="py-24 px-4 sm:px-6 lg:px-8 bg-zinc-900/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight uppercase mb-6">
            Transform Your Life
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mb-8">
            For only <span className="text-4xl font-extrabold text-primary">$50</span> per month
          </p>
          <div className="max-w-2xl mx-auto bg-card border border-border rounded-sm p-8 mb-8">
            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-black font-bold text-sm">✓</span>
                </div>
                <p className="text-muted-foreground">Unlimited access to all workout programs</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-black font-bold text-sm">✓</span>
                </div>
                <p className="text-muted-foreground">Gamified progress tracking with levels and badges</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-black font-bold text-sm">✓</span>
                </div>
                <p className="text-muted-foreground">Expert nutrition guidance and meal tips</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-black font-bold text-sm">✓</span>
                </div>
                <p className="text-muted-foreground">Real-time community chat with fellow dads</p>
              </div>
            </div>
          </div>
          <Button
            data-testid="pricing-get-started-button"
            onClick={() => navigate('/signup')}
            className="bg-primary text-white hover:bg-primary/90 rounded-sm font-bold uppercase tracking-wider h-12 px-8 text-base"
          >
            Start Your Journey
          </Button>
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
