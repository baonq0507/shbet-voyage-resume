import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useDepositApproval = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const approveDeposit = async (transactionId: string, username: string, amount: number) => {
    setIsProcessing(true);
    
    try {
      console.log('Starting deposit approval process:', { transactionId, username, amount });
      
      // Step 1: Call deposit-game-api to process payment with third-party
      const { data: apiResult, error: apiError } = await supabase.functions.invoke('deposit-game-api', {
        body: { username, amount }
      });

      if (apiError) {
        console.error('deposit-game-api error:', apiError);
        toast({
          title: "Lỗi",
          description: `Lỗi kết nối API: ${apiError.message}`,
          variant: "destructive"
        });
        return false;
      }

      // Step 2: Check if third-party API call was successful
      if (!apiResult?.success) {
        const errorMessage = apiResult?.message || 'Lỗi không xác định từ hệ thống game';
        console.error('deposit-game-api failed:', apiResult);
        toast({
          title: "Lỗi",
          description: `Nạp tiền thất bại: ${errorMessage}`,
          variant: "destructive"
        });
        return false;
      }

      console.log('deposit-game-api success, proceeding with database updates');

      // Step 3: Update transaction status to approved
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', transactionId);

      if (updateError) {
        console.error('Transaction update error:', updateError);
        toast({
          title: "Lỗi",
          description: `Lỗi cập nhật giao dịch: ${updateError.message}`,
          variant: "destructive"
        });
        return false;
      }

      // Step 4: Get current user balance
      const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('username', username)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        toast({
          title: "Lỗi",
          description: `Lỗi lấy thông tin người dùng: ${profileError.message}`,
          variant: "destructive"
        });
        return false;
      }

      // Step 5: Calculate new balance and update
      const currentBalance = currentProfile.balance || 0;
      const newBalance = currentBalance + amount;

      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ 
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('username', username);

      if (balanceError) {
        console.error('Balance update error:', balanceError);
        toast({
          title: "Lỗi",
          description: `Lỗi cập nhật số dư: ${balanceError.message}`,
          variant: "destructive"
        });
        return false;
      }

      console.log('Deposit approval completed successfully:', { 
        username, 
        amount, 
        oldBalance: currentBalance, 
        newBalance 
      });

      toast({
        title: "Thành công",
        description: `Đã duyệt nạp tiền thành công! Số dư mới: ${newBalance.toLocaleString('vi-VN')} VND`
      });
      return true;

    } catch (error) {
      console.error('Error in deposit approval process:', error);
      toast({
        title: "Lỗi",
        description: `Lỗi hệ thống: ${error.message}`,
        variant: "destructive"
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    approveDeposit,
    isProcessing
  };
};