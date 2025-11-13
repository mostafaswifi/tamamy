"use client";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const admin = process.env.NEXT_PUBLIC_SUPER_ADMIN_PASSWORD;

// Database service functions
const EmployeeService = {
  // Add employee to database
  async addEmployee(employeeName, employeeCode, hireDate, department, jobTitle) {
    try {
      const response = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeName,
          employeeCode,
          hireDate,
          department,
          jobTitle
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add employee');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding employee:', error);
      throw error;
    }
  },

  // Get all employees
  async getAllEmployees() {
    try {
      const response = await fetch('/api/employees');
      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching employees:', error);
      throw error;
    }
  }
};

const AddEmploye = () => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [employee, setEmployee] = useState({
    employeeName: "",
    employeeCode: "",
    hireDate: "",
    department: "",
    jobTitle: "",
  });

  const router = useRouter();

  // Enhanced Arabic text normalization function
  const normalizeArabicText = (text) => {
    if (!text || typeof text !== 'string') return '';
    
    return text
      // Normalize Arabic characters
      .replace(/[أإآٱ]/g, 'ا')           // All Alef variations → ا
      .replace(/ة/g, 'ه')               // Teh Marbuta → ه
      .replace(/ى/g, 'ي')               // Alef Maqsura → Yeh (ى → ي)
      .replace(/[ًٌٍَُِّْ~ٰ]/g, '')      // Remove all diacritics
      .replace(/[ؤ]/g, 'و')             // Waw with Hamza → و
      .replace(/[ئ]/g, 'ء')             // Yeh with Hamza → ء
      // Normalize spaces - ONLY replace 2+ spaces with single space
      .replace(/\s{2,}/g, ' ')          // ONLY multiple spaces → single space
      .replace(/\u200B/g, '')           // Remove zero-width spaces
      .trim();                          // Remove spaces from start and end
  };

  // Enhanced Arabic text validation
  const validateArabicText = (text) => {
    if (!text || typeof text !== 'string') return false;
    
    // Allow Arabic characters, spaces, numbers, and common punctuation
    const arabicExtendedRegex = /^[\u0600-\u06FF\s\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF0-9\-_.,;:!?()]+$/;
    
    return arabicExtendedRegex.test(text);
  };

  // Input length validation
  const validateInputLength = (text, fieldName, maxLength = 100) => {
    if (text.length > maxLength) {
      Swal.fire({
        icon: "error",
        title: "النص طويل جداً",
        text: `${fieldName} يجب أن لا يتجاوز ${maxLength} حرف`,
        confirmButtonText: "حاول مرة أخرى",
      });
      return false;
    }
    return true;
  };

  // Form validation
  const validateForm = (employeeData) => {
    const errors = [];
    
    if (!employeeData.employeeName.trim()) errors.push("اسم الموجه مطلوب");
    if (!employeeData.employeeCode.trim()) errors.push("كود الموجه مطلوب");
    if (!employeeData.department.trim()) errors.push("المادة مطلوبة");
    if (!employeeData.jobTitle.trim()) errors.push("المسمى الوظيفي مطلوب");
    
    if (employeeData.hireDate) {
      const hireDate = new Date(employeeData.hireDate);
      const today = new Date();
      if (hireDate > today) errors.push("تاريخ التعيين لا يمكن أن يكون في المستقبل");
    }
    
    return errors;
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setEmployee(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add employee handler
  const addEmployeeHandler = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Normalize all text fields before validation and submission
    const normalizedEmployee = {
      employeeName: normalizeArabicText(employee.employeeName),
      employeeCode: normalizeArabicText(employee.employeeCode),
      hireDate: employee.hireDate,
      department: normalizeArabicText(employee.department),
      jobTitle: normalizeArabicText(employee.jobTitle),
    };

    // Validate required fields
    const { employeeName, employeeCode, department, jobTitle, hireDate } = normalizedEmployee;
    if (!employeeName || !employeeCode || !department || !jobTitle) {
      Swal.fire({
        icon: "error",
        title: "خطأ في الإدخال",
        text: "يرجى ملء جميع الحقول المطلوبة",
        confirmButtonText: "حاول مرة أخرى",
      });
      setIsLoading(false);
      return;
    }

    // Arabic text validation
    if (!validateArabicText(employeeName)) {
      Swal.fire({
        icon: "error",
        title: "اسم غير صالح",
        text: "يرجى إدخال اسم صحيح باللغة العربية (يمكن استخدام المسافات بين الكلمات)",
        confirmButtonText: "حاول مرة أخرى",
      });
      setIsLoading(false);
      return;
    }

    // Input length validation
    if (!validateInputLength(employeeName, "اسم الموجه", 50) || 
        !validateInputLength(department, "المادة", 30)) {
      setIsLoading(false);
      return;
    }

    // Form validation
    const validationErrors = validateForm(normalizedEmployee);
    if (validationErrors.length > 0) {
      Swal.fire({
        icon: "error",
        title: "خطأ في البيانات",
        html: validationErrors.map(error => `<div>• ${error}</div>`).join(''),
        confirmButtonText: "حاول مرة أخرى",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Call the database service
      await EmployeeService.addEmployee(employeeName, employeeCode, hireDate, department, jobTitle);
      
      // Reset form on success
      setEmployee({
        employeeName: "",
        employeeCode: "",
        hireDate: "",
        department: "",
        jobTitle: "",
      });

      Swal.fire({
        icon: "success",
        title: "تمت العملية بنجاح",
        text: "تم إضافة الموجه بنجاح",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("Error adding employee:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ في الإضافة",
        text: "حدث خطأ أثناء إضافة الموجه. يرجى المحاولة مرة أخرى.",
        confirmButtonText: "حاول مرة أخرى",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = (e) => {
    const inputPassword = e.target.value;
    setPassword(inputPassword);
    
    if (isLocked) return;
    
    if (inputPassword === admin) {
      setIsAuthenticated(true);
      setLoginAttempts(0);
    } else if (inputPassword.length >= admin?.length) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setIsLocked(true);
        setTimeout(() => {
          setIsLocked(false);
          setLoginAttempts(0);
          setPassword("");
        }, 30000); // Lock for 30 seconds
      }
    }
  };

  const routeHandler = (e) => {
    e.preventDefault();   
    router.push("/allEmployees");
  };

  const resetForm = () => {
    setEmployee({
      employeeName: "",
      employeeCode: "",
      hireDate: "",
      department: "",
      jobTitle: "",
    });
  };

  const logoutHandler = () => {
    setIsAuthenticated(false);
    setPassword("");
    setLoginAttempts(0);
    setIsLocked(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey && e.key === 'Enter' && isAuthenticated) {
        const form = document.querySelector('form');
        if (form) form.requestSubmit();
      }
      if (e.key === 'Escape') {
        resetForm();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isAuthenticated]);

  return (
    <div className="bg-light min-vh-100" dir="rtl">
      {/* Header */}
      <nav className="navbar navbar-light bg-white shadow-sm border-bottom">
        <div className="container">
          <div className="d-flex align-items-center">
            <div className="bg-primary rounded-2 d-flex align-items-center justify-content-center me-3" 
                 style={{ width: '45px', height: '45px' }}>
              <span className="text-white fw-bold fs-5">م</span>
            </div>
            <div>
              <h1 className="navbar-brand h5 mb-0 fw-bold text-dark">نظام إدارة الموجهين</h1>
              <p className="text-muted small mb-0">إضافة وتعديل بيانات الموجهين</p>
            </div>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        {/* Admin Authentication */}
        {!isAuthenticated && (
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="card shadow-lg border-0">
                <div className="card-body p-4">
                  <div className="text-center mb-4">
                    <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                         style={{ width: '70px', height: '70px' }}>
                      <span className="text-white fw-bold fs-3">ق</span>
                    </div>
                    <h3 className="card-title text-primary fw-bold mb-2">الدخول كمسؤول</h3>
                    <p className="text-muted">أدخل كلمة مرور المسؤول للمتابعة</p>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark">كلمة المرور</label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      placeholder="أدخل كلمة مرور المسؤول"
                      value={password}
                      onChange={handleAdminLogin}
                      disabled={isLocked}
                    />
                    {isLocked && (
                      <div className="alert alert-warning mt-2 mb-0 py-2">
                        <small>تم تعطيل الدخول مؤقتاً بسبب عدة محاولات خاطئة. يرجى المحاولة بعد 30 ثانية.</small>
                      </div>
                    )}
                    {loginAttempts > 0 && !isLocked && (
                      <div className="text-warning mt-1 small">
                        محاولات خاطئة: {loginAttempts} / 3
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Employee Form */}
        {isAuthenticated && (
          <div className="card shadow-lg border-0">
            <div className="card-header bg-white border-0 py-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="card-title h4 fw-bold text-primary mb-1">إضافة موجه جديد</h2>
                  <p className="text-muted mb-0">أدخل بيانات الموجه الجديد</p>
                </div>
                <div className="d-flex gap-2">
                  <span className="badge bg-info fs-6">تطبيع تلقائي للنص</span>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={logoutHandler}
                    type="button"
                  >
                    خروج
                  </button>
                </div>
              </div>
            </div>

            <div className="card-body p-4">
              <form onSubmit={addEmployeeHandler}>
                <div className="row g-3">
                  {/* Employee Name */}
                  <div className="col-md-6">
                    <label htmlFor="employeeName" className="form-label fw-semibold text-dark">
                      اسم الموجه <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="employeeName"
                      placeholder="أدخل اسم الموجه بالكامل (يمكن استخدام المسافات)"
                      value={employee.employeeName}
                      onChange={(e) => handleInputChange('employeeName', e.target.value)}
                      required
                    />
                    <div className="form-text text-muted">
                      يمكنك استخدام المسافات بين الكلمات - سيتم تطبيع النص تلقائياً عند الحفظ
                    </div>
                  </div>

                  {/* Employee Code */}
                  <div className="col-md-6">
                    <label htmlFor="employeeCode" className="form-label fw-semibold text-dark">
                      كود الموجه <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="employeeCode"
                      placeholder="أدخل الكود الخاص بالموجه"
                      value={employee.employeeCode}
                      onChange={(e) => handleInputChange('employeeCode', e.target.value)}
                      required
                    />
                    <div className="form-text text-muted">
                      المسافات المزدوجة → مسافة واحدة
                    </div>
                  </div>

                  {/* Department */}
                  <div className="col-md-6">
                    <label htmlFor="department" className="form-label fw-semibold text-dark">
                      المادة <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="department"
                      placeholder="أدخل اسم المادة (يمكن استخدام المسافات)"
                      value={employee.department}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      required
                    />
                    <div className="form-text text-muted">
                      مثال: &quot;اللغة العربية&quot; → &quot;اللغه العربيه&quot;
                    </div>
                  </div>

                  {/* Job Title */}
                  <div className="col-md-6">
                    <label htmlFor="jobTitle" className="form-label fw-semibold text-dark">
                      المسمى الوظيفي <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select form-select-lg"
                      id="jobTitle"
                      value={employee.jobTitle}
                      onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                      required
                    >
                      <option value="">اختر المسمى الوظيفي</option>
                      <option value="موجه أول">موجه أول</option>
                      <option value="موجه">موجه</option>
                    </select>
                    <div className="form-text text-muted">
                      سيتم تطبيع النص المحدد تلقائياً
                    </div>
                  </div>

                  {/* Hire Date */}
                  <div className="col-md-6">
                    <label htmlFor="hireDate" className="form-label fw-semibold text-dark">
                      تاريخ التعيين
                    </label>
                    <input
                      type="date"
                      className="form-control form-control-lg"
                      id="hireDate"
                      value={employee.hireDate}
                      onChange={(e) => handleInputChange('hireDate', e.target.value)}
                    />
                    <div className="form-text text-muted">
                      حقل اختياري - لا يتم تطبيعه
                    </div>
                  </div>
                </div>

                {/* Normalization Preview */}
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="card border-info">
                      <div className="card-header bg-info text-white py-2">
                        <small className="fw-bold">معاينة التطبيع</small>
                      </div>
                      <div className="card-body py-3">
                        <div className="row small text-muted">
                          <div className="col-md-6">
                            <strong>الاسم:</strong> {normalizeArabicText(employee.employeeName) || '---'}
                          </div>
                          <div className="col-md-6">
                            <strong>المادة:</strong> {normalizeArabicText(employee.department) || '---'}
                          </div>
                          <div className="col-md-6">
                            <strong>الكود:</strong> {normalizeArabicText(employee.employeeCode) || '---'}
                          </div>
                          <div className="col-md-6">
                            <strong>المسمى:</strong> {normalizeArabicText(employee.jobTitle) || '---'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="row mt-5">
                  <div className="col-12">
                    <div className="d-flex gap-3 justify-content-center flex-wrap">
                      <button 
                        type="submit" 
                        className="btn btn-primary btn-lg fw-bold px-5"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            جاري الإضافة...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-person-plus me-2"></i>
                            إضافة الموجه
                          </>
                        )}
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-success btn-lg fw-bold px-5"
                        onClick={routeHandler}
                      >
                        <i className="bi bi-pencil-square me-2"></i>
                        تعديل بيانات موجه
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary btn-lg"
                        onClick={resetForm}
                        disabled={isLoading}
                      >
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        مسح النموذج
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Form Status */}
            <div className="card-footer bg-light border-0 py-3">
              <div className="row">
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted small">
                      الحقول marked with <span className="text-danger">*</span> إلزامية
                    </span>
                    <span className="badge bg-success fs-6">
                      ✓ المسافات مسموحة بين الكلمات
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddEmploye;
