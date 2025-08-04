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
import { Users, DollarSign, TrendingUp, AlertCircle, Check, X, Eye, Building2, Gift, UserCheck, Bell, Plus, Edit, Trash } from 'lucide-react';
import { PromotionForm, PromotionFormData } from '@/components/PromotionForm';
import { usePromotionApplication } from '@/hooks/usePromotionApplication';

interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'bonus';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
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
  created_at: string;
  last_login_at?: string;
}

interface Bank {
  id: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  qr_code_url?: string;
  is_active: boolean;
  created_at: string;
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
}

interface Agent {
  id: string;
  full_name: string;
  username: string;
  phone_number?: string;
  commission_rate: number;
  total_commission: number;
  is_active: boolean;
  created_at: string;
}

interface Notification {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  target_audience: 'all' | 'users' | 'agents';
  is_published: boolean;
  created_at: string;
}

const AdminPage = () => {
  const { isAdmin, isLoading: roleLoading } = useRole();
  const { user } = useAuth();
  const { toast } = useToast();
  const { applyPromotionToDeposit } = usePromotionApplication();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [balanceToAdd, setBalanceToAdd] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
  const [isUserTransactionDialogOpen, setIsUserTransactionDialogOpen] = useState(false);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);

  // New entity dialog states
  const [isBankDialogOpen, setIsBankDialogOpen] = useState(false);
  const [isPromotionDialogOpen, setIsPromotionDialogOpen] = useState(false);
  const [isAgentDialogOpen, setIsAgentDialogOpen] = useState(false);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  
  // Search states
  const [searchName, setSearchName] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchRole, setSearchRole] = useState('');
  const [searchBalanceMin, setSearchBalanceMin] = useState('');
  const [searchBalanceMax, setSearchBalanceMax] = useState('');
  const [searchCreatedDate, setSearchCreatedDate] = useState('');
  const [searchDepositType, setSearchDepositType] = useState('');
  
  // Transaction search states
  const [searchTransactionType, setSearchTransactionType] = useState('');
  const [searchAmountMin, setSearchAmountMin] = useState('');
  const [searchAmountMax, setSearchAmountMax] = useState('');
  const [searchDateFrom, setSearchDateFrom] = useState('');
  const [searchDateTo, setSearchDateTo] = useState('');
  const [searchUserInfo, setSearchUserInfo] = useState('');

  // Move all hooks before any conditional returns
  useEffect(() => {
    if (isAdmin && !roleLoading) {
      fetchTransactions();
      fetchUsers();
      fetchBanks();
      fetchPromotions();
      fetchAgents();
      fetchNotifications();
      
      // Set up real-time subscription for transactions
      const channel = supabase
        .channel('admin-transactions')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'transactions'
          },
          (payload) => {
            console.log('Real-time transaction update:', payload);
            
            // Refresh transactions and users data when any transaction changes
            fetchTransactions();
            fetchUsers();
            
            // Show toast notification for real-time updates
            if (payload.eventType === 'INSERT') {
              const transaction = payload.new as any;
              toast({
                title: "Giao dịch mới",
                description: `${transaction.type === 'deposit' ? 'Nạp tiền' : 
                              transaction.type === 'bonus' ? 'Bonus' : 'Rút tiền'} - ${transaction.amount?.toLocaleString()} VND`,
              });
            } else if (payload.eventType === 'UPDATE') {
              const transaction = payload.new as any;
              if (transaction.status === 'approved') {
                toast({
                  title: "Giao dịch được duyệt",
                  description: `${transaction.type === 'deposit' ? 'Nạp tiền' : 
                                transaction.type === 'bonus' ? 'Bonus' : 'Rút tiền'} - ${transaction.amount?.toLocaleString()} VND`,
                });
              } else if (transaction.status === 'rejected') {
                toast({
                  title: "Giao dịch bị từ chối",
                  description: `${transaction.type === 'deposit' ? 'Nạp tiền' : 
                                transaction.type === 'bonus' ? 'Bonus' : 'Rút tiền'} - ${transaction.amount?.toLocaleString()} VND`,
                  variant: "destructive",
                });
              }
            }
          }
        )
        .subscribe();

      // Cleanup subscription on unmount
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAdmin, roleLoading, toast]);

  const fetchTransactions = async () => {
    try {
      // Fetch transactions first
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (transactionError) throw transactionError;

      // Fetch profiles for each unique user_id
      const userIds = [...new Set(transactionData?.map(t => t.user_id) || [])];
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, full_name, username, balance')
        .in('user_id', userIds);

      if (profileError) throw profileError;

      // Fetch banks for each unique bank_id
      const bankIds = [...new Set(transactionData?.map(t => t.bank_id).filter(Boolean) || [])];
      let bankData = [];
      if (bankIds.length > 0) {
        const { data: banks, error: bankError } = await supabase
          .from('bank')
          .select('id, bank_name, account_number')
          .in('id', bankIds);
        
        if (bankError) throw bankError;
        bankData = banks || [];
      }

      // Combine data
      const enrichedTransactions = transactionData?.map(transaction => {
        const profile = profileData?.find(p => p.user_id === transaction.user_id);
        const bank = bankData?.find(b => b.id === transaction.bank_id);
        
        return {
          ...transaction,
          profiles: profile,
          bank: bank
        };
      }) || [];

      setTransactions(enrichedTransactions as any);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách giao dịch",
        variant: "destructive",
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
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách người dùng",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionAction = async (transactionId: string, status: 'approved' | 'rejected', note?: string) => {
    try {
      const transaction = transactions.find(t => t.id === transactionId);
      if (!transaction) return;

      // Update transaction status
      const { error: updateError } = await supabase
        .from('transactions')
        .update({
          status,
          admin_note: note || null,
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (updateError) throw updateError;

      // If approving a deposit, update user balance and apply promotions
      if (status === 'approved' && transaction.type === 'deposit') {
        const { error: balanceError } = await supabase
          .from('profiles')
          .update({
            balance: (transaction.profiles?.balance || 0) + transaction.amount
          })
          .eq('user_id', transaction.user_id);

        if (balanceError) throw balanceError;

        // Extract promotion code from admin note if present
        const promotionCode = transaction.admin_note?.match(/Mã khuyến mãi: ([A-Z0-9]+)/)?.[1];

        // Apply promotion if available
        await applyPromotionToDeposit(
          transaction.user_id, 
          transaction.amount, 
          user?.id,
          promotionCode
        );
      }

      // If approving a withdrawal, deduct from user balance
      if (status === 'approved' && transaction.type === 'withdrawal') {
        const currentBalance = transaction.profiles?.balance || 0;
        if (currentBalance >= transaction.amount) {
          const { error: balanceError } = await supabase
            .from('profiles')
            .update({
              balance: currentBalance - transaction.amount
            })
            .eq('user_id', transaction.user_id);

          if (balanceError) throw balanceError;
        } else {
          toast({
            title: "Lỗi",
            description: "Số dư không đủ để thực hiện giao dịch rút tiền",
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "Thành công",
        description: `Giao dịch đã được ${status === 'approved' ? 'duyệt' : 'từ chối'}`,
      });

      // Close modal after successful action
      setIsTransactionDialogOpen(false);
      setSelectedTransaction(null);
      setAdminNote('');

      fetchTransactions();
      fetchUsers();
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật giao dịch",
        variant: "destructive",
      });
    }
  };

  const handleAddBalance = async () => {
    if (!selectedUser || !balanceToAdd || isNaN(parseFloat(balanceToAdd))) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập số tiền hợp lệ",
        variant: "destructive",
      });
      return;
    }

    try {
      const amountToAdd = parseFloat(balanceToAdd);
      
      // Update user balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({
          balance: selectedUser.balance + amountToAdd
        })
        .eq('user_id', selectedUser.user_id); // Changed from .eq('id', selectedUser.id)

      if (balanceError) throw balanceError;

      // Create bonus transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: selectedUser.user_id,
          type: 'bonus',
          amount: amountToAdd,
          status: 'approved',
          admin_note: `Admin cộng tiền bonus: ${amountToAdd.toLocaleString()} VND`,
          approved_by: user?.id,
          approved_at: new Date().toISOString()
        });

      if (transactionError) throw transactionError;

      toast({
        title: "Thành công",
        description: `Đã cộng ${amountToAdd.toLocaleString()} VND vào tài khoản và lưu vào lịch sử giao dịch`,
      });

      setBalanceToAdd('');
      setSelectedUser(null);
      fetchUsers();
      fetchTransactions();
    } catch (error) {
      console.error('Error adding balance:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cộng tiền vào tài khoản",
        variant: "destructive",
      });
    }
  };

  // New fetch functions
  const fetchBanks = async () => {
    try {
      const { data, error } = await supabase
        .from('bank')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBanks(data || []);
    } catch (error) {
      console.error('Error fetching banks:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách ngân hàng",
        variant: "destructive",
      });
    }
  };

  const fetchPromotions = async () => {
    try {
      const { data, error } = await (supabase as any)
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
        variant: "destructive",
      });
    }
  };

  const fetchAgents = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('agents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAgents((data || []) as Agent[]);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách đại lý",
        variant: "destructive",
      });
    }
  };

  const fetchNotifications = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications((data || []) as Notification[]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách thông báo",
        variant: "destructive",
      });
    }
  };

  // Promotion CRUD operations
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [promotionLoading, setPromotionLoading] = useState(false);

  const handleCreatePromotion = async (data: PromotionFormData) => {
    setPromotionLoading(true);
    try {
      const promotionData: any = {
        title: data.title,
        description: data.description || null,
        promotion_type: data.promotionType,
        bonus_percentage: data.bonusType === 'percentage' ? data.bonusPercentage : null,
        bonus_amount: data.bonusType === 'amount' ? data.bonusAmount : null,
        min_deposit: data.minDeposit || null,
        max_uses: data.maxUses || null,
        start_date: data.startDate,
        end_date: data.endDate,
        is_active: data.isActive,
        is_first_deposit_only: data.isFirstDepositOnly || false,
        image_url: (data as any).image_url || null,
      };

      // Handle promotion code for code-based promotions
      if (data.promotionType === 'code_based') {
        promotionData.promotion_code = data.promotionCode || `PROMO${Date.now()}`;
      }

      const { error } = await supabase
        .from('promotions')
        .insert(promotionData);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Khuyến mại đã được tạo thành công",
      });

      setIsPromotionDialogOpen(false);
      fetchPromotions();
    } catch (error) {
      console.error('Error creating promotion:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tạo khuyến mại",
        variant: "destructive",
      });
    } finally {
      setPromotionLoading(false);
    }
  };

  const handleUpdatePromotion = async (data: PromotionFormData) => {
    if (!editingPromotion) return;
    
    setPromotionLoading(true);
    try {
      const promotionData: any = {
        title: data.title,
        description: data.description || null,
        promotion_type: data.promotionType,
        bonus_percentage: data.bonusType === 'percentage' ? data.bonusPercentage : null,
        bonus_amount: data.bonusType === 'amount' ? data.bonusAmount : null,
        min_deposit: data.minDeposit || null,
        max_uses: data.maxUses || null,
        start_date: data.startDate,
        end_date: data.endDate,
        is_active: data.isActive,
        is_first_deposit_only: data.isFirstDepositOnly || false,
        image_url: (data as any).image_url || null,
      };

      // Handle promotion code for code-based promotions
      if (data.promotionType === 'code_based') {
        promotionData.promotion_code = data.promotionCode || (editingPromotion as any).promotion_code;
      }

      const { error } = await supabase
        .from('promotions')
        .update(promotionData)
        .eq('id', editingPromotion.id);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Khuyến mại đã được cập nhật thành công",
      });

      setIsPromotionDialogOpen(false);
      setEditingPromotion(null);
      fetchPromotions();
    } catch (error) {
      console.error('Error updating promotion:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật khuyến mại",
        variant: "destructive",
      });
    } finally {
      setPromotionLoading(false);
    }
  };

  const handleDeletePromotion = async (promotionId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khuyến mại này?')) return;
    
    try {
      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', promotionId);

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Khuyến mại đã được xóa thành công",
      });

      fetchPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa khuyến mại",
        variant: "destructive",
      });
    }
  };

  const openCreatePromotionDialog = () => {
    setEditingPromotion(null);
    setIsPromotionDialogOpen(true);
  };

  const openEditPromotionDialog = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setIsPromotionDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Đang chờ';
      case 'approved': return 'Đã duyệt';
      case 'rejected': return 'Đã từ chối';
      default: return status;
    }
  };

  const fetchUserTransactions = async (userId: string) => {
    try {
      const { data: transactionData, error: transactionError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (transactionError) throw transactionError;

      // Fetch banks for each unique bank_id
      const bankIds = [...new Set(transactionData?.map(t => t.bank_id).filter(Boolean) || [])];
      let bankData = [];
      if (bankIds.length > 0) {
        const { data: banks, error: bankError } = await supabase
          .from('bank')
          .select('id, bank_name, account_number')
          .in('id', bankIds);
        
        if (bankError) throw bankError;
        bankData = banks || [];
      }

      // Combine data
      const enrichedTransactions = transactionData?.map(transaction => {
        const bank = bankData?.find(b => b.id === transaction.bank_id);
        return {
          ...transaction,
          bank: bank
        };
      }) || [];

      setUserTransactions(enrichedTransactions as any);
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách giao dịch người dùng",
        variant: "destructive",
      });
    }
  };

  const getUserDepositStats = (userId: string) => {
    const userTransactions = transactions.filter(t => t.user_id === userId && t.type === 'deposit' && t.status === 'approved');
    const totalDeposited = userTransactions.reduce((sum, t) => sum + t.amount, 0);
    return { count: userTransactions.length, total: totalDeposited };
  };

  const filteredUsers = users.filter(user => {
    // Name filter
    if (searchName && !user.full_name.toLowerCase().includes(searchName.toLowerCase()) && 
        !user.username.toLowerCase().includes(searchName.toLowerCase())) {
      return false;
    }

    // Email filter (using username as email equivalent)
    if (searchEmail && !user.username.toLowerCase().includes(searchEmail.toLowerCase())) {
      return false;
    }

    // Balance range filter
    if (searchBalanceMin && user.balance < parseFloat(searchBalanceMin)) {
      return false;
    }
    if (searchBalanceMax && user.balance > parseFloat(searchBalanceMax)) {
      return false;
    }

    // Created date filter
    if (searchCreatedDate) {
      const userDate = new Date(user.created_at).toISOString().split('T')[0];
      if (userDate !== searchCreatedDate) {
        return false;
      }
    }

    // Deposit amount filter
    if (searchDepositType) {
      const { total } = getUserDepositStats(user.user_id);
      
      if (searchDepositType === 'highest') {
        const allDepositTotals = users.map(u => getUserDepositStats(u.user_id).total);
        const maxDeposit = Math.max(...allDepositTotals);
        if (total !== maxDeposit || total === 0) return false;
      } else if (searchDepositType === 'lowest') {
        const usersWithDeposits = users.filter(u => getUserDepositStats(u.user_id).total > 0);
        if (usersWithDeposits.length === 0) return false;
        const depositTotals = usersWithDeposits.map(u => getUserDepositStats(u.user_id).total);
        const minDeposit = Math.min(...depositTotals);
        if (total !== minDeposit || total === 0) return false;
      } else if (searchDepositType === 'none') {
        if (total > 0) return false;
      }
    }

    return true;
  });

  const clearFilters = () => {
    setSearchName('');
    setSearchEmail('');
    setSearchRole('');
    setSearchBalanceMin('');
    setSearchBalanceMax('');
    setSearchCreatedDate('');
    setSearchDepositType('');
  };

  const filteredTransactions = transactions.filter(transaction => {
    // Transaction type filter
    if (searchTransactionType && transaction.type !== searchTransactionType) {
      return false;
    }

    // Amount range filter
    if (searchAmountMin && transaction.amount < parseFloat(searchAmountMin)) {
      return false;
    }
    if (searchAmountMax && transaction.amount > parseFloat(searchAmountMax)) {
      return false;
    }

    // Date range filter
    if (searchDateFrom) {
      const transactionDate = new Date(transaction.created_at).toISOString().split('T')[0];
      if (transactionDate < searchDateFrom) {
        return false;
      }
    }
    if (searchDateTo) {
      const transactionDate = new Date(transaction.created_at).toISOString().split('T')[0];
      if (transactionDate > searchDateTo) {
        return false;
      }
    }

    // User info filter (name, email, phone)
    if (searchUserInfo) {
      const userInfo = searchUserInfo.toLowerCase();
      const fullName = transaction.profiles?.full_name?.toLowerCase() || '';
      const username = transaction.profiles?.username?.toLowerCase() || '';
      
      if (!fullName.includes(userInfo) && !username.includes(userInfo)) {
        return false;
      }
    }

    return true;
  });

  const clearTransactionFilters = () => {
    setSearchTransactionType('');
    setSearchAmountMin('');
    setSearchAmountMax('');
    setSearchDateFrom('');
    setSearchDateTo('');
    setSearchUserInfo('');
  };

  // Conditional returns AFTER all hooks
  if (roleLoading) {
    return <div className="flex items-center justify-center min-h-screen">Đang tải...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Đang tải...</div>;
  }

  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const totalDeposits = transactions.filter(t => t.type === 'deposit' && t.status === 'approved').reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawals = transactions.filter(t => t.type === 'withdrawal' && t.status === 'approved').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Bảng điều khiển Admin</h1>
        <Badge variant="secondary" className="px-3 py-1">
          <Users className="w-4 h-4 mr-1" />
          Quản trị viên
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Giao dịch chờ duyệt</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTransactions.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng nạp tiền</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDeposits.toLocaleString()} VND</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng rút tiền</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWithdrawals.toLocaleString()} VND</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Quản lý giao dịch</TabsTrigger>
          <TabsTrigger value="users">Quản lý người dùng</TabsTrigger>
          <TabsTrigger value="promotions">Khuyến mãi</TabsTrigger>
          <TabsTrigger value="agents">Đại lý</TabsTrigger>
          <TabsTrigger value="notifications">Thông báo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions" className="space-y-4">
          {/* Transaction Search Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Tìm kiếm giao dịch</CardTitle>
              <CardDescription>
                Sử dụng các bộ lọc để tìm kiếm giao dịch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search-transaction-type">Loại giao dịch</Label>
                  <Select value={searchTransactionType} onValueChange={setSearchTransactionType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại giao dịch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deposit">Nạp tiền</SelectItem>
                      <SelectItem value="withdrawal">Rút tiền</SelectItem>
                      <SelectItem value="bonus">Bonus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="search-amount-min">Số tiền từ (VND)</Label>
                  <Input
                    id="search-amount-min"
                    type="number"
                    placeholder="Số tiền tối thiểu"
                    value={searchAmountMin}
                    onChange={(e) => setSearchAmountMin(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="search-amount-max">Số tiền đến (VND)</Label>
                  <Input
                    id="search-amount-max"
                    type="number"
                    placeholder="Số tiền tối đa"
                    value={searchAmountMax}
                    onChange={(e) => setSearchAmountMax(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="search-date-from">Từ ngày</Label>
                  <Input
                    id="search-date-from"
                    type="date"
                    value={searchDateFrom}
                    onChange={(e) => setSearchDateFrom(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="search-date-to">Đến ngày</Label>
                  <Input
                    id="search-date-to"
                    type="date"
                    value={searchDateTo}
                    onChange={(e) => setSearchDateTo(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="search-user-info">Tìm người dùng</Label>
                  <Input
                    id="search-user-info"
                    placeholder="Tên, email hoặc SĐT"
                    value={searchUserInfo}
                    onChange={(e) => setSearchUserInfo(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={clearTransactionFilters}>
                  Xóa bộ lọc
                </Button>
                <div className="text-sm text-muted-foreground flex items-center">
                  Tìm thấy {filteredTransactions.length} giao dịch
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danh sách giao dịch</CardTitle>
              <CardDescription>
                Quản lý các yêu cầu nạp tiền và rút tiền từ người dùng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Người dùng</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Số tiền</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{transaction.profiles?.full_name}</div>
                            <div className="text-sm text-muted-foreground">@{transaction.profiles?.username}</div>
                          </div>
                        </TableCell>
                         <TableCell>
                           <Badge variant={
                             transaction.type === 'deposit' ? 'default' : 
                             transaction.type === 'bonus' ? 'secondary' : 'outline'
                           }>
                             {transaction.type === 'deposit' ? 'Nạp tiền' : 
                              transaction.type === 'bonus' ? 'Bonus' : 'Rút tiền'}
                           </Badge>
                         </TableCell>
                        <TableCell className="font-medium">
                          {transaction.amount.toLocaleString()} VND
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(transaction.status)}>
                            {getStatusText(transaction.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(transaction.created_at).toLocaleDateString('vi-VN')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog open={isTransactionDialogOpen} onOpenChange={setIsTransactionDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTransaction(transaction);
                                    setIsTransactionDialogOpen(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="custom-scrollbar">
                                <DialogHeader>
                                  <DialogTitle>Chi tiết giao dịch</DialogTitle>
                                  <DialogDescription>
                                    Thông tin chi tiết và thao tác với giao dịch
                                  </DialogDescription>
                                </DialogHeader>
                                {selectedTransaction && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Người dùng</Label>
                                        <div className="text-sm">{selectedTransaction.profiles?.full_name}</div>
                                      </div>
                                      <div>
                                        <Label>Số tiền</Label>
                                        <div className="text-sm font-medium">{selectedTransaction.amount.toLocaleString()} VND</div>
                                      </div>
                                       <div>
                                         <Label>Loại giao dịch</Label>
                                         <div className="text-sm">
                                           {selectedTransaction.type === 'deposit' ? 'Nạp tiền' : 
                                            selectedTransaction.type === 'bonus' ? 'Bonus' : 'Rút tiền'}
                                         </div>
                                       </div>
                                      <div>
                                        <Label>Trạng thái</Label>
                                        <Badge className={getStatusColor(selectedTransaction.status)}>
                                          {getStatusText(selectedTransaction.status)}
                                        </Badge>
                                      </div>
                                    </div>
                                    
                                    {selectedTransaction.bank && (
                                      <div>
                                        <Label>Thông tin ngân hàng</Label>
                                        <div className="text-sm">
                                          {selectedTransaction.bank.bank_name} - {selectedTransaction.bank.account_number}
                                        </div>
                                      </div>
                                    )}
                                    
                                    <div>
                                      <Label htmlFor="admin-note">Ghi chú admin</Label>
                                      <Textarea
                                        id="admin-note"
                                        value={adminNote}
                                        onChange={(e) => setAdminNote(e.target.value)}
                                        placeholder="Nhập ghi chú..."
                                        rows={3}
                                      />
                                    </div>
                                    
                                    {selectedTransaction.status === 'pending' && (
                                      <div className="flex gap-2">
                                        <Button
                                          onClick={() => handleTransactionAction(selectedTransaction.id, 'approved', adminNote)}
                                          className="flex-1"
                                        >
                                          <Check className="w-4 h-4 mr-2" />
                                          Duyệt
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          onClick={() => handleTransactionAction(selectedTransaction.id, 'rejected', adminNote)}
                                          className="flex-1"
                                        >
                                          <X className="w-4 h-4 mr-2" />
                                          Từ chối
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          {/* Search Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Tìm kiếm người dùng</CardTitle>
              <CardDescription>
                Sử dụng các bộ lọc để tìm kiếm người dùng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="search-name">Tìm theo tên/username</Label>
                  <Input
                    id="search-name"
                    placeholder="Nhập tên hoặc username"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="search-email">Tìm theo email</Label>
                  <Input
                    id="search-email"
                    placeholder="Nhập email/username"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="search-deposit">Tìm theo nạp tiền</Label>
                  <Select value={searchDepositType} onValueChange={setSearchDepositType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="highest">Nạp nhiều nhất</SelectItem>
                      <SelectItem value="lowest">Nạp ít nhất</SelectItem>
                      <SelectItem value="none">Chưa nạp tiền</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="search-balance-min">Số dư từ (VND)</Label>
                  <Input
                    id="search-balance-min"
                    type="number"
                    placeholder="Số dư tối thiểu"
                    value={searchBalanceMin}
                    onChange={(e) => setSearchBalanceMin(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="search-balance-max">Số dư đến (VND)</Label>
                  <Input
                    id="search-balance-max"
                    type="number"
                    placeholder="Số dư tối đa"
                    value={searchBalanceMax}
                    onChange={(e) => setSearchBalanceMax(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="search-created">Ngày tạo</Label>
                  <Input
                    id="search-created"
                    type="date"
                    value={searchCreatedDate}
                    onChange={(e) => setSearchCreatedDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={clearFilters}>
                  Xóa bộ lọc
                </Button>
                <div className="text-sm text-muted-foreground flex items-center">
                  Tìm thấy {filteredUsers.length} người dùng
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Danh sách người dùng</CardTitle>
              <CardDescription>
                Quản lý thông tin và số dư của người dùng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên đầy đủ</TableHead>
                      <TableHead>Username</TableHead>
                      <TableHead>Số dư</TableHead>
                      <TableHead>Tổng nạp tiền</TableHead>
                      <TableHead>Số điện thoại</TableHead>
                      <TableHead>Ngày tham gia</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                       <TableRow key={user.id}>
                         <TableCell className="font-medium">{user.full_name}</TableCell>
                         <TableCell>@{user.username}</TableCell>
                         <TableCell className="font-medium text-primary">
                           {user.balance.toLocaleString()} VND
                         </TableCell>
                         <TableCell className="font-medium text-green-600">
                           {getUserDepositStats(user.user_id).total.toLocaleString()} VND
                         </TableCell>
                         <TableCell>{user.phone_number || 'N/A'}</TableCell>
                         <TableCell>
                           {new Date(user.created_at).toLocaleDateString('vi-VN')}
                         </TableCell>
                         <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedUser(user)}
                                  >
                                    Cộng tiền
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Cộng tiền vào tài khoản</DialogTitle>
                                    <DialogDescription>
                                      Cộng tiền cho người dùng {selectedUser?.full_name}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div>
                                      <Label>Số dư hiện tại</Label>
                                      <div className="text-lg font-medium text-primary">
                                        {selectedUser?.balance.toLocaleString()} VND
                                      </div>
                                    </div>
                                    <div>
                                      <Label htmlFor="balance-amount">Số tiền cộng thêm (VND)</Label>
                                      <Input
                                        id="balance-amount"
                                        type="number"
                                        value={balanceToAdd}
                                        onChange={(e) => setBalanceToAdd(e.target.value)}
                                        placeholder="Nhập số tiền"
                                      />
                                    </div>
                                    <Button onClick={handleAddBalance} className="w-full">
                                      Cộng tiền
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Dialog open={isUserTransactionDialogOpen} onOpenChange={setIsUserTransactionDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedUser(user);
                                      fetchUserTransactions(user.user_id);
                                      setIsUserTransactionDialogOpen(true);
                                    }}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="custom-scrollbar max-w-4xl">
                                  <DialogHeader>
                                    <DialogTitle>Giao dịch của {selectedUser?.full_name}</DialogTitle>
                                    <DialogDescription>
                                      Danh sách tất cả giao dịch của người dùng
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                      <div className="p-3 bg-secondary rounded-lg">
                                        <div className="text-sm text-muted-foreground">Số dư hiện tại</div>
                                        <div className="text-lg font-bold text-primary">
                                          {selectedUser?.balance.toLocaleString()} VND
                                        </div>
                                      </div>
                                      <div className="p-3 bg-green-50 rounded-lg">
                                        <div className="text-sm text-muted-foreground">Tổng đã nạp</div>
                                        <div className="text-lg font-bold text-green-600">
                                          {selectedUser ? getUserDepositStats(selectedUser.user_id).total.toLocaleString() : 0} VND
                                        </div>
                                      </div>
                                      <div className="p-3 bg-blue-50 rounded-lg">
                                        <div className="text-sm text-muted-foreground">Số giao dịch</div>
                                        <div className="text-lg font-bold text-blue-600">
                                          {userTransactions.length}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="max-h-96 overflow-y-auto">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Loại</TableHead>
                                            <TableHead>Số tiền</TableHead>
                                            <TableHead>Trạng thái</TableHead>
                                            <TableHead>Ngân hàng</TableHead>
                                            <TableHead>Ngày tạo</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {userTransactions.map((transaction) => (
                                            <TableRow key={transaction.id}>
                                              <TableCell>
                                                <Badge variant={
                                                  transaction.type === 'deposit' ? 'default' : 
                                                  transaction.type === 'bonus' ? 'secondary' : 'outline'
                                                }>
                                                  {transaction.type === 'deposit' ? 'Nạp tiền' : 
                                                   transaction.type === 'bonus' ? 'Bonus' : 'Rút tiền'}
                                                </Badge>
                                              </TableCell>
                                              <TableCell className="font-medium">
                                                {transaction.amount.toLocaleString()} VND
                                              </TableCell>
                                              <TableCell>
                                                <Badge className={getStatusColor(transaction.status)}>
                                                  {getStatusText(transaction.status)}
                                                </Badge>
                                              </TableCell>
                                              <TableCell>
                                                {transaction.bank ? 
                                                  `${transaction.bank.bank_name} - ${transaction.bank.account_number}` : 
                                                  'N/A'
                                                }
                                              </TableCell>
                                              <TableCell>
                                                {new Date(transaction.created_at).toLocaleDateString('vi-VN')}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                      {userTransactions.length === 0 && (
                                        <div className="text-center py-8 text-muted-foreground">
                                          Người dùng chưa có giao dịch nào
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="promotions" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Quản lý khuyến mãi</CardTitle>
                <CardDescription>Tạo và quản lý các chương trình khuyến mãi</CardDescription>
              </div>
              <Button onClick={openCreatePromotionDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm khuyến mãi
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Mô tả</TableHead>
                    <TableHead>Giảm giá</TableHead>
                    <TableHead>Số lần dùng</TableHead>
                    <TableHead>Thời gian</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promotions.map((promotion) => (
                    <TableRow key={promotion.id}>
                      <TableCell className="font-medium">{promotion.title}</TableCell>
                      <TableCell>{promotion.description}</TableCell>
                       <TableCell>
                         {(promotion as any).bonus_percentage 
                           ? `+${(promotion as any).bonus_percentage}% Bonus` 
                           : (promotion as any).bonus_amount 
                           ? `+${(promotion as any).bonus_amount?.toLocaleString()} VND Bonus`
                           : 'N/A'}
                       </TableCell>
                      <TableCell>{promotion.current_uses}/{promotion.max_uses || '∞'}</TableCell>
                      <TableCell>
                        {new Date(promotion.start_date).toLocaleDateString('vi-VN')} - {new Date(promotion.end_date).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={promotion.is_active ? "default" : "secondary"}>
                          {promotion.is_active ? 'Hoạt động' : 'Tạm dừng'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditPromotionDialog(promotion)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeletePromotion(promotion.id)}
                          >
                            <Trash className="w-4 h-4" />
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

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Quản lý đại lý</CardTitle>
                <CardDescription>Quản lý hệ thống đại lý và hoa hồng</CardDescription>
              </div>
              <Button onClick={() => setIsAgentDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Thêm đại lý
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ tên</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>SĐT</TableHead>
                    <TableHead>Tỷ lệ hoa hồng</TableHead>
                    <TableHead>Tổng hoa hồng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell className="font-medium">{agent.full_name}</TableCell>
                      <TableCell>@{agent.username}</TableCell>
                      <TableCell>{agent.phone_number}</TableCell>
                      <TableCell>{agent.commission_rate}%</TableCell>
                      <TableCell>{agent.total_commission.toLocaleString()} VND</TableCell>
                      <TableCell>
                        <Badge variant={agent.is_active ? "default" : "secondary"}>
                          {agent.is_active ? 'Hoạt động' : 'Tạm dừng'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash className="w-4 h-4" />
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

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Quản lý thông báo</CardTitle>
                <CardDescription>Tạo và gửi thông báo đến người dùng</CardDescription>
              </div>
              <Button onClick={() => setIsNotificationDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Tạo thông báo
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tiêu đề</TableHead>
                    <TableHead>Nội dung</TableHead>
                    <TableHead>Đối tượng</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell className="font-medium">{notification.title}</TableCell>
                      <TableCell className="max-w-xs truncate">{notification.content}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {notification.target_audience === 'all' ? 'Tất cả' : 
                           notification.target_audience === 'users' ? 'Người dùng' : 'Đại lý'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={notification.is_published ? "default" : "secondary"}>
                          {notification.is_published ? 'Đã xuất bản' : 'Nháp'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(notification.created_at).toLocaleDateString('vi-VN')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash className="w-4 h-4" />
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

      {/* Promotion Form Dialog */}
      <Dialog open={isPromotionDialogOpen} onOpenChange={setIsPromotionDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPromotion ? 'Chỉnh sửa khuyến mại' : 'Tạo khuyến mại mới'}
            </DialogTitle>
            <DialogDescription>
              {editingPromotion ? 'Cập nhật thông tin khuyến mại' : 'Điền thông tin để tạo khuyến mại mới'}
            </DialogDescription>
          </DialogHeader>
          <PromotionForm
            onSubmit={editingPromotion ? handleUpdatePromotion : handleCreatePromotion}
            initialData={editingPromotion ? {
              title: editingPromotion.title,
              description: editingPromotion.description || '',
              promotionType: (editingPromotion as any).promotion_type || 'time_based',
              bonusType: (editingPromotion as any).bonus_percentage ? 'percentage' : 'amount',
              bonusPercentage: (editingPromotion as any).bonus_percentage || undefined,
              bonusAmount: (editingPromotion as any).bonus_amount || undefined,
              minDeposit: (editingPromotion as any).min_deposit || undefined,
              maxUses: editingPromotion.max_uses || undefined,
              startDate: editingPromotion.start_date ? new Date(editingPromotion.start_date).toISOString().slice(0, 16) : '',
              endDate: editingPromotion.end_date ? new Date(editingPromotion.end_date).toISOString().slice(0, 16) : '',
              isActive: editingPromotion.is_active,
              isFirstDepositOnly: (editingPromotion as any).is_first_deposit_only || false,
              promotionCode: (editingPromotion as any).promotion_code || '',
              image_url: (editingPromotion as any).image_url || null,
            } : undefined}
            isLoading={promotionLoading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;