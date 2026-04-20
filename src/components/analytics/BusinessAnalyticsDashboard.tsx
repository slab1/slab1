
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  DollarSign,
  Download,
  Plus,
  Calendar,
  Filter,
  RefreshCw,
  BarChart3
} from "lucide-react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { useAnalytics, AnalyticsData } from '@/hooks/use-analytics';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

type BusinessGoal = AnalyticsData['goals'][0];

export const BusinessAnalyticsDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState('30d');
  const { data: analytics, isLoading: loading } = useAnalytics(dateRange);
  const [goals, setGoals] = useState<AnalyticsData['goals']>([]);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target: 0,
    deadline: '',
  });

  useEffect(() => {
    if (analytics?.goals) {
      setGoals(analytics.goals);
    }
  }, [analytics]);

  const metrics = analytics?.metrics || [];

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.target || !newGoal.deadline) {
      toast.error("Please fill in all required fields");
      return;
    }

    const goal: BusinessGoal = {
      id: Math.random().toString(36).substr(2, 9),
      title: newGoal.title,
      description: newGoal.description,
      progress: 0,
      target: newGoal.target,
      deadline: newGoal.deadline,
      status: 'on-track'
    };

    setGoals([...goals, goal]);
    setIsAddingGoal(false);
    setNewGoal({ title: '', description: '', target: 0, deadline: '' });
    toast.success("New strategic goal added");
  };

  const exportReport = () => {
    const csvContent = [
      ['Metric', 'Value', 'Target', 'Unit', 'Trend'],
      ...metrics.map(m => [m.name, m.value, m.target, m.unit, m.trend])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `bi_report_${dateRange}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Report exported successfully");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
      case 'on-track':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
      case 'at-risk':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
      case 'behind':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        <span className="ml-2">Loading business analytics...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Business Intelligence</h2>
          <p className="text-muted-foreground">Strategic planning and key performance indicators</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-muted rounded-md p-1 mr-2">
            {['7d', '30d', '90d', '12m'].map((range) => (
              <Button
                key={range}
                variant={dateRange === range ? "secondary" : "ghost"}
                size="sm"
                className="h-8 text-xs"
                onClick={() => setDateRange(range)}
              >
                {range.toUpperCase()}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Set New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Strategic Goal</DialogTitle>
                <DialogDescription>
                  Define a new business objective to track progress.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g. Increase Customer Retention"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe how to achieve this goal..."
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="target">Target Value</Label>
                    <Input
                      id="target"
                      type="number"
                      placeholder="0"
                      value={newGoal.target || ''}
                      onChange={(e) => setNewGoal({ ...newGoal, target: Number(e.target.value) })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="deadline">Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingGoal(false)}>Cancel</Button>
                <Button onClick={handleAddGoal}>Create Goal</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <Card key={metric.id} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              {getTrendIcon(metric.trend)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metric.unit === '$' && '$'}
                {metric.value.toLocaleString()}
                {metric.unit !== '$' && ` ${metric.unit}`}
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  Target: {metric.unit === '$' && '$'}{metric.target.toLocaleString()}{metric.unit !== '$' && ` ${metric.unit}`}
                </p>
                <div className="flex items-center gap-1">
                  {getStatusIcon(metric.status)}
                  <span className={`text-xs font-medium ${metric.trend === 'up' ? 'text-green-600' : metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                </div>
              </div>
              <div className="mt-4 w-full bg-secondary h-1 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    metric.status === 'good' ? 'bg-green-500' : 
                    metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min((metric.value / metric.target) * 100, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business Goals */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Strategic Goals
            </CardTitle>
            <CardDescription>Track progress towards key business objectives</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {goals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No strategic goals defined yet.
                </div>
              ) : (
                goals.map((goal) => (
                  <div key={goal.id} className="group relative border rounded-xl p-5 hover:border-primary/50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-bold text-lg">{goal.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{goal.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(goal.status)}
                          <Badge variant={
                            goal.status === 'on-track' ? 'default' :
                            goal.status === 'at-risk' ? 'secondary' : 'destructive'
                          }>
                            {goal.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Due: {new Date(goal.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Overall Progress</span>
                        <span className="text-muted-foreground font-mono">
                          {goal.progress.toLocaleString()} / {goal.target.toLocaleString()}
                        </span>
                      </div>
                      <div className="relative w-full bg-secondary h-3 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${
                            goal.status === 'on-track' ? 'bg-primary' : 
                            goal.status === 'at-risk' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${Math.min((goal.progress / goal.target) * 100, 100)}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow-sm">
                          {Math.round((goal.progress / goal.target) * 100)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Performance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Goal Distribution
            </CardTitle>
            <CardDescription>Status breakdown of all objectives</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                { status: 'On Track', count: goals.filter(g => g.status === 'on-track').length, color: '#3b82f6' },
                { status: 'At Risk', count: goals.filter(g => g.status === 'at-risk').length, color: '#eab308' },
                { status: 'Behind', count: goals.filter(g => g.status === 'behind').length, color: '#ef4444' },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="status" />
                <YAxis hide />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {[0, 1, 2].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#eab308', '#ef4444'][index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  On Track
                </span>
                <span className="font-bold">{goals.filter(g => g.status === 'on-track').length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  At Risk
                </span>
                <span className="font-bold">{goals.filter(g => g.status === 'at-risk').length}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  Behind
                </span>
                <span className="font-bold">{goals.filter(g => g.status === 'behind').length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Business Performance Trends</CardTitle>
            <CardDescription>Historical data and projection for key metrics</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs">
              <div className="w-3 h-3 rounded-full bg-[#8884d8]" />
              <span>Revenue</span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <div className="w-3 h-3 rounded-full bg-[#82ca9d]" />
              <span>Customers</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { month: 'Jan', revenue: 85000, customers: 180, satisfaction: 4.2 },
                { month: 'Feb', revenue: 92000, customers: 195, satisfaction: 4.3 },
                { month: 'Mar', revenue: 108000, customers: 210, satisfaction: 4.5 },
                { month: 'Apr', revenue: 115000, customers: 225, satisfaction: 4.6 },
                { month: 'May', revenue: 125000, customers: 234, satisfaction: 4.7 },
                { month: 'Jun', revenue: 138000, customers: 250, satisfaction: 4.8 },
                { month: 'Jul', revenue: 145000, customers: 265, satisfaction: 4.8 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{fill: '#6b7280', fontSize: 12}}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{fill: '#6b7280', fontSize: 12}}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8884d8" 
                  strokeWidth={3} 
                  dot={{r: 4, fill: '#8884d8', strokeWidth: 2, stroke: '#fff'}}
                  activeDot={{r: 6, strokeWidth: 0}}
                />
                <Line 
                  type="monotone" 
                  dataKey="customers" 
                  stroke="#82ca9d" 
                  strokeWidth={3} 
                  dot={{r: 4, fill: '#82ca9d', strokeWidth: 2, stroke: '#fff'}}
                  activeDot={{r: 6, strokeWidth: 0}}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

