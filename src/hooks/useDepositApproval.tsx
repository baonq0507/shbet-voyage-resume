import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDepositApproval = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const approveDeposit = async (transactionId: string, username: string, amount: number) => {
    setIsProcessing(true);
    
    try {
      // Call third-party API first
      const { data: apiResult, error: apiError } = await supabase.functions.invoke('deposit-game-api', {
        body: { username, amount }
      });

      if (apiError) {
        throw new Error(`API call failed: ${apiError.message}`);
      }

      if (!apiResult.success) {
        toast.error(`Deposit failed: ${apiResult.message}`);
        return false;
      }

      // If API call successful, approve transaction and update balance
      const { error: updateError } = await supabase
        .from('transactions')
        .update({ status: 'approved' })
        .eq('id', transactionId);

      if (updateError) {
        throw new Error(`Failed to update transaction: ${updateError.message}`);
      }

      // Get current balance and update
      const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('username', username)
        .single();

      if (profileError) {
        throw new Error(`Failed to get current balance: ${profileError.message}`);
      }

      const newBalance = (currentProfile.balance || 0) + amount;

      // Update user balance
      const { error: balanceError } = await supabase
        .from('profiles')
        .update({ 
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('username', username);

      if (balanceError) {
        throw new Error(`Failed to update balance: ${balanceError.message}`);
      }

      toast.success('Deposit approved and balance updated successfully');
      return true;

    } catch (error) {
      console.error('Error approving deposit:', error);
      toast.error(`Failed to approve deposit: ${error.message}`);
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