"use client";

import React, { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import employeeLogIn from "@/lib/emloyeeLogIn";
import deleteEmployer from "@/lib/deleteEmployer";
import alterEmployee from "@/lib/alterEmployee";
import Swal from "sweetalert2";
const AllEmployees = () => {
  const admin = process.env.NEXT_PUBLIC_SUPER_ADMIN_PASSWORD;
  const [employee, setEmployee] = useState({
    id: "",
    employeeName: "",
    employeeCode: "",
    hireDate: "",
    department: "",
    jobTitle: ""
  });


    const [modifyEmployee, setModifyEmployee] = useState({
    id: "",
    employeeName: "",
    employeeCode: "",
    department: "",
    jobTitle: ""
  });

  const router = useRouter();
  const routHandler = (e) => {
    e.preventDefault();
    router.replace("/addEmploye");
  };
  const [employees, setEmployees] = useState([]);

 useEffect(() => {
    const data = async () => {
      const employee = await employeeLogIn();
      setEmployees(employee);
     
    };
    data();
 }, [employees]);


 const alterEmployeeHandler = async (e, modifyEmployee,id) => {
  
  e.preventDefault();
  await alterEmployee(

  modifyEmployee, id
  );
  Swal.fire({
    icon: "success",
    title: "تم تعديل الموجه بنجاح",
    showConfirmButton: false,
    timer: 1500,
  });
}

  
  const deleteUserHandler = async (e, id) => {
    e.preventDefault();
    await deleteEmployer(id);
    Swal.fire({
      icon: "success",
      title: "تم حذف الموجه بنجاح",
      showConfirmButton: false,
      timer: 1500,
    });
  };
// console.log()
  return (
    <div className="container mt-5 position-relative" dir="rtl" style={{ minHeight: "100vh" }} >
      <h1 className="text-center">قائمة الموجهين</h1>

      <table className="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">الاسم</th>
            <th scope="col">كود الموجه</th>
            <th scope="col">الوظيفة</th>
            <th scope="col">القسم</th>
            {/* <th scope="col">تاريخ التسجيل</th> */}
            <th scope="col">حذف </th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <td><input className="form-control " type="text" value={employee.id} readOnly /></td>
              <td><input className="form-control" type="text" defaultValue={employee.employeeName}  onChange={(e) => setModifyEmployee({ ...modifyEmployee, employeeName: e.target.value  })}  /></td>
              <td><input className="form-control" type="text" defaultValue={employee.employeeCode}  onChange={(e) => setModifyEmployee({ ...modifyEmployee, employeeCode: e.target.value })}  /></td>
              <td><input className="form-control" type="text" defaultValue={employee.department}  onChange={(e) => setModifyEmployee({ ...modifyEmployee, department: e.target.value })}  /></td>
              <td><input className="form-control" type="text" defaultValue={employee.jobTitle}  onChange={(e) => setModifyEmployee({ ...modifyEmployee, jobTitle: e.target.value })}  /></td>
              <td>
                <div className="d-flex justify-content-center align-items-center gap-2">
                  <button
                    className="btn btn-danger"
                    onClick={(e) => deleteUserHandler(e, employee.id)}
                  >
                    حذف
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={(e) => {
                      alterEmployeeHandler(e, modifyEmployee, employee.id);
                    }}
                  >
                    تعديل
                  </button>

                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button className="btn btn-primary" onClick={(e) => routHandler(e)}>
        إضافة موجه جديد
      </button>
    </div>
  );
};

export default AllEmployees;
