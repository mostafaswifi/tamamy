import axios from "axios";

const URL_BASE = process.env.NEXT_PUBLIC_API_URL

const alterEmployee = async ({employeeName, employeeCode, department, jobTitle},id) => {
 
    const data = { 
      
        employeeName,
        employeeCode,
        department,
        jobTitle
    };

    try {
        await axios.put(`${URL_BASE}/employees/${id}`, data, {
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer your_token", // If needed
            },
        });
    } catch (error) {
        console.error("Error adding employee:", error);
    }
}

export default alterEmployee;