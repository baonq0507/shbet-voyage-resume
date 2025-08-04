import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Upload, X, Image } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const promotionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  promotionType: z.enum(['first_deposit', 'time_based', 'code_based']),
  bonusType: z.enum(['percentage', 'amount']),
  bonusPercentage: z.number().min(0).max(100).optional(),
  bonusAmount: z.number().min(0).optional(),
  minDeposit: z.number().min(0).optional(),
  maxUses: z.number().min(1).optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  isActive: z.boolean().default(true),
  isFirstDepositOnly: z.boolean().default(false),
  promotionCode: z.string().optional(),
  generateCodes: z.number().min(1).max(1000).optional(),
}).refine((data) => {
  if (data.bonusType === 'percentage' && !data.bonusPercentage) {
    return false;
  }
  if (data.bonusType === 'amount' && !data.bonusAmount) {
    return false;
  }
  return true;
}, {
  message: 'Bonus value is required',
  path: ['bonusPercentage'],
});

export type PromotionFormData = z.infer<typeof promotionSchema>;

interface PromotionFormProps {
  onSubmit: (data: PromotionFormData) => void;
  initialData?: Partial<PromotionFormData>;
  isLoading?: boolean;
}

export const PromotionForm: React.FC<PromotionFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false,
}) => {
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(
    (initialData as any)?.image_url || null
  );
  const [imageUploading, setImageUploading] = useState(false);
  const { toast } = useToast();

  const form = useForm<PromotionFormData>({
    resolver: zodResolver(promotionSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      promotionType: initialData?.promotionType || 'time_based',
      bonusType: initialData?.bonusType || 'percentage',
      bonusPercentage: initialData?.bonusPercentage || undefined,
      bonusAmount: initialData?.bonusAmount || undefined,
      minDeposit: initialData?.minDeposit || undefined,
      maxUses: initialData?.maxUses || undefined,
      startDate: initialData?.startDate || '',
      endDate: initialData?.endDate || '',
      isActive: initialData?.isActive ?? true,
      isFirstDepositOnly: initialData?.isFirstDepositOnly ?? false,
      promotionCode: initialData?.promotionCode || '',
      generateCodes: undefined,
    },
  });

  const promotionType = form.watch('promotionType');
  const bonusType = form.watch('bonusType');

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Starting image upload:', file.name, file.size, file.type);

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn file hình ảnh',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Lỗi',
        description: 'Kích thước file không được vượt quá 5MB',
        variant: 'destructive',
      });
      return;
    }

    setImageUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log('Uploading to path:', filePath);

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('promotion-images')
        .upload(filePath, file);

      console.log('Upload result:', { uploadError, uploadData });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('promotion-images')
        .getPublicUrl(filePath);

      console.log('Public URL:', data.publicUrl);
      setUploadedImageUrl(data.publicUrl);
      toast({
        title: 'Thành công',
        description: 'Upload hình ảnh thành công',
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Lỗi',
        description: `Không thể upload hình ảnh: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    } finally {
      setImageUploading(false);
    }
  };

  const removeImage = async () => {
    if (uploadedImageUrl) {
      try {
        // Extract filename from URL
        const urlParts = uploadedImageUrl.split('/');
        const filename = urlParts[urlParts.length - 1];
        const filePath = `${filename}`;

        await supabase.storage
          .from('promotion-images')
          .remove([filePath]);
      } catch (error) {
        console.error('Error removing image:', error);
      }
    }
    setUploadedImageUrl(null);
  };

  const handleFormSubmit = (data: PromotionFormData) => {
    const formDataWithImage = {
      ...data,
      image_url: uploadedImageUrl,
    };
    onSubmit(formDataWithImage as any);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tiêu đề khuyến mãi</FormLabel>
              <FormControl>
                <Input placeholder="Nhập tiêu đề khuyến mãi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mô tả</FormLabel>
              <FormControl>
                <Textarea placeholder="Nhập mô tả khuyến mãi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="promotionType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loại khuyến mãi</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại khuyến mãi" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="first_deposit">Nạp tiền đầu tiên</SelectItem>
                  <SelectItem value="time_based">Theo thời gian</SelectItem>
                  <SelectItem value="code_based">Theo mã code</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {promotionType === 'first_deposit' && 'Áp dụng cho lần nạp tiền đầu tiên của người dùng'}
                {promotionType === 'time_based' && 'Áp dụng tự động trong khoảng thời gian nhất định'}
                {promotionType === 'code_based' && 'Người dùng cần nhập mã code để sử dụng'}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {promotionType === 'time_based' && (
          <FormField
            control={form.control}
            name="isFirstDepositOnly"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Chỉ áp dụng cho lần nạp đầu</FormLabel>
                  <FormDescription>
                    Khuyến mãi chỉ áp dụng cho lần nạp tiền đầu tiên trong khoảng thời gian này
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}

        {promotionType === 'code_based' && (
          <>
            <FormField
              control={form.control}
              name="promotionCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã khuyến mãi chính</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="PROMO2024" 
                      {...field}
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormDescription>
                    Mã khuyến mãi chính cho loại này (nếu để trống sẽ tự sinh)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="generateCodes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số lượng mã phụ cần tạo (tùy chọn)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      max="1000"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                    />
                  </FormControl>
                  <FormDescription>
                    Tạo thêm các mã phụ để phân phối cho người dùng (1-1000 mã)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="bonusType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loại bonus</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại bonus" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="percentage">Phần trăm cộng thêm (%)</SelectItem>
                  <SelectItem value="amount">Số tiền cố định cộng thêm</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {bonusType === 'percentage' && (
          <FormField
            control={form.control}
            name="bonusPercentage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phần trăm bonus (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Ví dụ: 50% nghĩa là nạp 100k sẽ nhận thêm 50k bonus
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {bonusType === 'amount' && (
          <FormField
            control={form.control}
            name="bonusAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số tiền bonus cố định</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Số tiền cố định sẽ được cộng vào tài khoản khi nạp tiền
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="minDeposit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số tiền nạp tối thiểu (tùy chọn)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  placeholder="0"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="maxUses"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số lần sử dụng tối đa (tùy chọn)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  placeholder="Không giới hạn"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value) || undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ngày bắt đầu</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ngày kết thúc</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Image Upload Section */}
        <div className="space-y-4">
          <FormLabel>Hình ảnh khuyến mãi (tùy chọn)</FormLabel>
          
          {uploadedImageUrl ? (
            <div className="relative inline-block">
              <img 
                src={uploadedImageUrl} 
                alt="Promotion" 
                className="w-full max-w-md h-48 object-cover rounded-lg border"
              />
              <Button
                type="button"
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <div className="flex flex-col items-center space-y-2">
                <Image className="h-12 w-12 text-gray-400" />
                <div className="text-sm text-gray-600">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <span className="font-medium text-primary hover:text-primary/80">
                      Click to upload
                    </span>{' '}
                    hoặc kéo thả hình ảnh vào đây
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={imageUploading}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
              {imageUploading && (
                <div className="mt-4">
                  <div className="flex items-center justify-center space-x-2">
                    <Upload className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-600">Đang upload...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Kích hoạt khuyến mãi</FormLabel>
                <FormDescription>
                  Khuyến mãi sẽ hiển thị công khai khi được kích hoạt
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? 'Đang xử lý...' : (initialData ? 'Cập nhật khuyến mãi' : 'Tạo khuyến mãi')}
        </Button>
      </form>
    </Form>
  );
};