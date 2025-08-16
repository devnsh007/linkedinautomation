"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  FileText,
  Eye,
  Heart,
  Users,
  Calendar,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);

  // Get current logged-in user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
      }
    });
  }, []);

  // Fetch profile, posts, schedule
  useEffect(() => {
    if (!user) return;

    // 1. Profile
    supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()
      .then(({ data }) => {
        if (data) setProfile(data);
      });

    // 2. Recent posts
    supabase
      .from("posts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) setRecentPosts(data);
      });

    // 3. Scheduled posts
    supabase
      .from("scheduled_posts")
      .select("*")
      .eq("user_id", user.id)
      .order("scheduled_time", { ascending: true })
      .then(({ data }) => {
        if (data) setSchedule(data);
      });
  }, [user]);

  // Stats
  const stats = [
    {
      label: "Posts This Month",
      value: profile?.posts_count || 0,
      change: "+12%",
      icon: FileText,
      color: "blue",
    },
    {
      label: "Total Impressions",
      value: profile?.impressions || 0,
      change: "+18%",
      icon: Eye,
      color: "green",
    },
    {
      label: "Engagement Rate",
      value: profile?.engagement_rate
        ? `${profile.engagement_rate}%`
        : "0%",
      change: "+2.1%",
      icon: Heart,
      color: "pink",
    },
    {
      label: "New Connections",
      value: profile?.new_connections || 0,
      change: "+8%",
      icon: Users,
      color: "purple",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Welcome, {profile?.full_name || user?.email || "User"} 👋
        </h1>
        <p className="text-muted-foreground">
          Here’s your LinkedIn automation dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <Card key={idx}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-green-500">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Posts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPosts.length === 0 ? (
            <p className="text-muted-foreground">No posts found</p>
          ) : (
            <ul className="space-y-4">
              {recentPosts.map((post, idx) => (
                <li
                  key={idx}
                  className="p-3 rounded-lg border hover:bg-muted/30 transition"
                >
                  <p className="font-medium">{post.content}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {schedule.length === 0 ? (
            <p className="text-muted-foreground">No scheduled posts</p>
          ) : (
            <ul className="space-y-4">
              {schedule.map((item, idx) => (
                <li
                  key={idx}
                  className="p-3 rounded-lg border hover:bg-muted/30 transition"
                >
                  <p className="font-medium">{item.content}</p>
                  <p className="text-xs text-muted-foreground">
                    Scheduled for{" "}
                    {new Date(item.scheduled_time).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
