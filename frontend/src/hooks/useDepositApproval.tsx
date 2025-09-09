import { useState } from 'react';
import apiService from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export const useDepositApproval = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const approveDeposit = async (transactionId: string, username: string, amount: number) => {
    setIsProcessing(true);
    
    try {
      console.log('Starting deposit approval process:', { transactionId, username, amount });

      // Use API service to update transaction status
      const response = await apiService.updateTransactionStatus(transactionId, {
        status: 'approved',
        adminNote: `Approved by admin - ${new Date().toISOString()}`
      });

      if (!response.success) {
        console.error('Transaction update error:', response.error);
        toast({
          title: "Lỗi",
          description: `Lỗi cập nhật giao dịch: ${response.error}`,
          variant: "destructive"
        });
        return false;
      }

      console.log('Deposit approval completed successfully:', { 
        username, 
        amount
      });

      toast({
        title: "Thành công",
        description: `Đã duyệt nạp tiền thành công!`
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