import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Plus, Apple } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const Nutrition = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Protein'
  });

  const fetchTips = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/nutrition`, { withCredentials: true });
      setTips(response.data);
    } catch (error) {
      toast.error('Failed to fetch nutrition tips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTips();
  }, []);

  const handleCreateTip = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BACKEND_URL}/api/nutrition`, formData, { withCredentials: true });
      toast.success('Nutrition tip added successfully!');
      setDialogOpen(false);
      setFormData({
        title: '',
        content: '',
        category: 'Protein'
      });
      fetchTips();
    } catch (error) {
      toast.error('Failed to add nutrition tip');
    }
  };

  const categoryColors = {
    'Protein': 'bg-red-500/10 text-red-400 border-red-500/20',
    'Carbs': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    'Fats': 'bg-green-500/10 text-green-400 border-green-500/20',
    'Hydration': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'Supplements': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'Meal Timing': 'bg-orange-500/10 text-orange-400 border-orange-500/20'
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
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight uppercase mb-2">Nutrition</h1>
            <p className="text-base md:text-lg text-muted-foreground">Fuel your transformation with balanced meals</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                data-testid="add-nutrition-tip-button"
                className="bg-primary text-white hover:bg-primary/90 rounded-sm font-bold uppercase tracking-wider"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Tip
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Add Nutrition Tip</DialogTitle>
                <DialogDescription>Share your nutrition knowledge</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTip}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      data-testid="tip-title-input"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-zinc-900/50 border-zinc-800"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      data-testid="tip-content-input"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="bg-zinc-900/50 border-zinc-800"
                      rows={4}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger data-testid="tip-category-select" className="bg-zinc-900/50 border-zinc-800">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Protein">Protein</SelectItem>
                        <SelectItem value="Carbs">Carbs</SelectItem>
                        <SelectItem value="Fats">Fats</SelectItem>
                        <SelectItem value="Hydration">Hydration</SelectItem>
                        <SelectItem value="Supplements">Supplements</SelectItem>
                        <SelectItem value="Meal Timing">Meal Timing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <Button
                    type="submit"
                    data-testid="submit-tip-button"
                    className="bg-primary text-white hover:bg-primary/90 rounded-sm font-bold uppercase tracking-wider"
                  >
                    Add Tip
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tips Grid */}
        {tips.length === 0 ? (
          <div className="text-center py-12">
            <Apple className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No nutrition tips yet. Add your first tip to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tips.map((tip, index) => (
              <motion.div
                key={tip.tip_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  data-testid={`nutrition-tip-card-${tip.tip_id}`}
                  className="bg-card border-border hover:border-primary/50 transition-colors duration-300 h-full"
                >
                  <CardHeader>
                    <div className="mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${categoryColors[tip.category] || 'bg-zinc-800 text-zinc-300 border-zinc-700'}`}>
                        {tip.category}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{tip.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed">{tip.content}</p>
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

export default Nutrition;
