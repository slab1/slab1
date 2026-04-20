import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Award, Target, Star, BarChart3, Calendar } from "lucide-react";

interface PerformanceMetric {
  id: string;
  staff_id: string;
  staff_name: string;
  staff_role: string;
  rating: number;
  tasks_completed: number;
  customer_feedback: number;
  attendance_rate: number;
  productivity_score: number;
  period: string;
}

// Mock performance data
const MOCK_PERFORMANCE: PerformanceMetric[] = [
  {
    id: "1",
    staff_id: "staff-1",
    staff_name: "John Doe",
    staff_role: "waiter",
    rating: 4.5,
    tasks_completed: 85,
    customer_feedback: 4.3,
    attendance_rate: 95,
    productivity_score: 88,
    period: "2024-01"
  },
  {
    id: "2",
    staff_id: "staff-2",
    staff_name: "Jane Smith",
    staff_role: "chef",
    rating: 4.8,
    tasks_completed: 92,
    customer_feedback: 4.7,
    attendance_rate: 98,
    productivity_score: 94,
    period: "2024-01"
  },
  {
    id: "3",
    staff_id: "staff-3",
    staff_name: "Mike Johnson",
    staff_role: "manager",
    rating: 4.2,
    tasks_completed: 78,
    customer_feedback: 4.1,
    attendance_rate: 92,
    productivity_score: 85,
    period: "2024-01"
  },
];

function getPerformanceBadge(score: number): { variant: "default" | "secondary" | "destructive" | "outline", label: string } {
  if (score >= 90) return { variant: "default", label: "Excellent" };
  if (score >= 80) return { variant: "secondary", label: "Good" };
  if (score >= 70) return { variant: "outline", label: "Average" };
  return { variant: "destructive", label: "Needs Improvement" };
}

function getRatingStars(rating: number) {
  return "★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating));
}

export default function StaffPerformance() {
  const [selectedPeriod, setSelectedPeriod] = useState("2024-01");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const filteredPerformance = MOCK_PERFORMANCE.filter(metric => {
    const matchesPeriod = metric.period === selectedPeriod;
    const matchesDepartment = selectedDepartment === "all" || metric.staff_role === selectedDepartment;
    return matchesPeriod && matchesDepartment;
  });

  const averageMetrics = {
    rating: filteredPerformance.reduce((sum, p) => sum + p.rating, 0) / filteredPerformance.length || 0,
    attendance: filteredPerformance.reduce((sum, p) => sum + p.attendance_rate, 0) / filteredPerformance.length || 0,
    productivity: filteredPerformance.reduce((sum, p) => sum + p.productivity_score, 0) / filteredPerformance.length || 0,
    feedback: filteredPerformance.reduce((sum, p) => sum + p.customer_feedback, 0) / filteredPerformance.length || 0,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Staff Performance</h1>
          <p className="text-muted-foreground">Track and analyze staff performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-01">January 2024</SelectItem>
              <SelectItem value="2023-12">December 2023</SelectItem>
              <SelectItem value="2023-11">November 2023</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="waiter">Waiters</SelectItem>
              <SelectItem value="chef">Chefs</SelectItem>
              <SelectItem value="manager">Managers</SelectItem>
              <SelectItem value="host">Hosts</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageMetrics.rating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              {getRatingStars(averageMetrics.rating)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageMetrics.attendance.toFixed(0)}%</div>
            <Progress value={averageMetrics.attendance} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivity Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageMetrics.productivity.toFixed(0)}%</div>
            <Progress value={averageMetrics.productivity} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Feedback</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageMetrics.feedback.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              {getRatingStars(averageMetrics.feedback)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Individual Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Overall Rating</TableHead>
                <TableHead>Tasks Completed</TableHead>
                <TableHead>Customer Feedback</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Productivity</TableHead>
                <TableHead>Performance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPerformance.map((metric) => {
                const performanceBadge = getPerformanceBadge(metric.productivity_score);
                
                return (
                  <TableRow key={metric.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {metric.staff_name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        {metric.staff_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {metric.staff_role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{metric.rating.toFixed(1)}</span>
                        <span className="text-yellow-500">{getRatingStars(metric.rating)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{metric.tasks_completed}</span>
                        <div className="w-20">
                          <Progress value={metric.tasks_completed} className="h-2" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{metric.customer_feedback.toFixed(1)}</span>
                        <span className="text-yellow-500">{getRatingStars(metric.customer_feedback)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{metric.attendance_rate}%</span>
                        <div className="w-16">
                          <Progress value={metric.attendance_rate} className="h-2" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{metric.productivity_score}%</span>
                        <div className="w-16">
                          <Progress value={metric.productivity_score} className="h-2" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={performanceBadge.variant}>
                        {performanceBadge.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          
          {filteredPerformance.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No performance data available for the selected period.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Top Performers This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredPerformance
              .sort((a, b) => b.productivity_score - a.productivity_score)
              .slice(0, 3)
              .map((performer, index) => (
                <div key={performer.id} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-gray-100 text-gray-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      <span className="font-bold">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{performer.staff_name}</p>
                      <p className="text-sm text-muted-foreground">{performer.staff_role}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Productivity</span>
                      <span className="font-medium">{performer.productivity_score}%</span>
                    </div>
                    <Progress value={performer.productivity_score} />
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}