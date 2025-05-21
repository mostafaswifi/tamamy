'use client'
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useState, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import handleExcelDownload from '../../lib/apiToExcel';

import userLogIn from "../../lib/userLogIn";


const userLogInDataExcel = process.env.NEXT_PUBLIC_API_URL + '/attendance';
const employeeLogInDataExcel = process.env.NEXT_PUBLIC_API_URL + '/employees';


const MapComponent = () => {
  const adminPassword = process.env.NEXT_PUBLIC_SUPER_ADMIN_PASSWORD;
  const [admin, setAdmin] = useState('');
  const [user, setUser] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const mapRef = useRef(null);

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch user data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await userLogIn();
        setUser(userData);
        
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchData();

  }, []);


  // Initialize map
  useEffect(() => {
    if (!isClient || !user.length) return;

    const map = new maplibregl.Map({
      container: 'map',
      style: 'https://api.maptiler.com/maps/outdoor-v2/style.json?key=HGPSwzDQY26yZCdA2ptF',
      center: [31.738187639095166, 30.29199231869582],
      zoom: 9
    });

    mapRef.current = map;

    // Add markers with popups
    user.forEach(mark => {
      if (!mark.cordx || !mark.cordy) return;
const myTime = new Date(mark.updatedAt);
const cairoTime = myTime.toLocaleString('en-EG', {
  timeZone: 'Africa/Cairo',
  hour12: true,  // Use 12-hour format
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});
const cairoTime12hr = cairoTime.replace('AM', 'صباحا').replace('PM', 'مساءا');

      const marker = new maplibregl.Marker()
        .setLngLat([mark.cordx, mark.cordy])
        .setPopup(
          new maplibregl.Popup()
            .setHTML(`
              <b>${mark.employee?.employeeName || 'Unknown'}</b>
              <div class='text-danger'>${mark.updatedAt?.substring(-1, 10) || 'No date'}</div>
              <div class='text-success'>${mark.updatedAt?.slice(-13) || 'No time'}</div>
              <div class='text-success'>${cairoTime12hr || 'No time'}</div>
            `)
            .trackPointer(true)
        )
        .addTo(map);

      marker.togglePopup();
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isClient, user]);

  if (!isClient) {
    return (
      <div className='d-flex justify-content-center align-items-center' style={{ height: '100vh' }}>
        <h1>جاري تحميل الخريطة !!!</h1>
      </div>
    );
  }

  const getSingleUser = async (e) => {
    e.preventDefault();
    const id = Number(e.target.value);
    const myUser = user.find(user => user.id === id);
    if (myUser) {
      mapRef.current.flyTo({
        center: [myUser.cordx, myUser.cordy],
        zoom: 15,
        essential: true
      });
    } else {
      const users = await userLogIn();
      setUser(users);
    }
  }

  return (
    <div className='container d-flex flex-column' style={{ height: '100vh' }}>
      <input
        type="password"
        className={admin !== adminPassword ? 'form-control my-3' : 'd-none'}
        placeholder='ادخل كلمة مرور المسؤول'
        onChange={(e) => setAdmin(e.target.value)}
        value={admin}
      />

<div className='d-flex justify-content-center align-items-center'>
 
        <input
        type="search"
        className={admin === adminPassword ? 'd-block form-control my-5' : 'd-none'}
        style={{ direction: 'rtl'}}
        placeholder='ابحث عن موظف'
        onChange={(e) => {
          const searchValue = e.target.value.toLowerCase();
          const filteredUsers = user.filter(user => user.employee?.employeeName.toLowerCase().includes(searchValue));
          !filteredUsers.length ? setUser(user) : setUser(filteredUsers);
        }}
      />
      
</div>

      <div className='row h-100'>
        {admin === adminPassword && (
          <div className='d-flex align-items-start position-relative  col-3' style={{maxHeight: 'fit-content!important'}}>
             <button
        className={admin === adminPassword ? 'btn btn-primary  ms-2 text-nowrap' : 'd-none'}
        onClick={ async () => {
          const userData = await userLogIn();
          setUser(userData);
        }}
      >  عرض الكل </button>
            <select className='form-select' onChange={(e) => getSingleUser(e)}>
              <option value="">اختر موظف</option>
              {user.map((user) => (
                <option key={user.id} value={user.id}>{user.employee?.employeeName}</option>
              ))}
            </select>
       
          </div>
        )}
        
        <div
          id="map"
          className={admin === adminPassword ? 'd-block position-relative h-75 col-9 overflow-hidden' : 'd-none'}
        />
      <div className='d-flex justify-content-center align-items-center'>
        <button
          className={admin === adminPassword ? 'btn btn-danger  ms-2 text-nowrap' : 'd-none'}
          onClick={ async () => {
handleExcelDownload(userLogInDataExcel, 'userLogInData.xlsx');          
          }}
        >   تصدير ملف تسجيل الحضور </button>

         <button
          className={admin === adminPassword ? 'btn btn-success  ms-2 text-nowrap' : 'd-none'}
          onClick={ async () => {
handleExcelDownload(employeeLogInDataExcel, 'employeeLogInData.xlsx');          
          }}
        >   تصدير ملف تسجيل موظف </button>
        
        </div>
      </div>
    </div>
  );
};

export default MapComponent;