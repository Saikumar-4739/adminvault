/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar as RNStatusBar,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Bell, Package, Ticket, Users, FileText, Lock,
  Plus, Activity, Search, Menu, LayoutDashboard,
  Database, Mail, KeySquare, MessageSquare, X, ChevronRight, LogOut, ArrowRight, Smartphone
} from 'lucide-react-native';

// Import Services
// Import Services
import {
  authService,
  dashboardService,
  ticketService,
  assetService
} from '../services/api';
import { LoginUserModel } from '@adminvault/shared-models';

const { width } = Dimensions.get('window');

// --- Types ---
type ScreenName = 'Dashboard' | 'Tickets' | 'Assets' | 'Employees' | 'Docs' | 'Menu';

// --- Menu Data ---
const MENU_ITEMS = [
  { name: 'Dashboard', icon: LayoutDashboard, screen: 'Dashboard' },
  { name: 'Configuration', icon: Database, screen: 'Menu' },
  { name: 'Assets Info', icon: Package, screen: 'Assets' },
  { name: 'Licenses', icon: KeySquare, screen: 'Menu' },
  { name: 'Safe Vault', icon: Lock, screen: 'Menu' },
  { name: 'Support Tickets', icon: Ticket, screen: 'Tickets' },
  { name: 'Quick Support', icon: MessageSquare, screen: 'Tickets' },
  { name: 'Email Info', icon: Mail, screen: 'Menu' },
  { name: 'Documents', icon: FileText, screen: 'Docs' },
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // Null for loading
  const [currentScreen, setCurrentScreen] = useState<ScreenName>('Dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Check Auth on Mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('auth_user');
      if (token && userData) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (e) {
      setIsAuthenticated(false);
    }
  };

  const handleLoginSuccess = async (userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await authService.logOutUser({ email: user?.email, token: await AsyncStorage.getItem('auth_token') || '' });
    } catch (e) {
      // Ignore logout errors
    }
    await AsyncStorage.clear();
    setIsAuthenticated(false);
    setIsMenuOpen(false);
  };

  const navigateTo = (screen: ScreenName) => {
    setCurrentScreen(screen);
    setIsMenuOpen(false);
  };

  if (isAuthenticated === null) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Tickets': return <TicketsScreen />;
      case 'Assets': return <AssetsScreen />;
      case 'Docs': return <DocsScreen />;
      default: return <DashboardContent onNavigate={navigateTo} user={user} />;
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="light" />
        <LinearGradient
          colors={['#0f172a', '#1e293b', '#0f172a']}
          style={styles.background}
        />

        {/* Background Blobs */}
        <View style={[styles.blob, styles.blob1]} />
        <View style={[styles.blob, styles.blob2]} />
        <BlurView intensity={Platform.OS === 'ios' ? 80 : 30} style={StyleSheet.absoluteFill} tint="dark" />

        <SafeAreaView style={styles.safeArea}>
          {renderScreen()}

          {/* Floating Bottom Nav */}
          <View style={styles.bottomNavContainer}>
            <BlurView intensity={90} tint="dark" style={styles.bottomNav}>
              <NavIcon icon={Activity} active={currentScreen === 'Dashboard'} label="Dash" onPress={() => navigateTo('Dashboard')} />
              <NavIcon icon={Ticket} active={currentScreen === 'Tickets'} label="Tickets" onPress={() => navigateTo('Tickets')} />
              <NavIcon icon={Package} active={currentScreen === 'Assets'} label="Assets" onPress={() => navigateTo('Assets')} />
              <NavIcon icon={Menu} active={isMenuOpen} label="Menu" onPress={() => setIsMenuOpen(true)} />
            </BlurView>
          </View>
        </SafeAreaView>

        {/* Full Screen Menu Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isMenuOpen}
          onRequestClose={() => setIsMenuOpen(false)}
        >
          <BlurView intensity={100} tint="dark" style={styles.menuModal}>
            <SafeAreaView style={styles.menuContent}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Menu</Text>
                <TouchableOpacity onPress={() => setIsMenuOpen(false)} style={styles.closeButton}>
                  <X color="#fff" size={24} />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {MENU_ITEMS.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={styles.menuItem}
                      onPress={() => item.screen !== 'Menu' ? navigateTo(item.screen as ScreenName) : null}
                    >
                      <View style={styles.menuItemLeft}>
                        <View style={styles.menuIconBg}>
                          <Icon color="#fff" size={20} />
                        </View>
                        <Text style={styles.menuItemText}>{item.name}</Text>
                      </View>
                      <ChevronRight color="#475569" size={20} />
                    </TouchableOpacity>
                  )
                })}
                <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.menuIconBg, { backgroundColor: '#ef4444' }]}>
                      <LogOut color="#fff" size={20} />
                    </View>
                    <Text style={[styles.menuItemText, { color: '#ef4444' }]}>Logout</Text>
                  </View>
                </TouchableOpacity>
              </ScrollView>
            </SafeAreaView>
          </BlurView>
        </Modal>

      </View>
    </SafeAreaProvider>
  );
}

// --- Screens Components ---

const LoginScreen = ({ onLoginSuccess }: { onLoginSuccess: (user: any) => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(`Error`, `Please enter email and password`);
      return;
    }

    setIsLoading(true);
    try {
      const loginData = new LoginUserModel(email, password, 0, 0); // No location for now
      const response = await authService.loginUser(loginData);

      if (response.status && response.accessToken) {
        await AsyncStorage.setItem('auth_token', response.accessToken);
        await AsyncStorage.setItem('refresh_token', response.refreshToken);
        const userInfo = {
          fullName: response.userInfo.fullName,
          email: response.userInfo.email,
          role: response.userInfo.role
        };
        await AsyncStorage.setItem('auth_user', JSON.stringify(userInfo));
        onLoginSuccess(userInfo);
      } else {
        Alert.alert('Login Failed', response.message || 'Invalid credentials');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.loginContainer}>
      <LinearGradient
        colors={['#0f172a', '#1e293b']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.loginContent}>
        <View style={styles.logoBox}>
          <Smartphone color="#fff" size={40} />
        </View>
        <Text style={styles.loginTitle}>AdminVault</Text>
        <Text style={styles.loginSubtitle}>Enterprise Management</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="admin@example.com"
            placeholderTextColor="#64748b"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            placeholderTextColor="#64748b"
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.loginButtonText}>Sign In</Text>
                <ArrowRight color="#fff" size={20} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};


const DashboardContent = ({ onNavigate, user }: { onNavigate: (s: ScreenName) => void, user: any }) => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Using dashboardService to fetch real data
      const data = await dashboardService.getStats();
      if (data.status) {
        setStats(data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  // Safe access to stats
  const totalAssets = stats?.assets?.total || '0';
  const activeTickets = stats?.tickets?.total || '0';
  const totalEmployees = stats?.employees?.total || '0';
  const totalLicenses = stats?.licenses?.total || '0';
  const recentTickets = stats?.tickets?.recent || [];

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.username}>{user?.fullName || 'User'}</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <View style={styles.iconContainer}>
              <Search color="#94a3b8" size={20} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <View style={styles.iconContainer}>
              <Bell color="#fff" size={20} />
              <View style={styles.badge} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Stats Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll} contentContainerStyle={styles.statsContent}>
        <StatsCard label="Total Assets" value={totalAssets.toString()} icon={Package} gradient={['#10b981', '#059669']} />
        <StatsCard label="Active Tickets" value={activeTickets.toString()} icon={Ticket} gradient={['#f59e0b', '#d97706']} trend="Active" />
        <StatsCard label="Employees" value={totalEmployees.toString()} icon={Users} gradient={['#8b5cf6', '#7c3aed']} />
        <StatsCard label="Licenses" value={totalLicenses.toString()} icon={Lock} gradient={['#3b82f6', '#2563eb']} />
      </ScrollView>

      {/* Quick Actions */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
      </View>
      <View style={styles.actionsGrid}>
        <ActionButton icon={Plus} label="New Ticket" primary onPress={() => onNavigate('Tickets')} />
        <ActionButton icon={Package} label="Add Asset" onPress={() => onNavigate('Assets')} />
        <ActionButton icon={Users} label="Add User" onPress={() => onNavigate('Employees')} />
        <ActionButton icon={FileText} label="Docs" onPress={() => onNavigate('Docs')} />
      </View>

      {/* Recent Tickets */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Tickets</Text>
          <TouchableOpacity onPress={() => onNavigate('Tickets')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {isLoading ? (
          <ActivityIndicator color="#3b82f6" style={{ marginTop: 20 }} />
        ) : recentTickets.length > 0 ? (
          recentTickets.map((t: any) => (
            <TicketItem
              key={t.id}
              title={t.subject}
              user={t.raisedByEmployee?.firstName || 'Unknown'}
              status={t.ticketStatus}
              priority={t.priorityEnum}
              time={'Today'} // Simplify time for demo
            />
          ))
        ) : (
          <Text style={{ color: '#94a3b8', textAlign: 'center', marginTop: 10 }}>No recent tickets</Text>
        )}
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const TicketsScreen = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await ticketService.getAllTickets();
      if (res.status) setTickets(res.data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.screenTitle}>Support Tickets</Text>
      <ScrollView contentContainerStyle={styles.listContent}>
        {loading ? <ActivityIndicator /> : tickets.map((t: any) => (
          <TicketItem
            key={t.id}
            title={t.subject}
            user={`${t.raisedByEmployee?.firstName} ${t.raisedByEmployee?.lastName}`}
            status={t.ticketStatus}
            priority={t.priorityEnum}
            time={new Date(t.createdAt).toLocaleDateString()}
          />
        ))}
      </ScrollView>
      <View style={{ height: 100 }} />
    </View>
  );
};

const AssetsScreen = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const res = await assetService.getAllAssets({});
      if (res.status) setAssets(res.data);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.screenTitle}>Assets Inventory</Text>
      <ScrollView contentContainerStyle={styles.listContent}>
        {loading ? <ActivityIndicator /> : assets.map((a: any) => (
          <AssetItem
            key={a.id}
            name={a.modelName}
            tag={a.assetTagId}
            status={a.assetStatus}
            type={a.category?.typeName || 'Device'}
          />
        ))}
      </ScrollView>
      <View style={{ height: 100 }} />
    </View>
  );
};

