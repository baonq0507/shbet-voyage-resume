import { body, param, query, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// User registration validation
export const validateUserRegistration = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Họ tên là bắt buộc')
    .isLength({ min: 2, max: 100 })
    .withMessage('Họ tên phải có từ 2-100 ký tự'),
  
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Tên người dùng là bắt buộc')
    .isLength({ min: 3, max: 20 })
    .withMessage('Tên người dùng phải có từ 3-20 ký tự')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email là bắt buộc')
    .isEmail()
    .withMessage('Định dạng email không hợp lệ')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Mật khẩu là bắt buộc')
    .isLength({ min: 6 })
    .withMessage('Mật khẩu phải có ít nhất 6 ký tự'),
  
  body('phoneNumber')
    .optional()
    .trim()
    .isMobilePhone('vi-VN')
    .withMessage('Số điện thoại không hợp lệ'),
  
  body('referralCode')
    .optional()
    .trim()
    .isLength({ min: 6, max: 20 })
    .withMessage('Mã giới thiệu không hợp lệ'),
  
  handleValidationErrors
];

// User login validation
export const validateUserLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Tên người dùng là bắt buộc'),
  
  body('password')
    .notEmpty()
    .withMessage('Mật khẩu là bắt buộc'),
  
  handleValidationErrors
];

// Transaction validation
export const validateTransaction = [
  body('amount')
    .isNumeric()
    .withMessage('Số tiền phải là số')
    .isFloat({ min: 1000 })
    .withMessage('Số tiền tối thiểu là 1,000 VND')
    .isFloat({ max: 100000000 })
    .withMessage('Số tiền tối đa là 100,000,000 VND'),
  
  body('type')
    .isIn(['deposit', 'withdraw'])
    .withMessage('Loại giao dịch không hợp lệ'),
  
  handleValidationErrors
];

// Bank account validation
export const validateBankAccount = [
  body('bankName')
    .trim()
    .notEmpty()
    .withMessage('Tên ngân hàng là bắt buộc')
    .isLength({ min: 2, max: 100 })
    .withMessage('Tên ngân hàng phải có từ 2-100 ký tự'),
  
  body('accountNumber')
    .trim()
    .notEmpty()
    .withMessage('Số tài khoản là bắt buộc')
    .isLength({ min: 8, max: 20 })
    .withMessage('Số tài khoản phải có từ 8-20 ký tự')
    .isNumeric()
    .withMessage('Số tài khoản chỉ được chứa số'),
  
  body('accountHolder')
    .trim()
    .notEmpty()
    .withMessage('Tên chủ tài khoản là bắt buộc')
    .isLength({ min: 2, max: 100 })
    .withMessage('Tên chủ tài khoản phải có từ 2-100 ký tự'),
  
  handleValidationErrors
];

// ObjectId validation
export const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`${paramName} không hợp lệ`),
  
  handleValidationErrors
];

// Pagination validation
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Trang phải là số nguyên dương'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Giới hạn phải từ 1-100'),
  
  handleValidationErrors
];
