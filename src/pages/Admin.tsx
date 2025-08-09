import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Navigate } from 'react-router-dom';
import { Users, DollarSign, TrendingUp, AlertCircle, Check, X, Eye, Building2, Gift, UserCheck, Bell, Plus, Edit, Trash, History, ArrowUpDown } from 'lucide-react';
import { PromotionForm, PromotionFormData } from '@/components/PromotionForm';
import { usePromotionApplication } from '@/hooks/usePromotionApplication';
import { useDepositApproval } from '@/hooks/useDepositApproval';
import { AdminLayout } from '@/components/AdminLayout';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EditUserModal } from '@/components/EditUserModal';
import { ViewUserDetails } from '@/components/ViewUserDetails';
import { AdminAgents } from '@/components/AdminAgents';
import { AdminBanks } from '@/components/AdminBanks';
interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'bonus';
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'awaiting_payment';
  bank_id?: string;
  proof_image_url?: string;
  admin_note?: string;
  created_at: string;
  profiles?: {
    full_name: string;
    username: string;
    balance: number;
  };
  bank?: {
    bank_name: string;
    account_number: string;
  };
}

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  username: string;
  balance: number;
  phone_number?: string;
  avatar_url?: string;
  created_at: string;
  last_login_at?: string;
  last_login_ip?: any;
  updated_at: string;
}

