import { useState, useEffect } from 'react';
import axios from 'axios';
import { User as UserIcon, Mail, Calendar, Trophy, Zap, Edit, Camera, Heart, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [healthDialogOpen, setHealthDialogOpen] = useState(false);
  const [profilePictureDialogOpen, setProfilePictureDialogOpen] = useState(false);
  const [healthScore, setHealthScore] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [formData, setFormData] = useState({
    before_photo: '',
    height: '',
    weight: '',
    occupation: ''
  });
  const [healthFormData, setHealthFormData] = useState({
    health_sleep: 5,
    health_physical_activity: 5,
    health_water_intake: 5,
    health_smoker: false,
    health_nutrition: 5,
    health_mental: 5,
    health_time: 5,
    health_fitness: 5,
    health_strength: 5
  });
  const [imagePreview, setImagePreview] = useState(null);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/auth/me`, { withCredentials: true });
      setUser(response.data);
      setFormData({
        before_photo: response.data.before_photo || '',
        height: response.data.height || '',
        weight: response.data.weight || '',
        occupation: response.data.occupation || ''
      });
      if (response.data.before_photo) {
        setImagePreview(response.data.before_photo);
      }
      
      // Fetch health score
      const healthResponse = await axios.get(`${BACKEND_URL}/api/profile/health-score`, { withCredentials: true });
      setHealthScore(healthResponse.data);
      setHealthFormData({
        health_sleep: healthResponse.data.sleep || 5,
        health_physical_activity: healthResponse.data.physical_activity || 5,
        health_water_intake: healthResponse.data.water_intake || 5,
        health_smoker: healthResponse.data.smoker || false,
        health_nutrition: healthResponse.data.nutrition || 5,
        health_mental: healthResponse.data.mental_health || 5,
        health_time: healthResponse.data.time || 5,
        health_fitness: healthResponse.data.fitness || 5,
        health_strength: healthResponse.data.strength || 5
      });
    } catch (error) {
      console.error('Failed to fetch user:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({ ...formData, before_photo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!formData.before_photo || !formData.height || !formData.weight) {
      toast.error('Please fill in all required fields (before photo, height, weight)');
      return;
    }

    try {
      await axios.put(
        `${BACKEND_URL}/api/profile`,
        formData,
        { withCredentials: true }
      );
      toast.success('Profile updated successfully!');
      setDialogOpen(false);
      fetchUser();
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleUpdateHealthScore = async (e) => {
    e.preventDefault();
    
    try {
      await axios.put(
        `${BACKEND_URL}/api/profile/health-score`,
        healthFormData,
        { withCredentials: true }
      );
      toast.success('Dad Health Score updated successfully!');
      setHealthDialogOpen(false);
      fetchUser();
    } catch (error) {
      toast.error('Failed to update health score');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight uppercase">Profile</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                data-testid="edit-profile-button"
                className="bg-primary text-white hover:bg-primary/90 rounded-sm font-bold uppercase tracking-wider"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>Update your body stats and information</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateProfile}>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
                  <div>
                    <Label htmlFor="before_photo" className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                      Before Photo <span className="text-destructive">*</span>
                    </Label>
                    <div className="mt-2">
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Before photo preview"
                            className="w-full max-w-sm h-auto rounded-sm border border-border"
                          />
                          <Button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setFormData({ ...formData, before_photo: '' });
                            }}
                            className="mt-2 bg-secondary text-white hover:bg-secondary/80"
                          >
                            Remove Photo
                          </Button>
                        </div>
                      ) : (
                        <label
                          htmlFor="before_photo"
                          className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-zinc-800 rounded-sm cursor-pointer hover:border-primary transition-colors"
                        >
                          <Camera className="w-12 h-12 text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">Click to upload before photo</span>
                          <input
                            id="before_photo"
                            data-testid="before-photo-input"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="height" className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                      Height <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="height"
                      data-testid="height-input"
                      type="text"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      placeholder="e.g., 6ft 0in or 183cm"
                      className="bg-zinc-900/50 border-zinc-800 focus:border-primary focus:ring-1 focus:ring-primary rounded-sm h-12"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight" className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                      Weight <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="weight"
                      data-testid="weight-input"
                      type="text"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      placeholder="e.g., 200 lbs or 90 kg"
                      className="bg-zinc-900/50 border-zinc-800 focus:border-primary focus:ring-1 focus:ring-primary rounded-sm h-12"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="occupation" className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                      Occupation (Optional)
                    </Label>
                    <Input
                      id="occupation"
                      data-testid="occupation-input"
                      type="text"
                      value={formData.occupation}
                      onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                      placeholder="e.g., Software Engineer"
                      className="bg-zinc-900/50 border-zinc-800 focus:border-primary focus:ring-1 focus:ring-primary rounded-sm h-12"
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button
                    type="submit"
                    data-testid="save-profile-button"
                    className="bg-primary text-white hover:bg-primary/90 rounded-sm font-bold uppercase tracking-wider"
                  >
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Profile Card */}
        <Card data-testid="profile-card" className="bg-card border-border mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user?.picture} />
                <AvatarFallback className="bg-primary text-white text-3xl">
                  {user?.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-3xl font-bold mb-2">{user?.name}</h2>
                <div className="flex flex-col md:flex-row gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center md:justify-start">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Joined {formatDate(user?.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card data-testid="level-stat-card" className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Current Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-primary">LEVEL {user?.level}</div>
              <p className="text-sm text-muted-foreground mt-1">{user?.current_badge}</p>
            </CardContent>
          </Card>

          <Card data-testid="workouts-stat-card" className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                Workouts Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-accent">{user?.workouts_completed}</div>
              <p className="text-sm text-muted-foreground mt-1">Total workouts</p>
            </CardContent>
          </Card>

          <Card data-testid="points-stat-card" className="bg-card border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Total Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-primary">{user?.points}</div>
              <p className="text-sm text-muted-foreground mt-1">XP earned</p>
            </CardContent>
          </Card>
        </div>


        {/* Dad Health Score Card */}
        <Card data-testid="dad-health-score-card" className="bg-card border-border mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-destructive" />
                Dad Health Score
              </CardTitle>
              <Dialog open={healthDialogOpen} onOpenChange={setHealthDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    data-testid="update-health-score-button"
                    className="bg-primary text-white hover:bg-primary/90 rounded-sm font-bold uppercase tracking-wider"
                  >
                    <Activity className="w-4 h-4 mr-2" />
                    Update Score
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Update Dad Health Score</DialogTitle>
                    <DialogDescription>Rate each category out of 10 (higher is better)</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleUpdateHealthScore}>
                    <div className="space-y-6 max-h-[60vh] overflow-y-auto px-1">
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Sleep Quality</Label>
                          <span className="text-primary font-bold">{healthFormData.health_sleep}/10</span>
                        </div>
                        <Slider
                          value={[healthFormData.health_sleep]}
                          onValueChange={(value) => setHealthFormData({ ...healthFormData, health_sleep: value[0] })}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Physical Activity</Label>
                          <span className="text-primary font-bold">{healthFormData.health_physical_activity}/10</span>
                        </div>
                        <Slider
                          value={[healthFormData.health_physical_activity]}
                          onValueChange={(value) => setHealthFormData({ ...healthFormData, health_physical_activity: value[0] })}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Water Intake</Label>
                          <span className="text-primary font-bold">{healthFormData.health_water_intake}/10</span>
                        </div>
                        <Slider
                          value={[healthFormData.health_water_intake]}
                          onValueChange={(value) => setHealthFormData({ ...healthFormData, health_water_intake: value[0] })}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="smoker-toggle">Smoker or Vaper</Label>
                        <Switch
                          id="smoker-toggle"
                          checked={healthFormData.health_smoker}
                          onCheckedChange={(checked) => setHealthFormData({ ...healthFormData, health_smoker: checked })}
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Nutrition</Label>
                          <span className="text-primary font-bold">{healthFormData.health_nutrition}/10</span>
                        </div>
                        <Slider
                          value={[healthFormData.health_nutrition]}
                          onValueChange={(value) => setHealthFormData({ ...healthFormData, health_nutrition: value[0] })}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Mental Health</Label>
                          <span className="text-primary font-bold">{healthFormData.health_mental}/10</span>
                        </div>
                        <Slider
                          value={[healthFormData.health_mental]}
                          onValueChange={(value) => setHealthFormData({ ...healthFormData, health_mental: value[0] })}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Time Management</Label>
                          <span className="text-primary font-bold">{healthFormData.health_time}/10</span>
                        </div>
                        <Slider
                          value={[healthFormData.health_time]}
                          onValueChange={(value) => setHealthFormData({ ...healthFormData, health_time: value[0] })}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Fitness Level</Label>
                          <span className="text-primary font-bold">{healthFormData.health_fitness}/10</span>
                        </div>
                        <Slider
                          value={[healthFormData.health_fitness]}
                          onValueChange={(value) => setHealthFormData({ ...healthFormData, health_fitness: value[0] })}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <Label>Strength Level</Label>
                          <span className="text-primary font-bold">{healthFormData.health_strength}/10</span>
                        </div>
                        <Slider
                          value={[healthFormData.health_strength]}
                          onValueChange={(value) => setHealthFormData({ ...healthFormData, health_strength: value[0] })}
                          max={10}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    </div>
                    <DialogFooter className="mt-6">
                      <Button
                        type="submit"
                        data-testid="save-health-score-button"
                        className="bg-primary text-white hover:bg-primary/90 rounded-sm font-bold uppercase tracking-wider"
                      >
                        Save Health Score
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {healthScore && healthScore.total_score > 0 ? (
              <div>
                <div className="text-center mb-6">
                  <div className="text-6xl font-extrabold text-primary mb-2">
                    {healthScore.total_score}/10
                  </div>
                  <p className="text-muted-foreground">Overall Dad Health Score</p>
                  <Progress value={(healthScore.total_score / 10) * 100} className="h-4 mt-4" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-zinc-900/50 p-4 rounded-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Sleep Quality</span>
                      <span className="text-primary font-bold">{healthScore.sleep || 0}/10</span>
                    </div>
                    <Progress value={((healthScore.sleep || 0) / 10) * 100} className="h-2" />
                  </div>
                  
                  <div className="bg-zinc-900/50 p-4 rounded-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Physical Activity</span>
                      <span className="text-primary font-bold">{healthScore.physical_activity || 0}/10</span>
                    </div>
                    <Progress value={((healthScore.physical_activity || 0) / 10) * 100} className="h-2" />
                  </div>
                  
                  <div className="bg-zinc-900/50 p-4 rounded-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Water Intake</span>
                      <span className="text-primary font-bold">{healthScore.water_intake || 0}/10</span>
                    </div>
                    <Progress value={((healthScore.water_intake || 0) / 10) * 100} className="h-2" />
                  </div>
                  
                  <div className="bg-zinc-900/50 p-4 rounded-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Smoker/Vaper</span>
                      <span className={`font-bold ${healthScore.smoker ? 'text-destructive' : 'text-accent'}`}>
                        {healthScore.smoker ? 'Yes (0/10)' : 'No (10/10)'}
                      </span>
                    </div>
                    <Progress value={healthScore.smoker ? 0 : 100} className="h-2" />
                  </div>
                  
                  <div className="bg-zinc-900/50 p-4 rounded-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Nutrition</span>
                      <span className="text-primary font-bold">{healthScore.nutrition || 0}/10</span>
                    </div>
                    <Progress value={((healthScore.nutrition || 0) / 10) * 100} className="h-2" />
                  </div>
                  
                  <div className="bg-zinc-900/50 p-4 rounded-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Mental Health</span>
                      <span className="text-primary font-bold">{healthScore.mental_health || 0}/10</span>
                    </div>
                    <Progress value={((healthScore.mental_health || 0) / 10) * 100} className="h-2" />
                  </div>
                  
                  <div className="bg-zinc-900/50 p-4 rounded-sm md:col-span-2">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Time Management</span>
                      <span className="text-primary font-bold">{healthScore.time || 0}/10</span>
                    </div>
                    <Progress value={((healthScore.time || 0) / 10) * 100} className="h-2" />
                  </div>
                  
                  <div className="bg-zinc-900/50 p-4 rounded-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Fitness Level</span>
                      <span className="text-primary font-bold">{healthScore.fitness || 0}/10</span>
                    </div>
                    <Progress value={((healthScore.fitness || 0) / 10) * 100} className="h-2" />
                  </div>
                  
                  <div className="bg-zinc-900/50 p-4 rounded-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Strength Level</span>
                      <span className="text-primary font-bold">{healthScore.strength || 0}/10</span>
                    </div>
                    <Progress value={((healthScore.strength || 0) / 10) * 100} className="h-2" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Activity className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Track your overall health and wellness</p>
                <Button
                  data-testid="setup-health-score-button"
                  onClick={() => setHealthDialogOpen(true)}
                  className="bg-primary text-white hover:bg-primary/90 rounded-sm font-bold uppercase tracking-wider"
                >
                  Set Up Health Score
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Body Stats Card */}
        <Card data-testid="body-stats-card" className="bg-card border-border mb-6">
          <CardHeader>
            <CardTitle>Body Stats & Information</CardTitle>
          </CardHeader>
          <CardContent>
            {user?.before_photo || user?.height || user?.weight || user?.occupation ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {user?.before_photo && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Before Photo</h3>
                    <img
                      src={user.before_photo}
                      alt="Before transformation"
                      className="w-full max-w-xs h-auto rounded-sm border border-border"
                    />
                  </div>
                )}
                <div className="space-y-4">
                  {user?.height && (
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">Height</h3>
                      <p className="text-lg">{user.height}</p>
                    </div>
                  )}
                  {user?.weight && (
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">Weight</h3>
                      <p className="text-lg">{user.weight}</p>
                    </div>
                  )}
                  {user?.occupation && (
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">Occupation</h3>
                      <p className="text-lg">{user.occupation}</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Camera className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Complete your profile to track your transformation</p>
                <Button
                  data-testid="setup-profile-button"
                  onClick={() => setDialogOpen(true)}
                  className="bg-primary text-white hover:bg-primary/90 rounded-sm font-bold uppercase tracking-wider"
                >
                  Setup Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress Info */}
        <Card data-testid="progress-info-card" className="bg-card border-border mt-6">
          <CardHeader>
            <CardTitle>Your Journey</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">About Iron Dad Levels</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Progress through 6 levels by completing workouts. Each level requires more dedication:
              </p>
              <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4">
                <li>• Level 1→2: Complete 5 workouts</li>
                <li>• Level 2→3: Complete 10 more workouts (15 total)</li>
                <li>• Level 3→4: Complete 20 more workouts (35 total)</li>
                <li>• Level 4→5: Complete 30 more workouts (65 total)</li>
                <li>• Level 5→6: Complete 40 more workouts (105 total)</li>
                <li>• Level 6+: Complete 50 more workouts (155 total)</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">
                Each workout gives you 10 points. Track your progress on the dashboard and compete with other dads in the community.
              </p>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2">Badge System</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🥉</span>
                  <span className="text-muted-foreground">Level 1 - Alpha Dad</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚔️</span>
                  <span className="text-muted-foreground">Level 2 - Relentless Dad</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  <span className="text-muted-foreground">Level 3 - Beast Mode</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👑</span>
                  <span className="text-muted-foreground">Level 4 - Savage</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔥</span>
                  <span className="text-muted-foreground">Level 5 - Unbreakable</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  <span className="text-muted-foreground">Level 6 - GOAT Dad</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
