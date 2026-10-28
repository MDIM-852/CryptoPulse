'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useTrade } from '@/context/trade-context';
import { UserProfile, ActivityLog, UserRole } from '@/types';
import { createClient } from '@/lib/supabase/client';
import {
  DEMO_ADMIN_USER,
  DEMO_REGULAR_USER,
  INITIAL_ACTIVITY_LOGS,
} from '@/lib/supabase/mock-store';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDate, formatDateTime } from '@/lib/formatters';
import { toast } from 'sonner';
import {
  ShieldAlert,
  Users,
  Activity,
  Trash2,
  Lock,
  Radio,
  CheckCircle,
  LogIn,
  DollarSign,
  BellRing,
  AlertOctagon,
} from 'lucide-react';

const STORAGE_KEY_ADMIN_USERS = 'cryptopulse_admin_all_users';

export default function AdminDashboardPage() {
  const { user, role, onlineUsers, isConfigured, switchDemoRole } = useAuth();
  const { killSwitchActive, toggleKillSwitch } = useTrade();
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load all users & audit logs
  useEffect(() => {
    async function loadData() {
      if (isConfigured) {
        const supabase = createClient();
        if (supabase) {
          try {
            const { data: profiles, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
            if (!error && profiles) {
              setUsersList(profiles as UserProfile[]);
            }

            const { data: logs } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(50);
            if (logs) {
              setActivityLogs(logs as ActivityLog[]);
            }
            setIsLoading(false);
            return;
          } catch (err) {
            console.warn('Failed to load admin data from Supabase:', err);
          }
        }
      }

      // Local storage fallback
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY_ADMIN_USERS);
        if (stored) {
          try {
            setUsersList(JSON.parse(stored));
          } catch {
            const fallback: UserProfile[] = [
              DEMO_ADMIN_USER,
              DEMO_REGULAR_USER,
              {
                id: 'usr-sim-03',
                email: 'crypto.whale@defi.eth',
                full_name: 'Dmitri Petrov',
                avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                role: 'user' as UserRole,
                is_disabled: false,
                created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
                updated_at: new Date().toISOString(),
              },
              {
                id: 'usr-sim-04',
                email: 'lucas.m@stanford.edu',
                full_name: 'Lucas Miller',
                avatar_url: null,
                role: 'user' as UserRole,
                is_disabled: true,
                created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
                updated_at: new Date().toISOString(),
              },
            ];
            setUsersList(fallback);
          }
        } else {
          const initial: UserProfile[] = [
            DEMO_ADMIN_USER,
            DEMO_REGULAR_USER,
            {
              id: 'usr-sim-03',
              email: 'crypto.whale@defi.eth',
              full_name: 'Dmitri Petrov',
              avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
              role: 'user' as UserRole,
              is_disabled: false,
              created_at: new Date(Date.now() - 40 * 86400000).toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              id: 'usr-sim-04',
              email: 'lucas.m@stanford.edu',
              full_name: 'Lucas Miller',
              avatar_url: null,
              role: 'user' as UserRole,
              is_disabled: true,
              created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
              updated_at: new Date().toISOString(),
            },
          ];
          setUsersList(initial);
          localStorage.setItem(STORAGE_KEY_ADMIN_USERS, JSON.stringify(initial));
        }
      }
      setIsLoading(false);
    }

    loadData();
  }, [isConfigured]);

  const persistUsers = (updated: UserProfile[]) => {
    setUsersList(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_ADMIN_USERS, JSON.stringify(updated));
    }
  };

  // Toggle User Disabled status
  const handleToggleDisabled = async (targetUser: UserProfile) => {
    if (targetUser.id === user?.id) {
      toast.error('You cannot disable your own administrator account.');
      return;
    }

    const nextState = !targetUser.is_disabled;

    if (isConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { error } = await supabase
          .from('profiles')
          .update({ is_disabled: nextState })
          .eq('id', targetUser.id);
        if (error) {
          toast.error(`Failed to update user: ${error.message}`);
          return;
        }
      }
    }

    const updated = usersList.map((u) =>
      u.id === targetUser.id ? { ...u, is_disabled: nextState } : u
    );
    persistUsers(updated);
    toast.success(`User ${targetUser.email} is now ${nextState ? 'Disabled' : 'Active'}`);
  };

  // Delete User
  const handleDeleteUser = async (targetUser: UserProfile) => {
    if (targetUser.id === user?.id) {
      toast.error('You cannot delete your own administrator account.');
      return;
    }

    if (isConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { error } = await supabase.from('profiles').delete().eq('id', targetUser.id);
        if (error) {
          toast.error(`Failed to delete user: ${error.message}`);
          return;
        }
      }
    }

    const updated = usersList.filter((u) => u.id !== targetUser.id);
    persistUsers(updated);
    toast.success(`User ${targetUser.email} has been deleted.`);
  };

  // Non-Admin Permission Guard
  if (role !== 'admin') {
    return (
      <div className="py-16 max-w-lg mx-auto text-center space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-destructive/10 text-destructive mx-auto flex items-center justify-center">
          <Lock className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold">Admin Access Required</h2>
        <p className="text-sm text-muted-foreground">
          You are currently logged in with a standard <strong>user</strong> role. Administrator privileges are required to view this dashboard.
        </p>
        <div className="pt-2">
          <Button onClick={() => switchDemoRole('admin')} className="gap-2">
            <ShieldAlert className="h-4 w-4" />
            Switch to Admin Mode
          </Button>
        </div>
      </div>
    );
  }

  const activeUserCount = usersList.filter((u) => !u.is_disabled).length;
  const disabledUserCount = usersList.filter((u) => u.is_disabled).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Terminal</h1>
            <Badge variant="default" className="text-xs uppercase font-mono px-2 py-0.5">
              Superadmin
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Realtime user presence, security policies, trading kill-switch, and audit logs.
          </p>
        </div>

        {/* Global Trading Kill-Switch */}
        <div className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
          killSwitchActive ? 'bg-destructive/10 border-destructive/40' : 'bg-muted/60 border-border'
        }`}>
          <div className="flex items-center gap-2">
            <AlertOctagon className={`h-5 w-5 ${killSwitchActive ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`} />
            <div className="text-left">
              <p className="text-xs font-bold text-foreground">Global Trading Kill-Switch</p>
              <p className="text-[10px] text-muted-foreground">
                {killSwitchActive ? 'HALTED: All trades blocked' : 'NORMAL: Trading active'}
              </p>
            </div>
          </div>
          <Switch
            checked={killSwitchActive}
            onCheckedChange={(checked) => toggleKillSwitch(checked)}
          />
        </div>
      </div>

      {/* Admin Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Registered Users */}
        <Card className="bg-card/60 border-border/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Users
              </p>
              <h3 className="text-2xl font-bold font-mono mt-1">{usersList.length}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {activeUserCount} Active • {disabledUserCount} Disabled
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* Live Realtime Presence */}
        <Card className="bg-card/60 border-border/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Live Presence
              </p>
              <h3 className="text-2xl font-bold font-mono mt-1 text-emerald-600 dark:text-emerald-400">
                {onlineUsers.length} Online
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Supabase Realtime Channel</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Radio className="h-5 w-5 animate-pulse" />
            </div>
          </CardContent>
        </Card>

        {/* Security Isolation */}
        <Card className="bg-card/60 border-border/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Database RLS
              </p>
              <h3 className="text-2xl font-bold font-mono mt-1 text-primary">Enforced</h3>
              <p className="text-xs text-muted-foreground mt-1">Tenant Data Isolated</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <CheckCircle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        {/* System Health */}
        <Card className="bg-card/60 border-border/80 shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Trading Engine
              </p>
              <h3 className={`text-2xl font-bold font-mono mt-1 ${killSwitchActive ? 'text-destructive' : 'text-emerald-500'}`}>
                {killSwitchActive ? 'HALTED' : '100% OK'}
              </h3>
              <p className="text-xs text-muted-foreground mt-1">Testnet & Paper Ready</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <Activity className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="bg-muted/80 p-1">
          <TabsTrigger value="users" className="gap-2 text-xs font-semibold">
            <Users className="h-3.5 w-3.5" />
            User Management ({usersList.length})
          </TabsTrigger>
          <TabsTrigger value="presence" className="gap-2 text-xs font-semibold">
            <Radio className="h-3.5 w-3.5" />
            Live Presence ({onlineUsers.length})
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2 text-xs font-semibold">
            <Activity className="h-3.5 w-3.5" />
            Audit Logs ({activityLogs.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: User Management Table */}
        <TabsContent value="users" className="space-y-4">
          <div className="rounded-2xl border bg-card/80 backdrop-blur-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 text-xs hover:bg-transparent">
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersList.map((u) => {
                  const initials = (u.full_name || u.email)
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase();

                  const isSelf = u.id === user?.id;

                  return (
                    <TableRow key={u.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={u.avatar_url || ''} />
                            <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm leading-none flex items-center gap-1.5">
                              {u.full_name || 'Anonymous'}
                              {isSelf && (
                                <span className="text-[10px] text-muted-foreground font-normal">(You)</span>
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground mt-0.5">{u.email}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={u.role === 'admin' ? 'default' : 'secondary'}
                          className="text-[10px] uppercase font-mono px-2 py-0.5"
                        >
                          {u.role}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={!u.is_disabled}
                            disabled={isSelf}
                            onCheckedChange={() => handleToggleDisabled(u)}
                          />
                          <span
                            className={`text-xs font-medium ${
                              u.is_disabled ? 'text-destructive font-semibold' : 'text-emerald-600'
                            }`}
                          >
                            {u.is_disabled ? 'Disabled' : 'Active'}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground font-mono">
                        {formatDate(u.created_at)}
                      </TableCell>

                      <TableCell className="text-right pr-6">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                          disabled={isSelf}
                          onClick={() => handleDeleteUser(u)}
                          title="Delete user"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Tab 2: Live Presence List */}
        <TabsContent value="presence" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {onlineUsers.map((online) => (
              <Card key={online.user_id} className="bg-card/70 border-border/80 shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10 ring-2 ring-emerald-500/40">
                        <AvatarFallback className="bg-emerald-500/10 text-emerald-600 font-bold text-xs">
                          {online.full_name?.substring(0, 2).toUpperCase() || 'US'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background" />
                    </div>
                    <div>
                      <p className="font-bold text-sm leading-none">{online.full_name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{online.email}</p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                        Active now
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase font-mono">
                    {online.role}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab 3: System Audit Logs */}
        <TabsContent value="activity" className="space-y-4">
          <Card className="bg-card/70 border-border/80 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Activity Audit Stream</CardTitle>
              <CardDescription>
                Chronological log of authentication events, trades, and target price alerts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-background/60 border text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                      {log.action.includes('LOGIN') ? (
                        <LogIn className="h-3.5 w-3.5" />
                      ) : log.action.includes('TRANSACTION') ? (
                        <DollarSign className="h-3.5 w-3.5" />
                      ) : (
                        <BellRing className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{log.action}</span>
                        <span className="text-muted-foreground">({log.user_email || 'System'})</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {JSON.stringify(log.details)}
                      </p>
                    </div>
                  </div>
                  <span className="text-muted-foreground text-[11px]">
                    {formatDateTime(log.created_at)}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
