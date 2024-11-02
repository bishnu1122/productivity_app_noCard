"use client";

import { useState, useEffect } from 'react';
import { useUserStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { format, startOfWeek, addDays } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface DailyData {
  date: string;
  minutes: number;
}

interface CategoryData {
  name: string;
  minutes: number;
}

export default function DailyStats() {
  const [weeklyData, setWeeklyData] = useState<DailyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const { userName } = useUserStore();

  useEffect(() => {
    fetchStats();
  }, [userName]);

  const fetchStats = async () => {
    try {
      const startDate = startOfWeek(new Date());
      const { data: sessions } = await supabase
        .from('pomodoro_sessions')
        .select('*')
        .eq('user_name', userName)
        .gte('completed_at', format(startDate, 'yyyy-MM-dd'));

      if (sessions) {
        // Process weekly data
        const dailyMinutes: { [key: string]: number } = {};
        const categoryMinutes: { [key: string]: number } = {};

        sessions.forEach(session => {
          const date = format(new Date(session.completed_at), 'EEE');
          const minutes = session.duration / 60;
          
          dailyMinutes[date] = (dailyMinutes[date] || 0) + minutes;
          
          const category = session.task_description?.split(' ')[0] || 'Other';
          categoryMinutes[category] = (categoryMinutes[category] || 0) + minutes;
        });

        // Create weekly data array with all days
        const weekData = Array.from({ length: 7 }, (_, i) => {
          const date = format(addDays(startDate, i), 'EEE');
          return {
            date,
            minutes: dailyMinutes[date] || 0
          };
        });

        // Create category data array
        const catData = Object.entries(categoryMinutes).map(([name, minutes]) => ({
          name,
          minutes
        }));

        setWeeklyData(weekData);
        setCategoryData(catData);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const totalTime = weeklyData.reduce((sum, day) => sum + day.minutes, 0);
  const averageTime = totalTime / 7;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Overview</CardTitle>
        </CardHeader>
        <CardContent>
        <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={formatMinutes}
                />
                <Tooltip
                  formatter={(value: number) => formatMinutes(value)}
                  labelStyle={{ color: 'var(--foreground)' }}
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)'
                  }}
                />
                <Bar
                  dataKey="minutes"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Time</p>
              <p className="text-2xl font-bold">{formatMinutes(totalTime)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Daily Average</p>
              <p className="text-2xl font-bold">{formatMinutes(averageTime)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily Habits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-yellow-500" />
                <span>Wake-up Time</span>
              </div>
              <span className="font-medium">{wakeUpTime || 'Not set'}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-green-500" />
                <span>Exercise</span>
              </div>
              <span className="font-medium">{exerciseCompleted ? 'Completed' : 'Not done'}</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" />
                <span>Meditation</span>
              </div>
              <span className="font-medium">{meditationMinutes} minutes</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}