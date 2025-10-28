'use client'
import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useState, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import axios from 'axios';
import handleExcelDownload from '../../lib/apiToExcel';
import userLogIn from "../../lib/userLogIn";
import Swal from 'sweetalert2';

const userLogInDataExcel = process.env.NEXT_PUBLIC_API_URL + '/attendance';
const employeeLogInDataExcel = process.env.NEXT_PUBLIC_API_URL + '/employees';

const deleteAllAttendanceRecords = async () => {
  const URL_BASE = process.env.NEXT_PUBLIC_API_URL;
  try {
    await axios.delete(`${URL_BASE}/attendance`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer your_token",
      },
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
  }
  Swal.fire({
    icon: 'success',
    title: 'تم حذف جميع سجلات الحضور بنجاح',
    showConfirmButton: false,
    timer: 1500,
  })
  setTimeout(() => {
    window.location.reload();
  }, 2000);
};

const MapComponent = () => {
  const adminPassword = process.env.NEXT_PUBLIC_SUPER_ADMIN_PASSWORD;
  const [admin, setAdmin] = useState('');
  const [user, setUser] = useState([]);
  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const cairoTime12hr = cairoTime.replace('AM', 'صباحاً').replace('PM', 'مساءً');

      const marker = new maplibregl.Marker()
        .setLngLat([mark.cordx, mark.cordy])
        .setPopup(
          new maplibregl.Popup()
            .setHTML(`
              <div class="p-2">
                <h6 class="fw-bold text-primary mb-2">${mark.employee?.employeeName || 'غير معروف'}</h6>
                <div class="text-muted small mb-1">${mark.updatedAt?.substring(0, 10) || 'لا يوجد تاريخ'}</div>
                <div class="text-success small fw-semibold">${cairoTime12hr || 'لا يوجد وقت'}</div>
              </div>
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

  const getSingleUser = async (e) => {
    const id = Number(e.target.value);
    const myUser = user.find(user => user.id === id);
    if (myUser && mapRef.current) {
      mapRef.current.flyTo({
        center: [myUser.cordx, myUser.cordy],
        zoom: 15,
        essential: true
      });
    }
  }

  const handleSearch = async (e) => {
    const value = e.target.value.toLowerCase();
    setSearchQuery(value);
    
    if (value === '') {
      const userData = await userLogIn();
      setUser(userData);
    } else {
      const filteredUsers = user.filter(user => 
        user.employee?.employeeName?.toLowerCase().includes(value)
      );
      setUser(filteredUsers);
    }
  }

  const refreshAllData = async () => {
    const userData = await userLogIn();
    setUser(userData);
    setSearchQuery('');
  }

  if (!isClient) {
    return (
      <div className='d-flex justify-content-center align-items-center min-vh-100 bg-light'>
        <div className='text-center'>
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">جاري التحميل...</span>
          </div>
          <h4 className='text-dark'>جاري تحميل الخريطة</h4>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-light min-vh-100' dir='rtl'>
      {/* Header */}
      <nav className="navbar navbar-light bg-white shadow-sm border-bottom">
        <div className="container">
          <div className="d-flex align-items-center">
            <div className="bg-primary rounded-2 d-flex align-items-center justify-content-center me-3" 
                 style={{ width: '45px', height: '45px' }}>
              <span className="text-white fw-bold fs-5">خ</span>
            </div>
            <div>
              <h1 className="navbar-brand h5 mb-0 fw-bold text-dark">نظام تتبع الموظفين</h1>
              <p className="text-muted small mb-0">خريطة تواجد الموظفين في الوقت الفعلي</p>
            </div>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        {/* Admin Authentication */}
        <div className="row justify-content-center mb-4">
          <div className="col-lg-6">
            <div className={admin !== adminPassword ? 'card shadow-sm border-0' : 'd-none'}>
              <div className="card-body">
                <h5 className="card-title text-primary fw-bold mb-3">الدخول كمسؤول</h5>
                <input
                  type="password"
                  className="form-control form-control-lg"
                  placeholder='أدخل كلمة مرور المسؤول'
                  onChange={(e) => setAdmin(e.target.value)}
                  value={admin}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Controls */}
        {admin === adminPassword && (
          <div className="card shadow-lg border-0 mb-4">
            <div className="card-body">
              <div className="row g-3 align-items-end">
                <div className="col-md-4">
                  <label className="form-label fw-semibold text-dark">بحث عن موظف</label>
                  <input
                    type="search"
                    className="form-control"
                    placeholder='اكتب اسم الموظف للبحث...'
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
                
                <div className="col-md-4">
                  <label className="form-label fw-semibold text-dark">اختر موظف من القائمة</label>
                  <select className='form-select' onChange={getSingleUser}>
                    <option value="">اختر موظف من القائمة</option>
                    {user.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.employee?.employeeName || 'غير معروف'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-4">
                  <button
                    className="btn btn-outline-primary w-100"
                    onClick={refreshAllData}
                  >
                    عرض جميع الموظفين
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map Container */}
        <div className="card shadow-lg border-0 mb-4">
          <div className="card-body p-0">
            <div
              id="map"
              className={admin === adminPassword ? 'd-block' : 'd-none'}
              style={{ height: '600px', width: '100%' }}
            />
            {admin !== adminPassword && (
              <div className="text-center py-5">
                <div className="text-muted mb-3" style={{ fontSize: '3rem' }}>
                  🗺️
                </div>
                <h5 className="text-dark">يجب تسجيل الدخول كمسؤول لعرض الخريطة</h5>
                <p className="text-muted">أدخل كلمة مرور المسؤول في الحقل أعلاه</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {admin === adminPassword && user.length > 0 && (
          <div className="card shadow-lg border-0">
            <div className="card-body">
              <h5 className="card-title text-primary fw-bold mb-4">إدارة البيانات</h5>
              <div className="row g-3">
                <div className="col-md-3">
                  <button
                    className="btn btn-primary w-100 fw-semibold"
                    onClick={() => handleExcelDownload(userLogInDataExcel, 'userLogInData.xlsx')}
                  >
                    <i className="bi bi-download me-2"></i>
                    تصدير سجلات الحضور
                  </button>
                </div>
                
                <div className="col-md-3">
                  <button
                    className="btn btn-success w-100 fw-semibold"
                    onClick={() => handleExcelDownload(employeeLogInDataExcel, 'employeeLogInData.xlsx')}
                  >
                    <i className="bi bi-download me-2"></i>
                    تصدير بيانات الموظفين
                  </button>
                </div>
                
                <div className="col-md-3">
                  <button 
                    className="btn btn-danger w-100 fw-semibold"
                    onClick={deleteAllAttendanceRecords}
                  >
                    <i className="bi bi-trash me-2"></i>
                    حذف جميع السجلات
                  </button>
                </div>

                <div className="col-md-3">
                  <div className="bg-light rounded-3 p-3 text-center border">
                    <div className="h5 fw-bold text-primary mb-1">{user.length}</div>
                    <div className="text-muted small">عدد السجلات</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Data Message */}
        {admin === adminPassword && user.length === 0 && (
          <div className="card shadow-lg border-0">
            <div className="card-body text-center py-5">
              <div className="text-muted mb-3" style={{ fontSize: '4rem' }}>
                📍
              </div>
              <h5 className="text-dark fw-bold mb-3">لا توجد بيانات لعرضها</h5>
              <p className="text-muted">لم يتم العثور على سجلات حضور للموظفين</p>
              <button 
                className="btn btn-primary"
                onClick={refreshAllData}
              >
                تحديث البيانات
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapComponent;
