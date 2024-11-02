"use client";

import { useState, useEffect } from 'react';
import { useUserStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, Clock, Play, Sun, Dumbbell, Brain, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface Task {
  id: number;
  user_name: string;
  description: string;
  completed: boolean;
  duration: number;
  due_date: string;
  created_at: string;
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [duration, setDuration] = useState('30');
  const [loading, setLoading] = useState(true);
  const { userName } = useUserStore();
  
  const [wakeUpTime, setWakeUpTime] = useState(format(new Date().setHours(6, 30), 'HH:mm'));
  const [exerciseCompleted, setExerciseCompleted] = useState(false);
  const [meditationMinutes, setMeditationMinutes] = useState('0');
  const [weeklyProgress] = useState(() => {
    return Array(7).fill(null).map((_, i) => ({
      date: format(new Date(Date.now() - i * 24 * 60 * 60 * 1000), 'EEE'),
      completion: Math.random() * 100
    }));
  });

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_name', userName)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userName) {
      fetchTasks();
      const today = new Date().toISOString().split('T')[0];
      const savedHabits = localStorage.getItem(`habits-${userName}-${today}`);
      if (savedHabits) {
        const habits = JSON.parse(savedHabits);
        setWakeUpTime(habits.wake_up_time);
        setExerciseCompleted(habits.exercise_completed);
        setMeditationMinutes(habits.meditation_minutes.toString());
      }
    }
  }, [userName]);

  const saveDailyHabits = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase.from('daily_habits').upsert({
        user_name: userName,
        wake_up_time: wakeUpTime,
        exercise_completed: exerciseCompleted,
        meditation_minutes: parseInt(meditationMinutes),
        date: today
      });

      if (error) throw error;
      toast.success('Daily habits saved successfully!');
    } catch (error) {
      toast.error('Failed to save daily habits');
    }
  };

  const startTask = (task: Task) => {
    localStorage.setItem('currentTask', JSON.stringify({
      id: task.id,
      description: task.description,
      duration: task.duration
    }));
    
    const event = new CustomEvent('switchToPomodoroTab');
    document.dispatchEvent(event);
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) {
      toast.error('Please enter a valid duration');
      return;
    }

    try {
      const { error } = await supabase.from('tasks').insert([
        {
          user_name: userName,
          description: newTask.trim(),
          completed: false,
          duration: Number(duration),
          due_date: new Date().toISOString(),
        },
      ]);

      if (error) throw error;
      
      setNewTask('');
      setDuration('30');
      fetchTasks();
      toast.success('Task added successfully');
    } catch (error) {
      toast.error('Failed to add task');
    }
  };

  const toggleTask = async (taskId: number, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId);

      if (error) throw error;
      
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, completed } : task
      ));
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      
      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="h-5 w-5 text-yellow-500" />
                  <div>
                    <div className="font-semibold">Wake-Up Time</div>
                    <div className="text-sm text-muted-foreground">Start your day right</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={wakeUpTime}
                    onChange={(e) => setWakeUpTime(e.target.value)}
                    className="w-32"
                  />
                  <Button onClick={saveDailyHabits} size="sm">Save</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="font-semibold">Daily Exercise</div>
                    <div className="text-sm text-muted-foreground">Stay active and healthy</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={exerciseCompleted}
                    onCheckedChange={(checked) => setExerciseCompleted(checked as boolean)}
                  />
                  <Button 
                    onClick={() => {
                      localStorage.setItem('exerciseTimer', JSON.stringify({
                        duration: 15,
                        description: 'Daily Exercise'
                      }));
                      const event = new CustomEvent('switchToPomodoroTab');
                      document.dispatchEvent(event);
                    }}
                    size="sm"
                    disabled={exerciseCompleted}
                  >
                    Start (15m)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="font-semibold">Meditation</div>
                    <div className="text-sm text-muted-foreground">Minutes of mindfulness</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={meditationMinutes}
                    onChange={(e) => setMeditationMinutes(e.target.value)}
                    className="w-20"
                    min="0"
                    max="120"
                  />
                  <Button 
                    onClick={() => {
                      localStorage.setItem('meditationTimer', JSON.stringify({
                        duration: 15,
                        description: 'Daily Meditation'
                      }));
                      const event = new CustomEvent('switchToPomodoroTab');
                      document.dispatchEvent(event);
                    }}
                    size="sm"
                    disabled={parseInt(meditationMinutes) > 0}
                  >
                    Start (15m)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Weekly Consistency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between gap-1">
              {weeklyProgress.map((day, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="text-xs text-muted-foreground">{day.date}</div>
                  <div
                    className="w-8 h-8 rounded-sm mt-1"
                    style={{
                      backgroundColor: `hsl(var(--chart-2) / ${day.completion}%)`,
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <form onSubmit={addTask} className="flex gap-2">
        <div className="flex-1 flex gap-2">
          <Input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1"
          />
          <div className="flex items-center gap-2 w-32">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Minutes"
              className="w-20"
              min="1"
            />
          </div>
        </div>
        <Button type="submit">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </form>

      <div className="space-y-2">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={(checked) => toggleTask(task.id, checked as boolean)}
                />
                <div className={task.completed ? 'line-through text-muted-foreground' : ''}>
                  <div>{task.description}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(task.duration)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {format(new Date(task.created_at), 'MMM d, yyyy')}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => startTask(task)}
                  className="flex items-center gap-1"
                  disabled={task.completed}
                >
                  <Play className="h-3 w-3" />
                  Start
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteTask(task.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}