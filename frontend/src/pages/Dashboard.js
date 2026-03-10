import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Trophy, Zap, Target, Award } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, progressRes] = await Promise.all([
          axios.get(`${BACKEND_URL}/api/auth/me`, { withCredentials: true }),
          axios.get(`${BACKEND_URL}/api/workouts/progress`, { withCredentials: true })
        ]);
        setUser(userRes.data);
        setProgress(progressRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const badges = [
    { level: 1, name: 'Beginner', icon: '🥉', unlocked: progress?.current_level >= 1 },
    { level: 2, name: 'Warrior', icon: '⚔️', unlocked: progress?.current_level >= 2 },
    { level: 3, name: 'Champion', icon: '🏆', unlocked: progress?.current_level >= 3 },
    { level: 4, name: 'Legend', icon: '👑', unlocked: progress?.current_level >= 4 },
    { level: 5, name: 'Weapon Master', icon: '🔥', unlocked: progress?.current_level >= 5 },
    { level: 6, name: 'Ultimate Weapon', icon: '⚡', unlocked: progress?.current_level >= 6 }
  ];

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight uppercase mb-2">
            Welcome Back, <span className="text-primary">{user?.name}</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground">Here's your transformation progress</p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Level Card - Spans 6 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="md:col-span-6"
          >
            <Card data-testid="level-card" className="bg-card border-border h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-primary" />
                  Current Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="text-6xl font-extrabold text-primary mb-2">LEVEL {progress?.current_level}</div>
                  <div className="text-2xl font-bold uppercase tracking-wider mb-4">{progress?.current_badge}</div>
                  <div className="bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-full px-4 py-2 text-sm font-bold uppercase tracking-wider inline-block">
                    {progress?.points} Points
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Progress Card - Spans 6 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-6"
          >
            <Card data-testid="progress-card" className="bg-card border-border h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-primary" />
                  Level Progress
                </CardTitle>
                <CardDescription>
                  {progress?.workouts_in_current_level} / {progress?.workouts_for_next_level} workouts completed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Progress 
                  value={progress?.progress_percentage || 0} 
                  className="h-4 mb-4"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{progress?.workouts_until_next_level} workouts until Level {(progress?.current_level || 1) + 1}</span>
                  <span>{Math.round(progress?.progress_percentage || 0)}%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Card - Spans 4 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-4"
          >
            <Card data-testid="stats-card" className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-6 h-6 text-accent" />
                  Total Workouts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-extrabold text-accent">{progress?.total_workouts_completed || 0}</div>
                <p className="text-sm text-muted-foreground mt-2">Workouts completed</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Badges Card - Spans 8 columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="md:col-span-8"
          >
            <Card data-testid="badges-card" className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-6 h-6 text-primary" />
                  Badge Collection
                </CardTitle>
                <CardDescription>Unlock badges as you level up</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {badges.map((badge) => (
                    <div
                      key={badge.level}
                      data-testid={`badge-${badge.name.toLowerCase().replace(' ', '-')}`}
                      className={`flex flex-col items-center p-4 rounded-sm border ${
                        badge.unlocked
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-zinc-900/50 opacity-50'
                      }`}
                    >
                      <div className="text-4xl mb-2">{badge.icon}</div>
                      <div className="text-sm font-bold uppercase">{badge.name}</div>
                      <div className="text-xs text-muted-foreground">Level {badge.level}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
