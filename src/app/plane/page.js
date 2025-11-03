'use client'
import React, { useEffect, useState } from "react";
import Swal from 'sweetalert2'
import addPlace from "@/lib/addPlace";

const AddSchool = () => {
  const admin = '123456';
  const [flag, setFlag] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [polygonPoints, setPolygonPoints] = useState([]);

  // State for all points
  const [points, setPoints] = useState([
    { x: "", y: "" },
    { x: "", y: "" },
    { x: "", y: "" },
    { x: "", y: "" },
    { x: "", y: "" }
  ]);

  // State for center point and radius
  const [centerPoint, setCenterPoint] = useState({ x: "", y: "" });
  const [radius, setRadius] = useState(0.001); // حوالي 100 متر

  useEffect(() => {
    setPolygonPoints(
      points.filter(point => point.x && point.y).map(point => ({
        cordx: point.x,
        cordy: point.y,
      }))
    );
  }, [points]);

  const handlePointChange = (index, field, value) => {
    const newPoints = [...points];
    newPoints[index][field] = value;
    setPoints(newPoints);
  };

  // دالة لتوليد 5 نقاط حول نقطة مركزية مع إغلاق المضلع
  const generatePointsAroundCenter = () => {
    if (!centerPoint.x || !centerPoint.y) {
      Swal.fire({
        title: 'بيانات ناقصة!',
        text: 'يرجى إدخال النقطة المركزية أولاً',
        icon: 'warning',
        confirmButtonText: 'حسناً'
      });
      return;
    }

    const centerLat = parseFloat(centerPoint.x);
    const centerLng = parseFloat(centerPoint.y);
    const radiusKm = radius;
    
    const generatedPoints = [];
    const radiusInDegrees = radiusKm / 111.32; // 111.32 كم لكل درجة

    // توليد 4 نقاط فقط + النقطة الخامسة ستكون مثل الأولى
    for (let i = 0; i < 4; i++) {
      const angle = (i * 2 * Math.PI) / 4; // 4 نقاط للمستطيل
      
      // حساب الإحداثيات بدقة 7 خانات عشرية
      const lat = centerLat + (radiusInDegrees * Math.sin(angle));
      const lng = centerLng + (radiusInDegrees * Math.cos(angle));
      
      generatedPoints.push({
        x: lat.toFixed(7),
        y: lng.toFixed(7)
      });
    }

    // النقطة الخامسة = النقطة الأولى لإغلاق المضلع
    generatedPoints.push({
      x: generatedPoints[0].x,
      y: generatedPoints[0].y
    });

    setPoints(generatedPoints);
    
    Swal.fire({
      title: 'تم التوليد!',
      text: 'تم توليد 5 نقاط مضلع مغلق بنجاح',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  };

  // دالة بديلة لتوليد مستطيل أكثر دقة
  const generateRectanglePoints = () => {
    if (!centerPoint.x || !centerPoint.y) {
      Swal.fire({
        title: 'بيانات ناقصة!',
        text: 'يرجى إدخال النقطة المركزية أولاً',
        icon: 'warning',
        confirmButtonText: 'حسناً'
      });
      return;
    }

    const centerLat = parseFloat(centerPoint.x);
    const centerLng = parseFloat(centerPoint.y);
    const radiusKm = radius;
    
    const radiusInDegrees = radiusKm / 111.32;

    // نقاط المستطيل (شمال غرب، شمال شرق، جنوب شرق، جنوب غرب، والعودة لشمال غرب)
    const rectanglePoints = [
      // النقطة 1: شمال غرب
      {
        x: (centerLat + radiusInDegrees).toFixed(7),
        y: (centerLng - radiusInDegrees).toFixed(7)
      },
      // النقطة 2: شمال شرق
      {
        x: (centerLat + radiusInDegrees).toFixed(7),
        y: (centerLng + radiusInDegrees).toFixed(7)
      },
      // النقطة 3: جنوب شرق
      {
        x: (centerLat - radiusInDegrees).toFixed(7),
        y: (centerLng + radiusInDegrees).toFixed(7)
      },
      // النقطة 4: جنوب غرب
      {
        x: (centerLat - radiusInDegrees).toFixed(7),
        y: (centerLng - radiusInDegrees).toFixed(7)
      },
      // النقطة 5: شمال غرب (إغلاق المضلع - نفس النقطة الأولى)
      {
        x: (centerLat + radiusInDegrees).toFixed(7),
        y: (centerLng - radiusInDegrees).toFixed(7)
      }
    ];

    setPoints(rectanglePoints);
    
    Swal.fire({
      title: 'تم التوليد!',
      text: 'تم توليد مستطيل مغلق بنجاح',
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
  };

  // دالة لنسخ الإحداثيات من خرائط جوجل
  const pasteFromGoogleMaps = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const match = clipboardText.match(/(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
      
      if (match) {
        const lat = parseFloat(match[1]).toFixed(7);
        const lng = parseFloat(match[2]).toFixed(7);
        
        setCenterPoint({ x: lat, y: lng });
        
        Swal.fire({
          title: 'تم النسخ!',
          text: 'تم استخراج الإحداثيات من الحافظة',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        Swal.fire({
          title: 'خطأ!',
          text: 'لم يتم العثور على إحداثيات صحيحة في الحافظة',
          icon: 'error',
          confirmButtonText: 'حسناً'
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'خطأ!',
        text: 'تعذر الوصول إلى الحافظة. يرجى نسخ الإحداثيات أولاً.',
        icon: 'error',
        confirmButtonText: 'حسناً'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // التحقق من الحقول المطلوبة
    const requiredFields = [schoolName, ...points.flatMap(point => [point.x, point.y])];
    const isValid = requiredFields.every(field => field && field.trim() !== "");
    
    if (!isValid) {
      Swal.fire({
        title: 'خطأ!',
        text: 'يرجى ملء جميع الحقول بشكل صحيح',
        icon: 'error',
        confirmButtonText: 'حاول مرة أخرى'
      });
      return;
    }

    // التحقق من صحة تنسيق الإحداثيات
    const coordinatesValid = points.every(point => {
      const lat = parseFloat(point.x);
      const lng = parseFloat(point.y);
      return !isNaN(lat) && !isNaN(lng) && 
             lat >= -90 && lat <= 90 && 
             lng >= -180 && lng <= 180;
    });

    if (!coordinatesValid) {
      Swal.fire({
        title: 'إحداثيات غير صالحة!',
        text: 'يرجى التأكد من صحة الإحداثيات المدخلة',
        icon: 'error',
        confirmButtonText: 'حسناً'
      });
      return;
    }

    // التحقق من أن النقطة الأولى والأخيرة متطابقتان (مضلع مغلق)
    const isPolygonClosed = points[0].x === points[4].x && points[0].y === points[4].y;
    
    if (!isPolygonClosed) {
      Swal.fire({
        title: 'المضلع غير مغلق!',
        html: 'النقطة الأخيرة يجب أن تكون مثل النقطة الأولى لإغلاق المضلع.<br>هل تريد إصلاح ذلك تلقائياً؟',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'نعم، أصلحه',
        cancelButtonText: 'لا، سأصلحه يدوياً'
      }).then((result) => {
        if (result.isConfirmed) {
          // إصلاح تلقائي: جعل النقطة الأخيرة مثل الأولى
          const fixedPoints = [...points];
          fixedPoints[4] = { x: points[0].x, y: points[0].y };
          setPoints(fixedPoints);
        }
      });
      return;
    }

    try {
      await addPlace(schoolName, polygonPoints);
      
      // إعادة تعيين النموذج
      resetForm();

      Swal.fire({
        title: 'تمت الإضافة!',
        text: 'تم إضافة المدرسة بنجاح',
        icon: 'success',
        confirmButtonText: 'تم'
      });
    } catch (error) {
      console.error('Error adding school:', error);
      Swal.fire({
        title: 'خطأ!',
        text: 'حدث خطأ أثناء إضافة المدرسة',
        icon: 'error',
        confirmButtonText: 'حاول مرة أخرى'
      });
    }
  };

  const resetForm = () => {
    setSchoolName("");
    setPlaceId("");
    setPoints([
      { x: "", y: "" },
      { x: "", y: "" },
      { x: "", y: "" },
      { x: "", y: "" },
      { x: "", y: "" }
    ]);
    setCenterPoint({ x: "", y: "" });
    setRadius(0.001);
    setAdminPassword("");
    setFlag(false);
  };

  // دالة للتحقق مما إذا كان المضلع مغلقاً
  const isPolygonClosed = points[0].x && points[0].y && points[4].x && points[4].y && 
                         points[0].x === points[4].x && points[0].y === points[4].y;

  return (
    <div className="bg-light min-vh-100" dir="rtl">
      {/* Header */}
      <nav className="navbar navbar-light bg-white shadow-sm border-bottom">
        <div className="container">
          <div className="d-flex align-items-center">
            <div className="bg-primary rounded-2 d-flex align-items-center justify-content-center me-3" 
                 style={{ width: '45px', height: '45px' }}>
              <span className="text-white fw-bold fs-5">م</span>
            </div>
            <div>
              <h1 className="navbar-brand h5 mb-0 fw-bold text-dark">نظام إدارة المدارس</h1>
              <p className="text-muted small mb-0">إضافة مدارس جديدة وتحديد حدودها الجغرافية</p>
            </div>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        {/* Admin Authentication */}
        {!flag && (
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="card shadow-lg border-0">
                <div className="card-body p-4">
                  <div className="text-center mb-4">
                    <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                         style={{ width: '70px', height: '70px' }}>
                      <span className="text-white fw-bold fs-3">ق</span>
                    </div>
                    <h3 className="card-title text-primary fw-bold mb-2">الدخول كمسؤول</h3>
                    <p className="text-muted">أدخل كلمة مرور المسؤول للمتابعة</p>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark">كلمة المرور</label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      placeholder="أدخل كلمة مرور المسؤول"
                      value={adminPassword}
                      onChange={(e) => {
                        setAdminPassword(e.target.value);
                        if (e.target.value === admin) setFlag(true);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add School Form */}
        {flag && (
          <div className="card shadow-lg border-0">
            <div className="card-header bg-white border-0 py-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="card-title h4 fw-bold text-primary mb-1">إضافة مدرسة جديدة</h2>
                  <p className="text-muted mb-0">أدخل بيانات المدرسة والإحداثيات الجغرافية</p>
                </div>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={resetForm}
                >
                  خروج
                </button>
              </div>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* School Name */}
                <div className="row mb-4">
                  <div className="col-lg-6">
                    <div className="mb-3">
                      <label htmlFor="schoolName" className="form-label fw-semibold text-dark">
                        اسم المدرسة <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="schoolName"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="أدخل اسم المدرسة"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Center Point Generator */}
                <div className="card border-0 bg-light mb-4">
                  <div className="card-body">
                    <h5 className="fw-bold text-primary mb-3">مولد النقاط التلقائي</h5>
                    <div className="row g-3">
                      <div className="col-md-4">
                        <label className="form-label fw-semibold text-dark">خط العرض (Latitude)</label>
                        <input
                          type="text"
                          className="form-control"
                          value={centerPoint.x}
                          onChange={(e) => setCenterPoint({...centerPoint, x: e.target.value})}
                          placeholder="24.7135517"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold text-dark">خط الطول (Longitude)</label>
                        <input
                          type="text"
                          className="form-control"
                          value={centerPoint.y}
                          onChange={(e) => setCenterPoint({...centerPoint, y: e.target.value})}
                          placeholder="46.6752957"
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold text-dark">نصف القطر (كم)</label>
                        <input
                          type="number"
                          step="0.001"
                          min="0.001"
                          max="1"
                          className="form-control"
                          value={radius}
                          onChange={(e) => setRadius(parseFloat(e.target.value))}
                          placeholder="0.001"
                        />
                      </div>
                    </div>
                    <div className="row mt-3">
                      <div className="col-12">
                        <div className="d-flex gap-2 flex-wrap">
                          <button 
                            type="button" 
                            className="btn btn-success"
                            onClick={generateRectanglePoints}
                          >
                            توليد مستطيل مغلق
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-outline-success"
                            onClick={generatePointsAroundCenter}
                          >
                            توليد دائري مغلق
                          </button>
                          <button 
                            type="button" 
                            className="btn btn-outline-primary"
                            onClick={pasteFromGoogleMaps}
                          >
                            نسخ من خرائط جوجل
                          </button>
                          <small className="text-muted align-self-center">
                            نصف القطر الافتراضي: 0.001 كم (≈100 متر)
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coordinates Section */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-dark mb-0">الإحداثيات الجغرافية للمضلع</h5>
                    <div className="d-flex gap-2 align-items-center">
                      <span className="badge bg-primary fs-6">5 نقاط مطلوبة</span>
                      {isPolygonClosed && (
                        <span className="badge bg-success fs-6">المضلع مغلق</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="row g-3">
                    {points.map((point, index) => (
                      <div key={index} className="col-md-6 col-lg-4">
                        <div className={`card border-0 ${index === 4 ? 'border-success border-2' : 'bg-light'} hover-shadow`}>
                          <div className="card-body">
                            <h6 className="card-title fw-semibold text-primary mb-3">
                              النقطة {index + 1}
                              {index === 4 && (
                                <span className="badge bg-success ms-2">إغلاق المضلع</span>
                              )}
                            </h6>
                            <div className="row g-2">
                              <div className="col-6">
                                <label className="form-label small fw-semibold text-muted">خط العرض</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={point.x}
                                  onChange={(e) => handlePointChange(index, 'x', e.target.value)}
                                  placeholder="24.7135517"
                                  required
                                />
                              </div>
                              <div className="col-6">
                                <label className="form-label small fw-semibold text-muted">خط الطول</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={point.y}
                                  onChange={(e) => handlePointChange(index, 'y', e.target.value)}
                                  placeholder="46.6752957"
                                  required
                                />
                              </div>
                            </div>
                            {index === 4 && points[0].x && points[0].y && (
                              <div className="mt-2">
                                <small className={`text-${point.x === points[0].x && point.y === points[0].y ? 'success' : 'danger'}`}>
                                  {point.x === points[0].x && point.y === points[0].y 
                                    ? '✓ مطابقة للنقطة الأولى' 
                                    : '✗ يجب أن تطابق النقطة الأولى'}
                                </small>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="d-flex gap-3 flex-wrap">
                      <button 
                        type="submit" 
                        className="btn btn-primary btn-lg fw-bold px-5"
                        disabled={polygonPoints.length !== 5 || !isPolygonClosed}
                      >
                        إضافة المدرسة
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary btn-lg"
                        onClick={resetForm}
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Form Status */}
            <div className="card-footer bg-light border-0 py-3">
              <div className="row">
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="text-muted small">
                        الحقول marked with <span className="text-danger">*</span> إلزامية
                      </span>
                    </div>
                    <div className="text-end">
                      <span className={`badge ${polygonPoints.length === 5 ? 'bg-success' : 'bg-warning'} fs-6 me-2`}>
                        {polygonPoints.length}/5 نقاط محددة
                      </span>
                      <span className={`badge ${isPolygonClosed ? 'bg-success' : 'bg-danger'} fs-6`}>
                        {isPolygonClosed ? 'المضلع مغلق' : 'المضلع مفتوح'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {flag && (
          <div className="card border-0 bg-primary text-white mt-4">
            <div className="card-body">
              <h6 className="card-title fw-bold mb-3">تعليمات هامة:</h6>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">• <strong>النقطة الخامسة يجب أن تكون مطابقة تماماً للنقطة الأولى</strong> لإغلاق المضلع</li>
                <li className="mb-2">• استخدم -توليد مستطيل مغلق- للحصول على شكل مستطيل متوازي</li>
                <li className="mb-2">• استخدم -توليد دائري مغلق- للحصول على شكل دائري تقريبي</li>
                <li className="mb-2">• لنسخ من خرائط جوجل: انقر بزر الماوس الأيمن على الموقع → نسخ الإحداثيات</li>
                <li>• سيتم تعطيل زر الإضافة حتى يتم إغلاق المضلع بشكل صحيح</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddSchool;
