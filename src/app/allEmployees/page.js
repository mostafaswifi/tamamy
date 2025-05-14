'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import employeeLogIn from '@/lib/emloyeeLogIn'
import deleteEmployer from '@/lib/deleteEmployer'
import Swal from 'sweetalert2'
const allEmployees = () => {
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
  
  return (
    <div className='container mt-5' dir='rtl'>
      <h1 className='text-center'>قائمة الموجهين</h1>
      
          <table  className='table'>
        <thead>
            <tr >
              <th scope="col">#</th>
              <th scope="col">الاسم</th>
              <th scope="col">الوظيفة</th>
              <th scope="col">القسم</th>
              <th scope="col">تاريخ التسجيل</th>
              <th scope='col'>حذف </th>
            </tr>
          </thead>
          <tbody>
      {employees.map((employee) => (
        
            <tr key={employee.id}>
              <td>{employee.id}</td>
              <td>{employee.employeeName}</td>
              <td>{employee.jobTitle}</td>
              <td>{employee.department}</td>
              <td>{employee.createdAt}</td>
                <td>
                    <button className='btn btn-danger' onClick={(e)=>deleteUserHandler(e, employee.id)}>حذف</button>
                </td>
            </tr>
      ))}
      </tbody>
      </table>
        <button className='btn btn-primary' onClick={(e)=>routHandler(e)}>إضافة موجه جديد</button>
    </div>
  )
}

export default allEmployees