const DocsScreen = () => (
  <View style={styles.screenContainer}>
    <Text style={styles.screenTitle}>Documents</Text>
    <ScrollView contentContainerStyle={styles.listContent}>
      <DocItem name="Employee Handbook 2024" type="PDF" size="2.4 MB" />
      <DocItem name="IT Security Policy" type="DOCX" size="1.1 MB" />
      <DocItem name="Asset Request Form" type="PDF" size="500 KB" />
      <DocItem name="Holiday Calendar" type="PDF" size="800 KB" />
    </ScrollView>
    <View style={{ height: 100 }} />
  </View>
);

// --- Sub Components ---

const AssetItem = ({ name, tag, status, type }: { name: string; tag: string; status: string; type: string }) => (
  <View style={styles.listItem}>
    <View style={styles.listItemLeft}>
      <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
        <Package color="#60a5fa" size={20} />
      </View>
      <View>
        <Text style={styles.listItemTitle}>{name}</Text>
        <Text style={styles.listItemSub}>{tag} • {type}</Text>
      </View>
    </View>
    <View style={styles.statusBadge}>
      <Text style={[styles.statusText, {
        color: status === 'Available' ? '#4ade80' : status === 'In Use' ? '#60a5fa' : '#f59e0b'
      }]}>{status}</Text>
    </View>
  </View>
);

