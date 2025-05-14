import axios from "axios";

const URL_BASE = process.env.NEXT_PUBLIC_API_URL
const deleteEmployer = async (employeeId) => {
  try {
    await axios.delete(`${URL_BASE}/employees/${employeeId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer your_token", // If needed
      },
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
  }
};
export default deleteEmployer;