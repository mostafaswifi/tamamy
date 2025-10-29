"use client";
import { useState } from "react";
import AddEmployee from "../../lib/addEmployee";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

const admin = process.env.NEXT_PUBLIC_SUPER_ADMIN_PASSWORD;

const AddEmploye = () => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [employee, setEmployee] = useState({
    employeeName: "",
    employeeCode: "",
    hireDate: "",
    department: "",
    jobTitle: "",
  });

  const router = useRouter();

  const addEmployeeHandler = async (e) => {
    e.preventDefault();

    // Validate required fields
    const { employeeName, employeeCode, department, jobTitle, hireDate } = employee;
    if (!employeeName || !employeeCode || !department || !jobTitle) {
      Swal.fire({
        icon: "error",
        title: "خطأ في الإدخال",
        text: "يرجى ملء جميع الحقول المطلوبة",
        confirmButtonText: "حاول مرة أخرى",
      });
      return;
    }

    try {
      // Fixed: Use the destructured variables
      await AddEmployee(employeeName, employeeCode, hireDate, department, jobTitle);
      
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
        text: "حدث خطأ أثناء إضافة الموجه",
        confirmButtonText: "حاول مرة أخرى",
      });
    }
  };

  const handleAdminLogin = (e) => {
    const inputPassword = e.target.value;
    setPassword(inputPassword);
    if (inputPassword === admin) {
      setIsAuthenticated(true);
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
  };

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
                    />
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
                <button 
                  className="btn btn-outline-secondary"
                  onClick={logoutHandler}
                  type="button"
                >
                  خروج
                </button>
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
                      placeholder="أدخل اسم الموجه بالكامل"
                      value={employee.employeeName}
                      onChange={(e) => setEmployee({ ...employee, employeeName: e.target.value })}
                      required
                    />
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
                      onChange={(e) => setEmployee({ ...employee, employeeCode: e.target.value })}
                      required
                    />
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
                      placeholder="أدخل اسم المادة"
                      value={employee.department}
                      onChange={(e) => setEmployee({ ...employee, department: e.target.value })}
                      required
                    />
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
                      onChange={(e) => setEmployee({ ...employee, jobTitle: e.target.value })}
                      required
                    >
                      <option value="">اختر المسمى الوظيفي</option>
                      <option value="موجه أول">موجه أول</option>
                      <option value="موجه">موجه</option>
                    </select>
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
                      onChange={(e) => setEmployee({ ...employee, hireDate: e.target.value })}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="row mt-5">
                  <div className="col-12">
                    <div className="d-flex gap-3 justify-content-center flex-wrap">
                      <button 
                        type="submit" 
                        className="btn btn-primary btn-lg fw-bold px-5"
                      >
                        <i className="bi bi-person-plus me-2"></i>
                        إضافة الموجه
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
                <div className="col-12 text-center">
                  <span className="text-muted small">
                    الحقول marked with <span className="text-danger">*</span> إلزامية
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {isAuthenticated && (
          <div className="row mt-4">
            <div className="col-md-4">
              <div className="card border-0 bg-primary text-white">
                <div className="card-body text-center py-4">
                  <div className="h4 fw-bold mb-2">إضافة</div>
                  <div className="small">موجه جديد</div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 bg-success text-white">
                <div className="card-body text-center py-4">
                  <div className="h4 fw-bold mb-2">تعديل</div>
                  <div className="small">بيانات موجودة</div>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card border-0 bg-info text-white">
                <div className="card-body text-center py-4">
                  <div className="h4 fw-bold mb-2">إدارة</div>
                  <div className="small">جميع الموجهين</div>
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
