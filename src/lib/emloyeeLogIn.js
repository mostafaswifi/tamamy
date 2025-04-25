import axios from "axios";

let employeeLogIn = async () => {
    let employee = await axios.get('http://localhost:3001/employees')
    return employee.data
}

export default employeeLogIn
