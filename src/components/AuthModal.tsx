import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Phone, Lock, UserCheck, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

const AuthModal = ({ isOpen, onClose, onAuthSuccess }: AuthModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = async () => {
    if (!formData.username || !formData.password) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ thông tin",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Get email from username via edge function
      const { data: emailData, error: emailError } = await supabase.functions.invoke('login-by-username', {
        body: { username: formData.username, password: formData.password }
      });

      if (emailError || !emailData?.email) {
        toast({
          title: "Đăng nhập thất bại",
          description: "Tên đăng nhập không tồn tại",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Đăng nhập bằng email
      const { error } = await supabase.auth.signInWithPassword({
        email: emailData.email,
        password: formData.password
      });

      if (error) {
        // Handle email confirmation error specifically
        if (error.message.includes('email_not_confirmed') || error.message.includes('Email not confirmed')) {
          toast({
            title: "Email chưa được xác nhận",
            description: "Hệ thống đang xử lý xác nhận email tự động. Vui lòng thử lại sau vài giây.",
            variant: "destructive"
          });
        } else if (error.message === "Invalid login credentials") {
          toast({
            title: "Đăng nhập thất bại",
            description: "Email hoặc mật khẩu không đúng",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Đăng nhập thất bại",
            description: error.message,
            variant: "destructive"
          });
        }
        return;
      }

      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng bạn trở lại!`
      });
      
      onAuthSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi đăng nhập",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!formData.fullName || !formData.phoneNumber || !formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ thông tin",
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu phải có ít nhất 6 ký tự",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      // Call backend registration API that handles external API call
      console.log('📤 Calling backend user-register API');
      const { data: registerResponse, error: registerError } = await supabase.functions.invoke('user-register', {
        body: {
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          username: formData.username,
          email: formData.email,
          password: formData.password
        }
      });

      if (registerError) {
        console.error('❌ Registration API error:', registerError);
        toast({
          title: "Lỗi",
          description: "Có lỗi xảy ra khi đăng ký",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      if (!registerResponse?.success) {
        console.log('❌ Registration failed:', registerResponse?.error);
        const errorMessage = registerResponse?.error === 'Username already exists' 
          ? "Tên đăng nhập đã tồn tại"
          : "Có lỗi xảy ra khi đăng ký";
        
        toast({
          title: "Lỗi",
          description: errorMessage,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      console.log('✅ Registration successful, attempting auto-login');

      // Try to sign in the newly created user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (signInError) {
        console.error('Auto sign-in error:', signInError);
        toast({
          title: "Đăng ký thành công",
          description: "Tài khoản đã được tạo. Vui lòng đăng nhập.",
          variant: "default"
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Đăng ký thành công",
        description: "Chào mừng bạn đến với DINAMONDBET68!"
      });
      
      onAuthSuccess();
      onClose();
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi đăng ký",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gradient">
            DINAMONDBET68
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="text-sm font-medium">
              Đăng Nhập
            </TabsTrigger>
            <TabsTrigger value="register" className="text-sm font-medium">
              Đăng Ký
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full"
              variant="casino"
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
            </Button>
          </TabsContent>
          
          <TabsContent value="register" className="space-y-4 mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Họ và tên</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Nhập họ và tên"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Số điện thoại</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phoneNumber"
                    type="tel"
                    placeholder="Nhập số điện thoại"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="regUsername">Tên đăng nhập</Label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="regUsername"
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Nhập email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="regPassword">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="regPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleRegister}
              disabled={isLoading}
              className="w-full"
              variant="gold"
            >
              {isLoading ? "Đang đăng ký..." : "Đăng Ký"}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;