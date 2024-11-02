"use client";

// Previous imports remain the same...

export default function DailyStats() {
  // Previous state and hooks remain the same...

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Previous weekly overview content remains the same */}
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