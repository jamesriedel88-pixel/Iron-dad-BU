import { useState, useEffect } from 'react';
import axios from 'axios';
import { User as UserIcon, Mail, Calendar, Trophy, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/auth/me`, { withCredentials: true });
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

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
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight uppercase mb-8">Profile</h1>

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {/* Progress Info */}
        <Card data-testid="progress-info-card" className="bg-card border-border mt-6">
          <CardHeader>
            <CardTitle>Your Journey</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">About DadWeapon Levels</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Complete 30 workouts to level up and earn new badges. Each workout gives you 10 points.
                Track your progress on the dashboard and compete with other dads in the community.
              </p>
            </div>
            <Separator />
            <div>
              <h3 className="font-semibold mb-2">Badge System</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🥉</span>
                  <span className="text-muted-foreground">Level 1 - Beginner</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚔️</span>
                  <span className="text-muted-foreground">Level 2 - Warrior</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🏆</span>
                  <span className="text-muted-foreground">Level 3 - Champion</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">👑</span>
                  <span className="text-muted-foreground">Level 4 - Legend</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🔥</span>
                  <span className="text-muted-foreground">Level 5+ - Weapon Master</span>
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
