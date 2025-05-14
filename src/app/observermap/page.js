'use client'
import { useEffect , useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import userLogIn from "../../lib/userLogIn";
import { Suspense } from 'react';




const MapComponent = () => {
  const adminPassword = process.env.NEXT_PUBLIC_SUPER_ADMIN_PASSWORD
  const [admin,setAdmin] = useState([])
    const [user, setUser] = useState([])

    useEffect(() => {
        let data = async () => {
         
        let userData = await userLogIn()
         setUser(userData)
        }
        data()
      }, []);

  useEffect(() => {

   if (user) {

    let markers = user
    // Initialize the map when component mounts
    const map = new maplibregl.Map({
      container: 'map', // container ID
      style: 'https://api.maptiler.com/maps/outdoor-v2/style.json?key=HGPSwzDQY26yZCdA2ptF', // style URL
      center: [31.738187639095166,30.29199231869582], // starting position [lng, lat]
      zoom: 9 // starting zoom
    //   30.29199231869582, 31.738187639095166
    });



markers.map((mark)=>{
        const marker = new maplibregl.Marker()
  .setLngLat([mark.cordx,mark.cordy])
  .setPopup(
    new maplibregl.Popup() // add popup to marker
      .setHTML(`<b>${mark.employee.employeeName}</b>
       <div class='text-danger'>${mark.createdAt}</div>
       <div class='text-success'>${mark.departureTime}</div>
       `).trackPointer(true)
  )
  .addTo(map);

// Open popup immediately
marker.togglePopup();

})
  


      markers.map((marker)=>{
        new maplibregl.Marker()
      .setLngLat([marker.cordx,marker.cordy])
      .addTo(map);
      })




    // Clean up on unmount
    return () => map.remove();

    }


  },[user]);

  return (
    <div className='container-fluid  d-flex flex-column ' style={{height: '100vh'}}>

  <input type="password" className={admin !== adminPassword ? 'form-control my-3' : 'd-none'} placeholder='Enter Admin Password' onChange={(e)=>setAdmin(e.target.value)} style={{display: admin === adminPassword ? 'none!' : 'block'}}/>
    
 
    
  
    
   
    <input type="search" className={admin === adminPassword ? 'd-block form-control my-3' : 'd-none'}  placeholder='Search Employee' />

      <Suspense fallback={<div className='d-flex justify-content-center align-items-center' style={{height: '100vh'}}><h1>Loading...</h1></div>}>
        <div id="map" className={admin === adminPassword ? 'd-block position-relative h-100' : 'd-none'}  />
    </Suspense>

    

    </div>
  );
};

export default MapComponent;