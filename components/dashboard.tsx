"use client";

import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskManager from "@/components/task-manager";
import PomodoroTimer from "@/components/pomodoro-timer";
import DailyNotes from "@/components/daily-notes";
import DailyStats from "@/components/daily-stats";
import Leaderboard from "@/components/leaderboard";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/lib/store";
import { LogOut, ListTodo, Timer, ScrollText, BarChart2, Trophy } from "lucide-react";

export default function Dashboard() {
  const { userName, clearUserName } = useUserStore();

  useEffect(() => {
    const handleTabSwitch = () => {
      const tabsList = document.querySelector('[role="tablist"]');
      const pomodoroTab = tabsList?.querySelector('[value="pomodoro"]') as HTMLElement;
      if (pomodoroTab) {
        pomodoroTab.click();
      }
    };

    document.addEventListener('switchToPomodoroTab', handleTabSwitch);
    return () => {
      document.removeEventListener('switchToPomodoroTab', handleTabSwitch);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Welcome, {userName}!</h1>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <Button
              variant="outline"
              size="icon"
              onClick={clearUserName}
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="tasks" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <ListTodo className="h-4 w-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="pomodoro" className="flex items-center gap-2">
              <Timer className="h-4 w-4" />
              <span className="hidden sm:inline">Pomodoro</span>
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <ScrollText className="h-4 w-4" />
              <span className="hidden sm:inline">Notes</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              <span className="hidden sm:inline">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Leaders</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-4">
            <TaskManager />
          </TabsContent>

          <TabsContent value="pomodoro" className="space-y-4">
            <PomodoroTimer />
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <DailyNotes />
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <DailyStats />
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-4">
            <Leaderboard />
          </TabsContent>
        </Tabs>
      </main>

      {/* <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        Made with ❤️ by <a href="https://bishnu.info.np" target="_blank" rel="noopener noreferrer" className="hover:underline">Bishnu Thapa</a>
      </footer> */}
    </div>
  );
}