const DocItem = ({ name, type, size }: { name: string; type: string; size: string }) => (
  <View style={styles.listItem}>
    <View style={styles.listItemLeft}>
      <View style={[styles.iconBox, { backgroundColor: 'rgba(139, 92, 246, 0.2)' }]}>
        <FileText color="#a78bfa" size={20} />
      </View>
      <View>
        <Text style={styles.listItemTitle}>{name}</Text>
        <Text style={styles.listItemSub}>{type} • {size}</Text>
      </View>
    </View>
  </View>
);

const TicketItem = ({ title, user, status, priority, time }: { title: string; user: string; status: string; priority: string; time: string }) => {
  const getStatusColor = (s: string) => {
    switch (s?.toLowerCase()) {
      case 'open': return '#ef4444';
      case 'in progress': return '#f59e0b';
      case 'closed': return '#10b981';
      default: return '#94a3b8';
    }
  };
  return (
    <View style={styles.ticketItem}>
      <View style={styles.ticketLeft}>
        <View style={[styles.statusLine, { backgroundColor: getStatusColor(status) }]} />
        <View>
          <Text style={styles.ticketTitle}>{title}</Text>
          <Text style={styles.ticketSub}>{user} • {time}</Text>
        </View>
      </View>
      <View style={styles.ticketRight}>
        <View style={styles.priorityBadge}>
          <Text style={styles.priorityText}>{priority}</Text>
        </View>
      </View>
    </View>
  );
};

const StatsCard = ({ label, value, icon: Icon, gradient, trend }: { label: string; value: string; icon: any; gradient: string[]; trend?: string }) => (
  <LinearGradient
    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
    style={styles.statsCard}
  >
    <View style={styles.statsIconRow}>
      <LinearGradient colors={gradient} style={styles.miniIconBg}>
        <Icon color="#fff" size={16} />
      </LinearGradient>
      {trend && <Text style={styles.trendText}>{trend}</Text>}
    </View>
    <Text style={styles.statsValue}>{value}</Text>
    <Text style={styles.statsLabel}>{label}</Text>
  </LinearGradient>
);

