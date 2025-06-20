import axios from "axios";
const URL_BASE = process.env.NEXT_PUBLIC_API_URL

const AddEmployee = async (employeeName, employeeCode, hireDate, department, jobTitle) => {
  if (!employeeName || !employeeCode || !department || !jobTitle) {
    return
  }
  const data = {
    employeeName,
    employeeCode,
    hireDate,
    department,
    jobTitle
  };

  try {
    await axios.post(`${URL_BASE}/api/employees`, data, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer your_token", // If needed
      },
    });
  } catch (error) {
    console.error("Error adding employee:", error);
  }
}

export default AddEmployee;