interface Promotion {
  id: string;
  title: string;
  description?: string;
  promotion_type: 'first_deposit' | 'time_based' | 'code_based';
  bonus_percentage?: number;
  bonus_amount?: number;
  min_deposit?: number;
  max_uses?: number;
  current_uses: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  promotion_code?: string;
  is_first_deposit_only: boolean;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

interface Agent {
  id: string;
  user_id: string;
  commission_percentage: number;
  total_commission: number;
  referral_code?: string | null;
  referral_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profile?: { full_name: string; username: string; phone_number?: string };
}

interface CommissionLevel {
  id: string;
  agent_id?: string;
  level: number;
  commission_percentage: number;
  created_at?: string;
  updated_at?: string;
}

const Admin = () => {
  const { isAdmin, isLoading } = useRole();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('dashboard');
  
  // All the existing state variables
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    pendingTransactions: 0,
    totalPromotions: 0,
    activePromotions: 0
  });
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [isPromotionFormOpen, setIsPromotionFormOpen] = useState(false);
  const [bonusAmount, setBonusAmount] = useState('');
  const [userDetailsOpenId, setUserDetailsOpenId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [addBonusUser, setAddBonusUser] = useState<UserProfile | null>(null);
  const [bettingHistoryUser, setBettingHistoryUser] = useState<UserProfile | null>(null);
  
  const [userDetailsViewMode, setUserDetailsViewMode] = useState<'details' | 'transactions'>('details');
  const { applyPromotionToDeposit } = usePromotionApplication();
  const { approveDeposit } = useDepositApproval();

  // Agents management state
  const [activeAgentTab, setActiveAgentTab] = useState<'list' | 'levels' | 'users'>('list');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [commissionLevels, setCommissionLevels] = useState<CommissionLevel[]>([]);
  const [newLevel, setNewLevel] = useState<number | ''>('');
  const [newLevelPercent, setNewLevelPercent] = useState<number | ''>('');
  const [assignUsername, setAssignUsername] = useState('');
  const [assignToAgentId, setAssignToAgentId] = useState<string | null>(null);

  // Users search/sort (Dashboard)
  const [userSearch, setUserSearch] = useState('');
  type UserSortKey = 'username' | 'full_name' | 'balance' | 'created_at' | 'total_deposit';
  const [userSortKey, setUserSortKey] = useState<UserSortKey>('created_at');
  const [userSortDir, setUserSortDir] = useState<'asc' | 'desc'>('desc');
  const toggleUserSort = (key: UserSortKey) => {
    if (userSortKey === key) setUserSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setUserSortKey(key); setUserSortDir('asc'); }
  };

  // Role filter and roles map
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'agent' | 'user'>('all');
  const [userRoles, setUserRoles] = useState<Record<string, ('admin' | 'agent' | 'user')[]>>({});

  // Transactions search/sort (Dashboard)
  const [txSearch, setTxSearch] = useState('');
  type TxSortKey = 'user' | 'type' | 'amount' | 'status' | 'created_at';
  const [txSortKey, setTxSortKey] = useState<TxSortKey>('created_at');
  const [txSortDir, setTxSortDir] = useState<'asc' | 'desc'>('desc');
  const toggleTxSort = (key: TxSortKey) => {
    if (txSortKey === key) setTxSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setTxSortKey(key); setTxSortDir('asc'); }
  };

  // Promotions search/sort (Dashboard)
  const [promoSearch, setPromoSearch] = useState('');
  type PromoSortKey = 'title' | 'promotion_type' | 'is_active' | 'start_date' | 'end_date';
  const [promoSortKey, setPromoSortKey] = useState<PromoSortKey>('start_date');
  const [promoSortDir, setPromoSortDir] = useState<'asc' | 'desc'>('desc');
  const togglePromoSort = (key: PromoSortKey) => {
    if (promoSortKey === key) setPromoSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setPromoSortKey(key); setPromoSortDir('asc'); }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
      fetchTransactions();
      fetchUsers();
      fetchPromotions();
      fetchAgents();
    }
  }, [isAdmin]);

  const fetchStats = async () => {
    try {
      const [usersResponse, transactionsResponse, promotionsResponse] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('transactions').select('*'),
        supabase.from('promotions').select('*')
      ]);

      const users = usersResponse.data || [];
      const transactions = transactionsResponse.data || [];
      const promotions = promotionsResponse.data || [];

      const totalDeposits = transactions
        .filter(t => t.type === 'deposit' && t.status === 'approved')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalWithdrawals = transactions
        .filter(t => t.type === 'withdrawal' && t.status === 'approved')
        .reduce((sum, t) => sum + t.amount, 0);

      const pendingTransactions = transactions
        .filter(t => t.status === 'pending').length;

      const activePromotions = promotions
        .filter(p => p.is_active && new Date(p.end_date) > new Date()).length;

      setStats({
        totalUsers: users.length,
        totalDeposits,
        totalWithdrawals,
        pendingTransactions,
        totalPromotions: promotions.length,
        activePromotions
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles!inner(full_name, username, balance),
          bank!transactions_bank_id_fkey(bank_name, account_number)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map the data to match the Transaction interface
      const mappedTransactions = (data || []).map((item: any) => ({
        ...item,
        profiles: item.profiles && !item.profiles.error ? item.profiles : undefined
      }));
      
      setTransactions(mappedTransactions as Transaction[]);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách giao dịch",
        variant: "destructive"
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch roles for these users
      const rolesMap: Record<string, ('admin' | 'agent' | 'user')[]> = {};
      const userIds = (data || []).map((u: any) => u.user_id);
      if (userIds.length > 0) {
        const { data: rolesData, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', userIds);
        if (!rolesError && rolesData) {
          rolesData.forEach((r: any) => {
            const uid = r.user_id as string;
            const role = r.role as 'admin' | 'agent' | 'user';
            if (!rolesMap[uid]) rolesMap[uid] = [];
            if (!rolesMap[uid].includes(role)) rolesMap[uid].push(role);
          });
        }
      }

      setUserRoles(rolesMap);
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách người dùng",
        variant: "destructive"
      });
    }
  };

  const fetchPromotions = async () => {
    try {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPromotions((data || []) as Promotion[]);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách khuyến mãi",
        variant: "destructive"
      });
    }
  };

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const list = data || [];
      const userIds = list.map((a: any) => a.user_id);

      let profilesMap = new Map<string, any>();
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, full_name, username, phone_number')
          .in('user_id', userIds);
        profiles?.forEach((p: any) => profilesMap.set(p.user_id, p));
      }

      const merged = list.map((a: any) => ({ ...a, profile: profilesMap.get(a.user_id) }));
      setAgents(merged as Agent[]);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách đại lý',
        variant: 'destructive',
      });
    }
  };

  const handleTransactionAction = async (transactionId: string, action: 'approve' | 'reject', adminNote?: string) => {
    try {
      const transaction = transactions.find(t => t.id === transactionId);
      if (!transaction) return;

      if (action === 'approve' && transaction.type === 'deposit') {
        const username = transaction.profiles?.username;
        if (!username) {
          toast({
            title: "Lỗi",
            description: "Không tìm thấy thông tin người dùng",
            variant: "destructive"
          });
          return;
        }
        
        const success = await approveDeposit(transactionId, username, transaction.amount);
        if (success) {
          toast({
            title: "Thành công",
            description: `Đã duyệt nạp tiền ${transaction.amount?.toLocaleString()} VND`,
          });
          setSelectedTransaction(null);
          fetchTransactions();
          fetchStats();
        }
      } else {
        const { error } = await supabase
          .from('transactions')
          .update({ 
            status: action === 'approve' ? 'approved' : 'rejected',
            admin_note: adminNote 
          })
          .eq('id', transactionId);

        if (error) throw error;

        toast({
          title: "Thành công",
          description: `Đã ${action === 'approve' ? 'duyệt' : 'từ chối'} ${transaction.type === 'deposit' ? 'nạp' : transaction.type === 'bonus' ? 'Bonus' : 'rút tiền'} ${transaction.amount?.toLocaleString()} VND`,
        });

        setSelectedTransaction(null);
        fetchTransactions();
        fetchStats();
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi xử lý giao dịch",
        variant: "destructive"
      });
    }
  };

  const handleAddBonus = async (targetUser?: UserProfile) => {
    const userForBonus = targetUser || selectedUser;
    if (!userForBonus || !bonusAmount) return;

    try {
      const amountToAdd = parseFloat(bonusAmount);
      if (isNaN(amountToAdd) || amountToAdd <= 0) {
        toast({
          title: "Lỗi",
          description: "Số tiền không hợp lệ",
          variant: "destructive"
        });
        return;
      }

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userForBonus.user_id,
          type: 'bonus',
          amount: amountToAdd,
          status: 'approved',
          admin_note: `Admin cộng tiền bonus: ${amountToAdd.toLocaleString()} VND`,
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Thành công",
        description: `Đã cộng ${amountToAdd.toLocaleString()} VND vào tài khoản và lưu vào lịch sử giao dịch`,
      });

      setBonusAmount('');
      setSelectedUser(null);
      setAddBonusUser(null);
      fetchUsers();
      fetchTransactions();
      fetchStats();
    } catch (error) {
      console.error('Error adding bonus:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi cộng tiền",
        variant: "destructive"
      });
    }
  };

  const handlePromotionSubmit = async (data: PromotionFormData) => {
    try {
      const promotionData = {
        title: data.title,
        description: data.description,
        promotion_type: data.promotionType,
        bonus_percentage: data.bonusType === 'percentage' ? data.bonusPercentage : null,
        bonus_amount: data.bonusType === 'amount' ? data.bonusAmount : null,
        min_deposit: data.minDeposit,
        max_uses: data.maxUses,
        current_uses: 0,
        start_date: data.startDate,
        end_date: data.endDate,
        is_active: data.isActive,
        promotion_code: data.promotionCode,
        is_first_deposit_only: data.isFirstDepositOnly,
        image_url: data.image_url
      };
      
      const { error } = await supabase
        .from('promotions')
        .insert([promotionData]);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã tạo khuyến mãi mới thành công"
      });

      setIsPromotionFormOpen(false);
      fetchPromotions();
      fetchStats();
    } catch (error) {
      console.error('Error creating promotion:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi tạo khuyến mãi",
        variant: "destructive"
      });
    }
  };

  const togglePromotionStatus = async (promotionId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('promotions')
        .update({ is_active: !currentStatus })
        .eq('id', promotionId);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: `Đã ${!currentStatus ? 'kích hoạt' : 'tắt'} khuyến mãi`
      });

      fetchPromotions();
      fetchStats();
    } catch (error) {
      console.error('Error toggling promotion:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi cập nhật khuyến mãi",
        variant: "destructive"
      });
    }
  };

  const getUserDepositStats = (userId: string) => {
    const userTransactions = transactions.filter(t => t.user_id === userId && t.type === 'deposit' && t.status === 'approved');
    return {
      count: userTransactions.length,
      total: userTransactions.reduce((sum, t) => sum + t.amount, 0)
    };
  };

  // Helper: derive highest priority role for a user
  const getTopRole = (userId: string): 'admin' | 'agent' | 'user' => {
    const roles = userRoles[userId] || [];
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('agent')) return 'agent';
    return 'user';
  };

  // Derived lists for Users (Dashboard)
  const filteredUsersDash = users.filter((u) => {
    const q = userSearch.trim().toLowerCase();
    const matchesText = !q || (u.full_name || '').toLowerCase().includes(q) || (u.username || '').toLowerCase().includes(q);
    const matchesRole = roleFilter === 'all' || getTopRole(u.user_id) === roleFilter;
    return matchesText && matchesRole;
  });

  const sortedUsersDash = React.useMemo(() => {
    const arr = [...filteredUsersDash];
    const getVal = (u: UserProfile, key: UserSortKey): string | number => {
      switch (key) {
        case 'username':
          return (u.username || '').toLowerCase();
        case 'full_name':
          return (u.full_name || '').toLowerCase();
        case 'balance':
          return Number(u.balance) || 0;
        case 'total_deposit':
          return getUserDepositStats(u.user_id).total || 0;
        case 'created_at':
          return new Date(u.created_at).getTime();
        default:
          return 0;
      }
    };
    arr.sort((a, b) => {
      const va = getVal(a, userSortKey);
      const vb = getVal(b, userSortKey);
      let cmp = 0;
      if (typeof va === 'number' && typeof vb === 'number') cmp = va - vb;
      else cmp = String(va).localeCompare(String(vb));
      return userSortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [filteredUsersDash, userSortKey, userSortDir]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Helper function to get section title
  const getSectionTitle = (section: string) => {
    const titles = {
      dashboard: 'Tổng quan hệ thống',
      users: 'Quản lý người dùng',
      agents: 'Quản lý đại lý',
      transactions: 'Quản lý giao dịch',
      promotions: 'Quản lý khuyến mãi',
      notifications: 'Quản lý thông báo',
      reports: 'Báo cáo và thống kê',
      settings: 'Cài đặt hệ thống'
    };
    return titles[section as keyof typeof titles] || 'Admin Panel';
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-6">Tổng quan hệ thống</h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Người dùng đã đăng ký</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng nạp tiền</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDeposits.toLocaleString()} VND</div>
              <p className="text-xs text-muted-foreground">Tổng số tiền đã nạp</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng rút tiền</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWithdrawals.toLocaleString()} VND</div>
              <p className="text-xs text-muted-foreground">Tổng số tiền đã rút</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Giao dịch chờ duyệt</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingTransactions}</div>
              <p className="text-xs text-muted-foreground">Cần xử lý</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Khuyến mãi</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePromotions} / {stats.totalPromotions}</div>
              <p className="text-xs text-muted-foreground">Đang hoạt động / Tổng số</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Giao dịch gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Người dùng</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thời gian</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.slice(0, 5).map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.profiles?.username || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={
                        transaction.type === 'deposit' ? 'default' : 
                        transaction.type === 'withdrawal' ? 'secondary' : 'outline'
                      }>
                        {transaction.type === 'deposit' ? 'Nạp tiền' : 
                         transaction.type === 'withdrawal' ? 'Rút tiền' : 'Bonus'}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.amount.toLocaleString()} VND</TableCell>
                    <TableCell>
                      <Badge variant={
                        transaction.status === 'approved' ? 'default' : 
                        transaction.status === 'rejected' ? 'destructive' : 'secondary'
                      }>
                        {transaction.status === 'approved' ? 'Đã duyệt' : 
                         transaction.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(transaction.created_at).toLocaleDateString('vi-VN')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Derived lists for Users (Dashboard)

  const renderUserManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý người dùng</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
          <CardDescription>Quản lý tất cả người dùng trong hệ thống</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-3 flex-col sm:flex-row">
            <Input
              placeholder="Tìm theo tên hoặc username"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="sm:flex-1"
            />
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as 'all' | 'admin' | 'agent' | 'user')}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Vai trò" />
              </SelectTrigger>
              <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value="admin">Quản trị</SelectItem>
              <SelectItem value="agent">Đại lý</SelectItem>
              <SelectItem value="user">Người dùng</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" className="px-0 font-medium" onClick={() => toggleUserSort('username')}>
                    Tên đăng nhập <ArrowUpDown className="ml-1 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="px-0 font-medium" onClick={() => toggleUserSort('full_name')}>
                    Họ tên <ArrowUpDown className="ml-1 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="px-0 font-medium" onClick={() => toggleUserSort('balance')}>
                    Số dư <ArrowUpDown className="ml-1 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="px-0 font-medium" onClick={() => toggleUserSort('total_deposit')}>
                    Tổng nạp <ArrowUpDown className="ml-1 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="px-0 font-medium" onClick={() => toggleUserSort('created_at')}>
                    Ngày tạo <ArrowUpDown className="ml-1 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUsersDash.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.full_name}</TableCell>
                  <TableCell>
                    {user.balance.toLocaleString()} VND
                  </TableCell>
                  <TableCell>
                    {getUserDepositStats(user.user_id).total.toLocaleString()} VND
                  </TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          Hành động
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 z-50">
                        <DropdownMenuItem
                          onSelect={() => {
                            setSelectedUser(user);
                            setUserDetailsOpenId(user.user_id);
                            setUserDetailsViewMode('details');
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => {
                            setAddBonusUser(user);
                          }}
                        >
                          <DollarSign className="mr-2 h-4 w-4" />
                          Cộng tiền
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => setEditUser(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => {
                            setSelectedUser(user);
                            setUserDetailsOpenId(user.user_id);
                            setUserDetailsViewMode('transactions');
                          }}
                        >
                          <TrendingUp className="mr-2 h-4 w-4" />
                          Xem giao dịch
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => setBettingHistoryUser(user)}>
                          <History className="mr-2 h-4 w-4" />
                          Lịch sử cược
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Dialog
                      open={userDetailsOpenId === user.user_id}
                       onOpenChange={(open) => {
                         if (!open) {
                           setUserDetailsOpenId(null);
                           setSelectedUser(null);
                           setBonusAmount('');
                           setUserDetailsViewMode('details');
                         }
                       }}
                    >
                      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{userDetailsViewMode === 'transactions' ? 'Giao dịch người dùng' : 'Chi tiết người dùng'}</DialogTitle>
                        </DialogHeader>
                        <DialogDescription className="sr-only">Xem chi tiết người dùng</DialogDescription>
                        {userDetailsViewMode === 'details' && <ViewUserDetails user={user} />}

                        <div className="mt-6">
                          <Label>Lịch sử giao dịch</Label>
                          <div className="mt-2 max-h-60 overflow-y-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Loại</TableHead>
                                  <TableHead>Số tiền</TableHead>
                                  <TableHead>Trạng thái</TableHead>
                                  <TableHead>Thời gian</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {transactions
                                  .filter(t => t.user_id === user.user_id)
                                  .map((transaction) => (
                                    <TableRow key={transaction.id}>
                                      <TableCell>
                                        <Badge variant={
                                          transaction.type === 'deposit' ? 'default' : 
                                          transaction.type === 'withdrawal' ? 'secondary' : 'outline'
                                        }>
                                          {transaction.type === 'deposit' ? 'Nạp' : 
                                           transaction.type === 'withdrawal' ? 'Rút' : 'Bonus'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        {transaction.amount.toLocaleString()} VND
                                      </TableCell>
                                      <TableCell>
                                        <Badge variant={
                                          transaction.status === 'approved' ? 'default' : 
                                          transaction.status === 'rejected' ? 'destructive' : 'secondary'
                                        }>
                                          {transaction.status === 'approved' ? 'Duyệt' : 
                                           transaction.status === 'rejected' ? 'Từ chối' : 'Chờ'}
                                        </Badge>
                                      </TableCell>
                                      <TableCell>
                                        {new Date(transaction.created_at).toLocaleDateString('vi-VN')}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>

                        {userDetailsViewMode === 'details' && (
                          <div className="mt-6 p-4 border rounded-lg">
                            <Label>Cộng tiền bonus</Label>
                            <div className="flex gap-2 mt-2">
                              <Input
                                type="number"
                                placeholder="Nhập số tiền..."
                                value={bonusAmount}
                                onChange={(e) => setBonusAmount(e.target.value)}
                              />
                              <Button onClick={() => handleAddBonus()}>
                                Cộng tiền
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>

                    <EditUserModal
                      isOpen={!!editUser && editUser.user_id === user.user_id}
                      onClose={() => setEditUser(null)}
                      user={editUser}
                      onUserUpdated={() => {
                        fetchUsers();
                        setEditUser(null);
                      }}
                    />

                    <Dialog
                      open={!!bettingHistoryUser && bettingHistoryUser.user_id === user.user_id}
                      onOpenChange={(open) => {
                        if (!open) setBettingHistoryUser(null);
                      }}
                    >
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Lịch sử cược</DialogTitle>
                        </DialogHeader>
                        <div className="text-sm text-muted-foreground">
                          Tính năng đang phát triển. Vui lòng kiểm tra sau.
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Dialog cộng tiền nhanh */}
                    <Dialog
                      open={!!addBonusUser && addBonusUser.user_id === user.user_id}
                      onOpenChange={(open) => {
                        if (!open) {
                          setAddBonusUser(null);
                          setBonusAmount('');
                        }
                      }}
                    >
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Cộng tiền bonus</DialogTitle>
                          <DialogDescription>Nhập số tiền bonus để cộng cho người dùng.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3">
                          <div>
                            <Label>Số tiền</Label>
                            <Input
                              type="number"
                              placeholder="Nhập số tiền..."
                              value={bonusAmount}
                              onChange={(e) => setBonusAmount(e.target.value)}
                            />
                          </div>
                          <Button onClick={() => handleAddBonus(addBonusUser!)}>
                            Cộng tiền
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderTransactionManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý giao dịch</h2>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="pending">Chờ duyệt</TabsTrigger>
          <TabsTrigger value="awaiting_payment">Chờ thanh toán</TabsTrigger>
          <TabsTrigger value="approved">Đã duyệt</TabsTrigger>
          <TabsTrigger value="rejected">Đã từ chối</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tất cả giao dịch</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Loại giao dịch</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{transaction.profiles?.username || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={
                          transaction.type === 'deposit' ? 'default' : 
                          transaction.type === 'withdrawal' ? 'secondary' : 'outline'
                        }>
                          {transaction.type === 'deposit' ? 'Nạp tiền' : 
                           transaction.type === 'withdrawal' ? 'Rút tiền' : 'Bonus'}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.amount.toLocaleString()} VND</TableCell>
                      <TableCell>
                        <Badge variant={
                          transaction.status === 'approved' ? 'default' : 
                          transaction.status === 'rejected' ? 'destructive' : 
                          transaction.status === 'awaiting_payment' ? 'destructive' : 'secondary'
                        }>
                          {transaction.status === 'approved' ? 'Đã duyệt' : 
                           transaction.status === 'rejected' ? 'Từ chối' : 
                           transaction.status === 'awaiting_payment' ? 'Chờ thanh toán' : 'Chờ duyệt'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(transaction.created_at).toLocaleDateString('vi-VN')}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedTransaction(transaction)}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Chi tiết
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Chi tiết giao dịch</DialogTitle>
                            </DialogHeader>
                            {selectedTransaction && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label>Người dùng</Label>
                                    <div className="text-sm font-medium">{selectedTransaction.profiles?.username || 'N/A'}</div>
                                  </div>
                                  <div>
                                    <Label>Họ tên</Label>
                                    <div className="text-sm">{selectedTransaction.profiles?.full_name || '—'}</div>
                                  </div>
                                  <div>
                                    <Label>Loại giao dịch</Label>
                                    <div className="text-sm font-medium">{selectedTransaction.type === 'deposit' ? 'Nạp tiền' : selectedTransaction.type === 'withdrawal' ? 'Rút tiền' : 'Bonus'}</div>
                                  </div>
                                  <div>
                                    <Label>Trạng thái</Label>
                                    <Badge variant={
                                      selectedTransaction.status === 'approved' ? 'default' : 
                                      selectedTransaction.status === 'rejected' ? 'destructive' : 'secondary'
                                    }>
                                      {selectedTransaction.status === 'approved' ? 'Đã duyệt' : 
                                       selectedTransaction.status === 'rejected' ? 'Từ chối' : 'Chờ duyệt'}
                                    </Badge>
                                  </div>
                                  <div>
                                    <Label>Số tiền</Label>
                                    <div className="text-sm font-medium">{selectedTransaction.amount.toLocaleString()} VND</div>
                                  </div>
                                  <div>
                                    <Label>Số dư hiện tại</Label>
                                    <div className="text-sm">{selectedTransaction.profiles?.balance?.toLocaleString?.() || 0} VND</div>
                                  </div>
                                  <div>
                                    <Label>Thời gian tạo</Label>
                                    <div className="text-sm">{new Date(selectedTransaction.created_at).toLocaleString('vi-VN')}</div>
                                  </div>
                                  <div>
                                    <Label>Thời gian duyệt</Label>
                                    <div className="text-sm">{(selectedTransaction as any).approved_at ? new Date((selectedTransaction as any).approved_at).toLocaleString('vi-VN') : '—'}</div>
                                  </div>
                                </div>

                                {selectedTransaction.bank && (
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label>Ngân hàng</Label>
                                      <div className="text-sm">{selectedTransaction.bank.bank_name}</div>
                                    </div>
                                    <div>
                                      <Label>Số tài khoản</Label>
                                      <div className="text-sm">{selectedTransaction.bank.account_number}</div>
                                    </div>
                                  </div>
                                )}

                                {selectedTransaction.proof_image_url && (
                                  <div>
                                    <Label>Ảnh minh chứng</Label>
                                    <img 
                                      src={selectedTransaction.proof_image_url} 
                                      alt="Ảnh minh chứng giao dịch" 
                                      className="mt-2 max-w-full h-auto rounded border"
                                    />
                                  </div>
                                )}

                                {selectedTransaction.admin_note && (
                                  <div>
                                    <Label>Ghi chú admin</Label>
                                    <div className="text-sm mt-1 p-2 bg-muted rounded">
                                      {selectedTransaction.admin_note}
                                    </div>
                                  </div>
                                )}

                                {selectedTransaction.status === 'pending' && (
                                  <div className="flex gap-2 pt-2">
                                    <Button 
                                      onClick={() => handleTransactionAction(selectedTransaction.id, 'approve')}
                                      className="flex-1"
                                    >
                                      <Check className="w-4 h-4 mr-1" />
                                      Duyệt
                                    </Button>
                                    <Button 
                                      variant="destructive" 
                                      onClick={() => handleTransactionAction(selectedTransaction.id, 'reject')}
                                      className="flex-1"
                                    >
                                      <X className="w-4 h-4 mr-1" />
                                      Từ chối
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Giao dịch chờ duyệt</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Loại giao dịch</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions
                    .filter(t => t.status === 'pending')
                    .map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.profiles?.username || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={
                            transaction.type === 'deposit' ? 'default' : 
                            transaction.type === 'withdrawal' ? 'secondary' : 'outline'
                          }>
                            {transaction.type === 'deposit' ? 'Nạp tiền' : 
                             transaction.type === 'withdrawal' ? 'Rút tiền' : 'Bonus'}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.amount.toLocaleString()} VND</TableCell>
                        <TableCell>{new Date(transaction.created_at).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm"
                              onClick={() => handleTransactionAction(transaction.id, 'approve')}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm"
                              variant="destructive"
                              onClick={() => handleTransactionAction(transaction.id, 'reject')}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="awaiting_payment">
          <Card>
            <CardHeader>
              <CardTitle>Giao dịch chờ thanh toán</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Người dùng</TableHead>
                    <TableHead>Loại giao dịch</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions
                    .filter(t => t.status === 'awaiting_payment')
                    .map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.profiles?.username || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant={
                            transaction.type === 'deposit' ? 'default' : 
                            transaction.type === 'withdrawal' ? 'secondary' : 'outline'
                          }>
                            {transaction.type === 'deposit' ? 'Nạp tiền' : 
                             transaction.type === 'withdrawal' ? 'Rút tiền' : 'Bonus'}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.amount.toLocaleString()} VND</TableCell>
                        <TableCell>{new Date(transaction.created_at).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm"
                              onClick={() => handleTransactionAction(transaction.id, 'approve')}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm"
                              variant="destructive"
                              onClick={() => handleTransactionAction(transaction.id, 'reject')}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );


  const renderPromotionManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý khuyến mãi</h2>
        <Dialog open={isPromotionFormOpen} onOpenChange={setIsPromotionFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tạo khuyến mãi
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo khuyến mãi mới</DialogTitle>
            </DialogHeader>
            <PromotionForm onSubmit={handlePromotionSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách khuyến mãi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tiêu đề</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead>Giá trị</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promotions.map((promotion) => (
                <TableRow key={promotion.id}>
                  <TableCell className="font-medium">{promotion.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {promotion.promotion_type === 'first_deposit' ? 'Nạp đầu' : 
                       promotion.promotion_type === 'time_based' ? 'Theo thời gian' : 'Mã khuyến mãi'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {promotion.bonus_percentage 
                      ? `${promotion.bonus_percentage}%`
                      : `+${(promotion as any).bonus_amount?.toLocaleString()} VND Bonus`
                    }
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{new Date(promotion.start_date).toLocaleDateString('vi-VN')}</div>
                      <div className="text-muted-foreground">đến {new Date(promotion.end_date).toLocaleDateString('vi-VN')}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={promotion.is_active ? 'default' : 'secondary'}>
                      {promotion.is_active ? 'Hoạt động' : 'Tạm dừng'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => togglePromotionStatus(promotion.id, promotion.is_active)}
                      >
                        {promotion.is_active ? 'Tắt' : 'Bật'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotificationManagement = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Quản lý thông báo</h2>
      <Card>
        <CardHeader>
          <CardTitle>Gửi thông báo</CardTitle>
          <CardDescription>Gửi thông báo tới tất cả người dùng</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Tiêu đề</Label>
              <Input placeholder="Nhập tiêu đề thông báo..." />
            </div>
            <div>
              <Label>Nội dung</Label>
              <Textarea placeholder="Nhập nội dung thông báo..." />
            </div>
            <Button>
              <Bell className="w-4 h-4 mr-2" />
              Gửi thông báo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Báo cáo và thống kê</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Báo cáo doanh thu</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Thống kê doanh thu theo thời gian</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Báo cáo người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Thống kê hoạt động người dùng</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Cài đặt hệ thống</h2>
      <Card>
        <CardHeader>
          <CardTitle>Cấu hình chung</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Tên hệ thống</Label>
              <Input defaultValue="Casino Admin CMS" />
            </div>
            <div>
              <Label>Email hỗ trợ</Label>
              <Input defaultValue="support@casino.com" />
            </div>
            <Button>Lưu cài đặt</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return renderUserManagement();
      case 'agents':
        return <AdminAgents />;
      case 'banks':
        return <AdminBanks />;
      case 'transactions':
        return renderTransactionManagement();
      case 'promotions':
        return renderPromotionManagement();
      case 'notifications':
        return renderNotificationManagement();
      case 'reports':
        return renderReports();
      case 'settings':
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <AdminLayout 
      activeSection={activeSection} 
      onSectionChange={setActiveSection}
    >
      {renderContent()}
    </AdminLayout>
  );
};

export default Admin;