const ActionButton = ({ icon: Icon, label, primary, onPress }: { icon: any; label: string; primary?: boolean; onPress: () => void }) => (
  <TouchableOpacity style={styles.actionButton} onPress={onPress}>
    <LinearGradient
      colors={primary ? ['#3b82f6', '#2563eb'] : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
      style={styles.actionIcon}
    >
      <Icon color={primary ? '#fff' : '#94a3b8'} size={24} />
    </LinearGradient>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const NavIcon = ({ icon: Icon, active, label, onPress }: { icon: any; active: boolean; label: string; onPress: () => void }) => (
  <TouchableOpacity style={styles.navItem} onPress={onPress}>
    <Icon color={active ? '#3b82f6' : '#94a3b8'} size={24} />
    <Text style={[styles.navLabel, active && styles.activeNavLabel]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: { ...StyleSheet.absoluteFillObject },
  blob: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    opacity: 0.4,
  },
  blob1: { backgroundColor: '#4f46e5', top: -width * 0.2, left: -width * 0.2 },
  blob2: { backgroundColor: '#06b6d4', bottom: -width * 0.2, right: -width * 0.2 },
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  greeting: { fontSize: 14, color: '#94a3b8', fontWeight: '600' },
  username: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  headerActions: { flexDirection: 'row', gap: 12 },
  iconButton: { borderRadius: 20, overflow: 'hidden' },
  iconContainer: {
    width: 40, height: 40, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  badge: {
    position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#ef4444', borderWidth: 1, borderColor: '#0f172a',
  },
  statsScroll: { marginBottom: 24 },
  statsContent: { paddingHorizontal: 20, gap: 12 },
  statsCard: {
    width: 140, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  statsIconRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  miniIconBg: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  trendText: { fontSize: 12, color: '#4ade80', fontWeight: '600' },
  statsValue: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  statsLabel: { fontSize: 12, color: '#94a3b8' },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  seeAll: { color: '#3b82f6', fontSize: 14, fontWeight: '500' },
  actionsGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 30 },
  actionButton: { alignItems: 'center', width: width / 4 - 20 },
  actionIcon: {
    width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 8,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  actionLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '500', textAlign: 'center' },
  ticketItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.4)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 12,
  },
  ticketLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusLine: { width: 4, height: 32, borderRadius: 2 },
  ticketTitle: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 2 },
  ticketSub: { color: '#94a3b8', fontSize: 13 },
  ticketRight: { alignItems: 'flex-end' },
  priorityBadge: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  priorityText: { color: '#cbd5e1', fontSize: 12, fontWeight: '500' },
  bottomNavContainer: { position: 'absolute', bottom: 20, left: 20, right: 20, borderRadius: 30, overflow: 'hidden' },
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10 },
  navItem: { alignItems: 'center', justifyContent: 'center', padding: 8 },
  navLabel: { fontSize: 10, color: '#94a3b8', marginTop: 4 },
  activeNavLabel: { color: '#3b82f6' },

  // Menu & Lists Styles
  screenContainer: { flex: 1, paddingTop: 20 },
  screenTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', paddingHorizontal: 20, marginBottom: 20 },
  listContent: { paddingHorizontal: 20, paddingBottom: 120 },
  listItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16,
    backgroundColor: 'rgba(30, 41, 59, 0.4)', borderRadius: 16, marginBottom: 12,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  listItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  listItemTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  listItemSub: { color: '#94a3b8', fontSize: 13, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.05)' },
  statusText: { fontSize: 12, fontWeight: '600' },

  menuModal: { flex: 1, justifyContent: 'flex-end' },
  menuContent: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.95)' },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  menuTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  closeButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  menuIconBg: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' },
  menuItemText: { fontSize: 16, color: '#fff', fontWeight: '500' },

  // Login Styles
  loginContainer: { flex: 1, justifyContent: 'center' },
  loginContent: { padding: 40, alignItems: 'center' },
  logoBox: {
    width: 80, height: 80, borderRadius: 24, backgroundColor: '#3b82f6',
    justifyContent: 'center', alignItems: 'center', marginBottom: 24,
    shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20
  },
  loginTitle: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  loginSubtitle: { fontSize: 16, color: '#94a3b8', marginBottom: 40 },
  form: { width: '100%' },
  label: { color: '#cbd5e1', fontSize: 14, marginBottom: 8, fontWeight: '500' },
  input: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12, padding: 16, color: '#fff', marginBottom: 20, fontSize: 16
  },
  loginButton: {
    backgroundColor: '#3b82f6', padding: 16, borderRadius: 12, flexDirection: 'row',
    justifyContent: 'center', alignItems: 'center', marginTop: 10, gap: 10
  },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
