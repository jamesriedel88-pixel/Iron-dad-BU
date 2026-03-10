import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Plus, Check, Clock, Flame } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Workouts = () => {
  const [workouts, setWorkouts] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration_minutes: 30,
    difficulty: 'Intermediate',
    category: 'Strength'
  });

  const fetchData = async () => {
    try {
      const [workoutsRes, progressRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/workouts`, { withCredentials: true }),
        axios.get(`${BACKEND_URL}/api/workouts/progress`, { withCredentials: true })
      ]);
      setWorkouts(workoutsRes.data);
      setProgress(progressRes.data);
    } catch (error) {
      toast.error('Failed to fetch workouts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateWorkout = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BACKEND_URL}/api/workouts`, formData, { withCredentials: true });
      toast.success('Workout created successfully!');
      setDialogOpen(false);
      setFormData({
        title: '',
        description: '',
        duration_minutes: 30,
        difficulty: 'Intermediate',
        category: 'Strength'
      });
      fetchData();
    } catch (error) {
      toast.error('Failed to create workout');
    }
  };

  const handleCompleteWorkout = async (workoutId) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/workouts/complete`,
        { workout_id: workoutId },
        { withCredentials: true }
      );
      
      if (response.data.leveled_up) {
        toast.success(`🎉 Level Up! You're now ${response.data.badge} - Level ${response.data.level}!`);
      } else {
        toast.success(`Workout completed! +10 points`);
      }
      
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to complete workout');
    }
  };

  const isWorkoutCompleted = (workoutId) => {
    return progress?.completed_workout_ids?.includes(workoutId);
  };

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight uppercase mb-2">Workouts</h1>
            <p className="text-base md:text-lg text-muted-foreground">Complete workouts to level up and earn badges</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                data-testid="create-workout-button"
                className="bg-primary text-white hover:bg-primary/90 rounded-sm font-bold uppercase tracking-wider"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Workout
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Create New Workout</DialogTitle>
                <DialogDescription>Add a new workout to your library</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateWorkout}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      data-testid="workout-title-input"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-zinc-900/50 border-zinc-800"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      data-testid="workout-description-input"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-zinc-900/50 border-zinc-800"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      data-testid="workout-duration-input"
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                      className="bg-zinc-900/50 border-zinc-800"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                    >
                      <SelectTrigger data-testid="workout-difficulty-select" className="bg-zinc-900/50 border-zinc-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger data-testid="workout-category-select" className="bg-zinc-900/50 border-zinc-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Strength">Strength</SelectItem>
                        <SelectItem value="Cardio">Cardio</SelectItem>
                        <SelectItem value="HIIT">HIIT</SelectItem>
                        <SelectItem value="Core">Core</SelectItem>
                        <SelectItem value="Flexibility">Flexibility</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button
                    type="submit"
                    data-testid="submit-workout-button"
                    className="bg-primary text-white hover:bg-primary/90 rounded-sm font-bold uppercase tracking-wider"
                  >
                    Create Workout
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Workouts Grid */}
        {workouts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No workouts yet. Create your first workout to get started!</p>
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
                      <CardTitle className="text-xl">{workout.title}</CardTitle>
                      {isWorkoutCompleted(workout.workout_id) && (
                        <Check className="w-6 h-6 text-accent" data-testid="completed-check" />
                      )}
                    </div>
                    <CardDescription>{workout.description}</CardDescription>
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
