import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Phone, Lock, UserCheck, Eye, EyeOff, Check, X, Loader2, KeyRound } from "lucide-react";
import apiService from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useUsernameCheck } from "@/hooks/useUsernameCheck";
import { useAuth } from "@/hooks/useAuth";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
  activeTab?: 'login' | 'register';
}

const AuthModal = ({ isOpen, onClose, onAuthSuccess, activeTab = 'login' }: AuthModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
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
  const { signIn } = useAuth();
  
  // Referral code from URL (?ref=CODE)
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralFromUrl, setReferralFromUrl] = useState(false);
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref) { setReferralCode(ref); setReferralFromUrl(true); }
    } catch {}
  }, []);
  
  // Controlled tab state
  const [tab, setTab] = useState<'login' | 'register'>(activeTab);
  useEffect(() => {
    if (isOpen) {
      setTab(activeTab);
    }
  }, [isOpen, activeTab]);

  // Username check hook
  const usernameCheck = useUsernameCheck(formData.username);
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
      const response = await apiService.login({
        username: formData.username,
        password: formData.password
      });

      if (!response.success) {
        toast({
          title: "Đăng nhập thất bại",
          description: response.error || "Tên đăng nhập hoặc mật khẩu không đúng",
          variant: "destructive"
        });
        return;
      }

      // Store tokens
      if (response.data.token) {
        console.log('🔑 Storing token:', response.data.token);
        apiService.setToken(response.data.token);
        localStorage.setItem('refresh_token', response.data.refreshToken);
        console.log('✅ Tokens stored successfully');
      }

      // Set user data and profile in context
      if (response.data.user) {
        console.log('👤 Setting user data:', response.data.user);
        console.log('👤 Setting profile data:', response.data.profile);
        
        // Sign in with both user and profile data
        signIn(response.data.user, response.data.profile);
        console.log('✅ User and profile data set in context');
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

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập email",
        variant: "destructive"
      });
      return;
    }

    setIsResettingPassword(true);
    try {
      // TODO: Implement password reset API endpoint
      toast({
        title: "Tính năng đang phát triển",
        description: "Chức năng reset mật khẩu sẽ được cập nhật sớm. Vui lòng liên hệ hỗ trợ.",
        variant: "default"
      });
      
      setShowResetPassword(false);
      setResetEmail('');
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi reset mật khẩu. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsResettingPassword(false);
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

    // Check username availability before proceeding
    if (usernameCheck.isAvailable === false) {
      toast({
        title: "Lỗi",
        description: usernameCheck.error || "Tên người dùng đã tồn tại",
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
      console.log('📤 Calling backend registration API');
      const response = await apiService.register({
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        referralCode: referralCode || undefined
      });

      console.log('📥 Registration response:', response);

      if (!response.success) {
        console.log('❌ Registration failed:', response.error);
        
        toast({
          title: "Lỗi đăng ký",
          description: response.error || "Có lỗi xảy ra khi đăng ký",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Registration successful, attempting auto-login');

      // Store tokens
      if (response.data.token) {
        console.log('🔑 Storing token:', response.data.token);
        apiService.setToken(response.data.token);
        localStorage.setItem('refresh_token', response.data.refreshToken);
        console.log('✅ Tokens stored successfully');
      }

      // Set user data and profile in context for auto-login
      if (response.data.user) {
        console.log('👤 Setting user data:', response.data.user);
        console.log('👤 Setting profile data:', response.data.profile);
        
        // Sign in with both user and profile data
        signIn(response.data.user, response.data.profile);
        console.log('✅ User and profile data set in context');
      }

      toast({
        title: "Đăng ký thành công",
        description: "Chào mừng bạn đến với DINAMONDBET68! Bạn đã được tự động đăng nhập và sẵn sàng sử dụng."
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
      <DialogContent className="sm:max-w-[500px] bg-card border-border max-h-[90vh] overflow-y-auto custom-scrollbar animate-fade-in animate-scale-in">
        <div className="animate-fade-in-up">{/* Content wrapper for additional animation */}
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-gradient animate-fade-in delay-100">
            DINAMONDBET68
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={tab} onValueChange={(v) => setTab(v as 'login' | 'register')} className="w-full animate-fade-in delay-200">
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
            
            {!showResetPassword ? (
              <>
                <Button 
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full"
                  variant="casino"
                >
                  {isLoading ? "Đang đăng nhập..." : "Đăng Nhập"}
                </Button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(true)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Reset mật khẩu</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Nhập email của bạn để nhận link reset mật khẩu
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="resetEmail">Email</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="resetEmail"
                      type="email"
                      placeholder="Nhập email của bạn"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setShowResetPassword(false);
                      setResetEmail('');
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Hủy
                  </Button>
                  <Button 
                    onClick={handleResetPassword}
                    disabled={isResettingPassword || !resetEmail}
                    className="flex-1"
                    variant="casino"
                  >
                    {isResettingPassword ? "Đang gửi..." : "Gửi link"}
                  </Button>
                </div>
              </div>
            )}
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
                    className={`pl-10 pr-10 ${
                      formData.username && formData.username.length >= 3
                        ? usernameCheck.isAvailable === true
                          ? 'border-green-500 focus:border-green-500'
                          : usernameCheck.isAvailable === false
                          ? 'border-red-500 focus:border-red-500'
                          : ''
                        : ''
                    }`}
                  />
                  {/* Status indicator */}
                  {formData.username && formData.username.length >= 3 && (
                    <div className="absolute right-3 top-3 h-4 w-4">
                      {usernameCheck.isChecking ? (
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                      ) : usernameCheck.isAvailable === true ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : usernameCheck.isAvailable === false ? (
                        <X className="h-4 w-4 text-red-500" />
                      ) : null}
                    </div>
                  )}
                </div>
                {/* Error message */}
                {usernameCheck.error && formData.username && (
                  <p className="text-sm text-red-500 mt-1">{usernameCheck.error}</p>
                )}
                {/* Success message */}
                {usernameCheck.isAvailable === true && formData.username && (
                  <p className="text-sm text-green-500 mt-1">✓ Tên người dùng có thể sử dụng</p>
                )}
                {/* Username taken message */}
                {usernameCheck.isAvailable === false && formData.username && !usernameCheck.error && (
                  <p className="text-sm text-red-500 mt-1">✗ Tên người dùng đã tồn tại</p>
                )}
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
                <Label htmlFor="referralCode">Mã mời (tuỳ chọn)</Label>
                <div className="relative">
                  <Input
                    id="referralCode"
                    type="text"
                    placeholder="Nhập mã mời (nếu có)"
                    value={referralCode || ''}
                    onChange={(e) => setReferralCode(e.target.value)}
                    readOnly={!!referralFromUrl}
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
              disabled={
                isLoading ||
                usernameCheck.isChecking ||
                usernameCheck.isAvailable === false ||
                !!usernameCheck.error ||
                !formData.username ||
                formData.username.length < 3
              }
              className="w-full"
              variant="gold"
            >
              {isLoading ? "Đang đăng ký..." : "Đăng Ký"}
            </Button>
          </TabsContent>
        </Tabs>
        </div>{/* End content wrapper */}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;