"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import employeeLogIn from "@/lib/emloyeeLogIn";
import deleteEmployer from "@/lib/deleteEmployer";
import alterEmployee from "@/lib/alterEmployee";
import Swal from "sweetalert2";

const AllEmployees = () => {
  const admin = process.env.NEXT_PUBLIC_SUPER_ADMIN_PASSWORD;
  const [employees, setEmployees] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [modifiedEmployees, setModifiedEmployees] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const employeeData = await employeeLogIn();
        setEmployees(employeeData);
      } catch (error) {
        console.error("Error fetching employees:", error);
        Swal.fire({
          icon: "error",
          title: "خطأ في تحميل البيانات",
          text: "تعذر تحميل قائمة الموجهين",
          confirmButtonText: "حاول مرة أخرى",
        });
      }
    };
    fetchData();
  }, []);

  const handleAdminLogin = (e) => {
    const inputPassword = e.target.value;
    setPassword(inputPassword);
    if (inputPassword === admin) {
      setIsAuthenticated(true);
    }
  };

  const handleInputChange = (employeeId, field, value) => {
    setModifiedEmployees(prev => ({
      ...prev,
      [employeeId]: {
        ...prev[employeeId],
        [field]: value
      }
    }));
  };

  const alterEmployeeHandler = async (employeeId) => {
    const modifiedData = modifiedEmployees[employeeId];
    if (!modifiedData) {
      Swal.fire({
        icon: "warning",
        title: "لا توجد تغييرات",
        text: "لم تقم بإجراء أي تغييرات على البيانات",
        confirmButtonText: "حسناً",
      });
      return;
    }

    try {
      await alterEmployee(modifiedData, employeeId);
      
      // Update local state
      setEmployees(prev => prev.map(emp => 
        emp.id === employeeId ? { ...emp, ...modifiedData } : emp
      ));
      
      // Clear modified data for this employee
      setModifiedEmployees(prev => {
        const newState = { ...prev };
        delete newState[employeeId];
        return newState;
      });

      Swal.fire({
        icon: "success",
        title: "تم التعديل بنجاح",
        text: "تم تحديث بيانات الموجه بنجاح",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "خطأ في التعديل",
        text: "تعذر تعديل بيانات الموجه",
        confirmButtonText: "حاول مرة أخرى",
      });
    }
  };

  const deleteUserHandler = async (employeeId, employeeName) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "تأكيد الحذف",
      text: `هل أنت متأكد من حذف الموجه ${employeeName}؟`,
      showCancelButton: true,
      confirmButtonText: "نعم، احذف",
      cancelButtonText: "إلغاء",
      confirmButtonColor: "#dc3545",
    });

    if (result.isConfirmed) {
      try {
        await deleteEmployer(employeeId);
        setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
        
        Swal.fire({
          icon: "success",
          title: "تم الحذف بنجاح",
          text: "تم حذف الموجه بنجاح",
          showConfirmButton: false,
          timer: 1500,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "خطأ في الحذف",
          text: "تعذر حذف الموجه",
          confirmButtonText: "حاول مرة أخرى",
        });
      }
    }
  };

  const routHandler = () => {
    router.replace("/addEmploye");
  };

  const filteredEmployees = employees.filter(employee =>
    employee.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employeeCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const hasChanges = (employeeId) => {
    return modifiedEmployees[employeeId] && Object.keys(modifiedEmployees[employeeId]).length > 0;
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-light min-vh-100 d-flex align-items-center" dir="rtl">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="card shadow-lg border-0">
                <div className="card-body p-5">
                  <div className="text-center mb-4">
                    <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                         style={{ width: '80px', height: '80px' }}>
                      <span className="text-white fw-bold fs-3">ق</span>
                    </div>
                    <h3 className="card-title text-primary fw-bold mb-2">الدخول كمسؤول</h3>
                    <p className="text-muted">أدخل كلمة مرور المسؤول للوصول إلى إدارة الموجهين</p>
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
        </div>
      </div>
    );
  }

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
              <h1 className="navbar-brand h5 mb-0 fw-bold text-dark">إدارة الموجهين</h1>
              <p className="text-muted small mb-0">عرض وتعديل وحذف بيانات الموجهين</p>
            </div>
          </div>
          <button 
            className="btn btn-outline-secondary"
            onClick={() => setIsAuthenticated(false)}
          >
            خروج
          </button>
        </div>
      </nav>

      <div className="container py-4">
        {/* Controls Card */}
        <div className="card shadow-lg border-0 mb-4">
          <div className="card-body">
            <div className="row g-3 align-items-end">
              <div className="col-md-6">
                <label className="form-label fw-semibold text-dark">بحث في الموجهين</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="ابحث بالاسم، الكود، القسم، أو المسمى الوظيفي..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <button 
                  className="btn btn-primary w-100 fw-bold"
                  onClick={routHandler}
                >
                  إضافة موجه جديد
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card border-0 bg-primary text-white">
              <div className="card-body text-center py-3">
                <div className="h4 fw-bold mb-1">{employees.length}</div>
                <div className="small">إجمالي الموجهين</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 bg-success text-white">
              <div className="card-body text-center py-3">
                <div className="h4 fw-bold mb-1">
                  {employees.filter(emp => emp.jobTitle === 'موجه أول').length}
                </div>
                <div className="small">موجه أول</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 bg-info text-white">
              <div className="card-body text-center py-3">
                <div className="h4 fw-bold mb-1">
                  {employees.filter(emp => emp.jobTitle === 'موجه').length}
                </div>
                <div className="small">موجه</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 bg-warning text-white">
              <div className="card-body text-center py-3">
                <div className="h4 fw-bold mb-1">{filteredEmployees.length}</div>
                <div className="small">نتائج البحث</div>
              </div>
            </div>
          </div>
        </div>

        {/* Employees Table */}
        <div className="card shadow-lg border-0">
          <div className="card-header bg-white border-0 py-3">
            <h5 className="card-title mb-0 fw-bold text-primary">
              قائمة الموجهين ({filteredEmployees.length})
            </h5>
          </div>
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th scope="col" className="ps-3">#</th>
                    <th scope="col">الاسم</th>
                    <th scope="col">كود الموجه</th>
                    <th scope="col">المادة</th>
                    <th scope="col">المسمى الوظيفي</th>
                    <th scope="col" className="text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-5">
                        <div className="text-muted">
                          <div className="mb-3" style={{ fontSize: '3rem' }}>👥</div>
                          <h5 className="text-dark">لا توجد بيانات</h5>
                          <p className="mb-0">{searchTerm ? "لم يتم العثور على نتائج للبحث" : "لا توجد بيانات عن الموجهين"}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((employee, index) => (
                      <tr key={employee.id} className={hasChanges(employee.id) ? "table-warning" : ""}>
                        <td className="ps-3 fw-semibold">{index + 1}</td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            defaultValue={employee.employeeName}
                            onChange={(e) => handleInputChange(employee.id, 'employeeName', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            defaultValue={employee.employeeCode}
                            onChange={(e) => handleInputChange(employee.id, 'employeeCode', e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-control"
                            defaultValue={employee.department}
                            onChange={(e) => handleInputChange(employee.id, 'department', e.target.value)}
                          />
                        </td>
                        <td>
                          <select
                            className="form-select"
                            defaultValue={employee.jobTitle}
                            onChange={(e) => handleInputChange(employee.id, 'jobTitle', e.target.value)}
                          >
                            <option value="موجه">موجه</option>
                            <option value="موجه أول">موجه أول</option>
                          </select>
                        </td>
                        <td>
                          <div className="d-flex gap-2 justify-content-center">
                            <button
                              className={`btn btn-sm ${hasChanges(employee.id) ? 'btn-warning' : 'btn-outline-warning'}`}
                              onClick={() => alterEmployeeHandler(employee.id)}
                              disabled={!hasChanges(employee.id)}
                              title={hasChanges(employee.id) ? "حفظ التغييرات" : "لا توجد تغييرات"}
                            >
                              حفظ
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => deleteUserHandler(employee.id, employee.employeeName)}
                              title="حذف الموجه"
                            >
                              حذف
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllEmployees;
