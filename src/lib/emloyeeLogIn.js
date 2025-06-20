import axios from "axios";
const URL_BASE = process.env.NEXT_PUBLIC_API_URL

let employeeLogIn = async () => {
    let employee = await axios.get(`${URL_BASE}/employees`)
    return employee.data
}

export default employeeLogIn
