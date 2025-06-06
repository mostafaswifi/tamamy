"use client";
import { useState } from "react";
import addEmployee from "../../lib/addEmployee";
import Swal from "sweetalert2";
import { redirect, useRouter } from "next/navigation";

const admin = process.env.NEXT_PUBLIC_SUPER_ADMIN_PASSWORD;






const addEmploye = () => {
  const [password, setPassword] = useState("");
  const [employee, setEmployee] = useState({
    employeeName: "",
    employeeCode: "",
    hireDate: "",
    department: "",
    jobTitle: "",
  });

const addEmployeeHandler = async (e, employee) => {
  e.preventDefault();

 



if (employee?.employeeName && employee?.employeeCode && employee?.department && employee?.jobTitle) {
    await addEmployee(
    employee?.employeeName,
    employee?.employeeCode,
    employee?.hireDate,
    employee?.department,
    employee?.jobTitle
  );
    Swal.fire({
      icon: "success",
      title: "تم إضافة الموجه بنجاح",
      showConfirmButton: false,
      timer: 1500,
    });
  } else {
      setEmployee({
    ...employee,
    employeeName: "",
    employeeCode: "",
    hireDate: "",
    department: "",
    jobTitle: "",
  });
    Swal.fire({
      icon: "error",
      title: "خطأ في إضافة الموجه",
      text: "يرجى التأكد من ملء جميع الحقول المطلوبة",
      showConfirmButton: true,
    });
  }

};

const router = useRouter();
const routHandler = (e) => {
  e.preventDefault();   
  router.replace("/allEmployees");
};

  return (
    <div className="container" dir="rtl">
     {password !== admin && (
       <input
        className="my-5 form-control"
        type="password"
        placeholder="أدخل كلمة مرور المسئول"
        onChange={(e) => setPassword(e.target.value)}
      />
     )}
      {password == admin && (
        <form className="d-flex flex-column justify-content-center align-items-center mt-5">
          <h1 className="text-center">إضافة موجه جديد</h1>
          <input
            className="mb-3 form-control"
            type="text"
            placeholder="اسم الموجه"
            value={employee.employeeName}
            onChange={(e) =>
              setEmployee({ ...employee, employeeName: e.target.value })
            }
          />
          <input
            className="mb-3 form-control"
            type="text"
            placeholder="أدخل كلمة مرور المسئول "
            value={employee.employeeCode}
            onChange={(e) =>
              setEmployee({ ...employee, employeeCode: e.target.value })
            }
          />
          {/* <input
            className="mb-3 form-control"
            type="text"
            placeholder="تاريخ التعين بالقسم  "
            onChange={(e) =>
              setEmployee({ ...employee, hireDate: e.target.value })
            }
          /> */}
          <input
            className="mb-3 form-control"
            type="text"
            placeholder="المادة"
            value={employee.department}
            onChange={(e) =>
              setEmployee({ ...employee, department: e.target.value })
            }
          />
          <input
            className="mb-3 form-control"
            type="text"
            placeholder="موجه أول / موجه"
            value={employee.jobTitle}
            onChange={(e) =>
              setEmployee({ ...employee, jobTitle: e.target.value })
            }
          />
          <div className="d-flex justify-content-center align-items-center gap-2">
            <button
              className="btn btn-primary"
              onClick={(e) => addEmployeeHandler(e, employee)}
            >
              إضافة موجه
            </button>
            <button className="btn btn-primary" onClick={(e)=>routHandler(e)}>تعديل بيانات موجه</button>
          
          </div>
        </form>
      )}
    </div>
  );
};

export default addEmploye;
