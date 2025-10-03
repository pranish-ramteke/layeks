import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hotel, Bed, Calendar, Users } from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    hotels: 0,
    roomTypes: 0,
    bookings: 0,
    pendingBookings: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [hotelsRes, roomTypesRes, bookingsRes, pendingRes] = await Promise.all([
        supabase.from('hotels').select('id', { count: 'exact', head: true }),
        supabase.from('room_types').select('id', { count: 'exact', head: true }),
        supabase.from('bookings').select('id', { count: 'exact', head: true }),
        supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      setStats({
        hotels: hotelsRes.count || 0,
        roomTypes: roomTypesRes.count || 0,
        bookings: bookingsRes.count || 0,
        pendingBookings: pendingRes.count || 0,
      });
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: "Total Hotels", value: stats.hotels, icon: Hotel, color: "text-blue-600" },
    { title: "Room Types", value: stats.roomTypes, icon: Bed, color: "text-green-600" },
    { title: "Total Bookings", value: stats.bookings, icon: Calendar, color: "text-purple-600" },
    { title: "Pending Bookings", value: stats.pendingBookings, icon: Users, color: "text-orange-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your hotel management system</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
