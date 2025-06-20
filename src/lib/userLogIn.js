import axios from "axios"

const URL_BASE = process.env.NEXT_PUBLIC_API_URL



let userLogIn = async () => {
    let data = await axios.get(`${URL_BASE}/attendance`)
    // let user = data.data.find((user) => user.username === userName && user.password === password)
   return await data.data
}



export default userLogIn