import axios from "axios"




let userLogIn = async () => {
    let data = await axios.get('http://localhost:3001/attendance')
    // let user = data.data.find((user) => user.username === userName && user.password === password)
   return await data.data
}



export default userLogIn