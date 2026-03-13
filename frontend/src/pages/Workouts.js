import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Check, Clock, Flame, Lock, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [completedWorkoutData, setCompletedWorkoutData] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [allWorkouts, setAllWorkouts] = useState([]);

  const fetchData = async () => {
    try {
      const [workoutsRes, progressRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/workouts`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/workouts/progress`, { withCredentials: true })
      ]);
      setWorkouts(workoutsRes.data);
      setAllWorkouts(workoutsRes.data);
      setProgress(progressRes.data);
      
      // Set selected level to current level by default
      if (!selectedLevel && progressRes.data) {
        setSelectedLevel(progressRes.data.current_level);
      }
    } catch (error) {
      toast.error('Failed to fetch workouts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCompleteWorkout = async (workoutId) => {
    try {
      const workout = workouts.find(w => w.workout_id === workoutId);
      const response = await axios.post(
        `${BACKEND_URL}/api/workouts/complete`,
        { workout_id: workoutId },
        { withCredentials: true }
      );
      
      // Store data for sharing
      setCompletedWorkoutData({
        workoutTitle: workout.title,
        level: response.data.level,
        badge: response.data.badge,
        points: response.data.points,
        leveledUp: response.data.leveled_up
      });
      
      if (response.data.leveled_up) {
        if (response.data.newly_unlocked_workouts > 0) {
          toast.success(`🎉 Level Up! You're now ${response.data.badge} - Level ${response.data.level}! ${response.data.newly_unlocked_workouts} new workout${response.data.newly_unlocked_workouts > 1 ? 's' : ''} unlocked!`);
        } else {
          toast.success(`🎉 Level Up! You're now ${response.data.badge} - Level ${response.data.level}!`);
        }
      } else {
        toast.success(`Workout completed! +10 points`);
      }
      
      // Show share dialog
      setShareDialogOpen(true);
      
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to complete workout');
    }
  };

  const handleShareToInstagram = async () => {
    if (!completedWorkoutData) return;

    const shareText = `💪 Just completed "${completedWorkoutData.workoutTitle}" on Iron Dad's Dad Bod to Weapon program!\n\n🏆 Level ${completedWorkoutData.level} - ${completedWorkoutData.badge}\n⚡ ${completedWorkoutData.points} Total Points\n\n${completedWorkoutData.leveledUp ? '🎉 LEVEL UP! ' : ''}Become the father your kids look up to!\n\n#IronDad #DadBodToWeapon #FitDad #DadFitness #WorkoutComplete`;

    // Try native share API (works on mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Iron Dad',
          text: shareText,
        });
        toast.success('Shared successfully!');
        setShareDialogOpen(false);
      } catch (error) {
        if (error.name !== 'AbortError') {
          // Fallback to clipboard
          copyToClipboard(shareText);
        }
      }
    } else {
      // Fallback to clipboard for desktop
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard! Paste it on Instagram.');
      setShareDialogOpen(false);
    }).catch(() => {
      toast.error('Failed to copy');
    });
  };

  const isWorkoutCompleted = (workoutId) => {
    return progress?.completed_workout_ids?.includes(workoutId);
  };

  const handleLevelSelect = async (level) => {
    setSelectedLevel(level);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/workouts/by-level/${level}`, { 
        withCredentials: true 
      });
      setWorkouts(response.data);
    } catch (error) {
      toast.error('Failed to load workouts for this level');
    }
  };

  const badges = [
    { level: 1, name: 'Beginner', icon: '🥉', unlocked: progress?.current_level >= 1 },
    { level: 2, name: 'Relentless Dad', icon: '⚔️', unlocked: progress?.current_level >= 2 },
    { level: 3, name: 'Beast Mode', icon: '🏆', unlocked: progress?.current_level >= 3 },
    { level: 4, name: 'Alpha', icon: '👑', unlocked: progress?.current_level >= 4 },
    { level: 5, name: 'Unbreakable', icon: '🔥', unlocked: progress?.current_level >= 5 },
    { level: 6, name: 'GOAT Dad', icon: '⚡', unlocked: progress?.current_level >= 6 }
  ];

  const difficultyColors = {
    'Beginner': 'text-green-400',
    'Intermediate': 'text-yellow-400',
    'Advanced': 'text-red-400'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight uppercase mb-2">Workouts</h1>
          <p className="text-base md:text-lg text-muted-foreground">Complete workouts to level up and earn badges</p>
        </div>

        {/* Level Badges Filter */}
        {progress && (
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Select Level</h3>
            <div className="flex flex-wrap gap-3">
              {badges.map((badge) => (
                <button
                  key={badge.level}
                  data-testid={`level-badge-${badge.level}`}
                  onClick={() => badge.unlocked && handleLevelSelect(badge.level)}
                  disabled={!badge.unlocked}
                  className={`flex items-center gap-2 px-4 py-3 rounded-sm border transition-all duration-200 ${
                    badge.unlocked
                      ? selectedLevel === badge.level
                        ? 'bg-primary border-primary text-white font-bold'
                        : 'bg-card border-border hover:border-primary cursor-pointer'
                      : 'bg-zinc-900/30 border-zinc-800 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <div className="text-left">
                    <div className="text-xs font-bold uppercase">Level {badge.level}</div>
                    <div className="text-sm">{badge.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Share Dialog */}
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle>Share Your Achievement! 🎉</DialogTitle>
              <DialogDescription>
                Let everyone know about your progress on Instagram
              </DialogDescription>
            </DialogHeader>
            {completedWorkoutData && (
              <div className="space-y-4">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-sm p-6 text-center">
                  <div className="text-4xl mb-3">
                    {completedWorkoutData.leveledUp ? '🎉' : '💪'}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{completedWorkoutData.workoutTitle}</h3>
                  {completedWorkoutData.leveledUp && (
                    <p className="text-accent font-bold mb-2">LEVEL UP!</p>
                  )}
                  <p className="text-muted-foreground">
                    Level {completedWorkoutData.level} - {completedWorkoutData.badge}
                  </p>
                  <p className="text-primary font-semibold mt-2">
                    {completedWorkoutData.points} Total Points
                  </p>
                </div>
                <Button
                  data-testid="share-instagram-button"
                  onClick={handleShareToInstagram}
                  className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white hover:opacity-90 rounded-sm font-bold uppercase tracking-wider h-12"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share to Instagram
                </Button>
                <Button
                  data-testid="skip-share-button"
                  onClick={() => setShareDialogOpen(false)}
                  className="w-full bg-secondary text-white hover:bg-secondary/80 rounded-sm font-medium h-12"
                >
                  Skip for Now
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Workouts Grid */}
        {workouts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Loading your first workout...</p>
            <p className="text-sm text-muted-foreground">If workouts don't appear, please refresh the page</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workouts.map((workout, index) => (
              <motion.div
                key={workout.workout_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  data-testid={`workout-card-${workout.workout_id}`}
                  className="bg-card border-border hover:border-primary/50 transition-colors duration-300"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <CardTitle className="text-xl">{workout.title}</CardTitle>
                        {workout.required_level > 1 && (
                          <div className="mt-2">
                            <span className="bg-primary/20 text-primary border border-primary/50 rounded-full px-2 py-1 text-xs font-bold uppercase tracking-wider">
                              Level {workout.required_level}
                            </span>
                          </div>
                        )}
                      </div>
                      {isWorkoutCompleted(workout.workout_id) && (
                        <Check className="w-6 h-6 text-accent" data-testid="completed-check" />
                      )}
                    </div>
                    <CardDescription className="whitespace-pre-line text-sm leading-relaxed">{workout.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{workout.duration_minutes} min</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Flame className="w-4 h-4" />
                        <span className={difficultyColors[workout.difficulty]}>{workout.difficulty}</span>
                      </div>
                    </div>
                    <div className="mb-4">
                      <span className="bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider">
                        {workout.category}
                      </span>
                    </div>
                    <Button
                      data-testid={`complete-workout-button-${workout.workout_id}`}
                      onClick={() => handleCompleteWorkout(workout.workout_id)}
                      disabled={isWorkoutCompleted(workout.workout_id)}
                      className="w-full bg-primary text-white hover:bg-primary/90 rounded-sm font-bold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isWorkoutCompleted(workout.workout_id) ? 'Completed' : 'Complete Workout'}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Workouts;
