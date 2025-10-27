import axios from "axios"


const URL_BASE = process.env.NEXT_PUBLIC_API_URL


let addSignature = async ({employeeId,cordx,cordy}) => {
  // if (!employeeId) return;
    const data = {
      employeeId: employeeId,
      cordx: cordy,
      cordy: cordx,

    }
    
    try {
        await axios.post(
          `${URL_BASE}/attendance`, 
         data,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer your_token' // If needed
            }
          }
        );
   
      } catch (error) {
        console.log('Error adding signature:', error);
      }
    };
    // let user = data.data.find((user) => user.username === userName && user.password === password)




export default addSignature
