
'use client'
import { useEffect } from "react";
import Link from "next/link";
import { cairo } from '@next/font/google';
import {dynamic} from 'next/dynamic'



const NavBar = () => {
    useEffect(() => {
         import('../../../node_modules/bootstrap/js/dist/offcanvas')
    
    }, [])
  return (
    <nav className="navbar bg-body-tertiary sticky-top" dir="rtl">
    <div className="container-fluid">
      <div className="d-flex flex-column justify-content-center align-items-center navbar-brand" style={{fontSize: '1rem',fontFamily: 'cairo'}}>
        <b className="text-muted" >  مديرية التربية و التعليم بالشرقية</b>
        <b className="text-muted" >    إدارة العاشر من رمضان التعليمية </b>
      <b className="text-muted" >نظام تسجيل حضور السادة الموجهين</b>
       </div> 
      <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>
      <div className="offcanvas offcanvas-end m-0" tabIndex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasNavbarLabel"></h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body">
          <ul className="navbar-nav justify-content-end flex-grow-1 pe-3">
            <li className="nav-item">
              {/* <a className="nav-link active" aria-current="page" href="#">Home</a> */}
              <Link className="nav-link active" aria-current="page" href="/observermap">observer</Link>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Link</a>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Dropdown
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="#">Action</a></li>
                <li><a className="dropdown-item" href="#">Another action</a></li>
                <li>
                  <hr className="dropdown-divider" />
                </li>
                <li><a className="dropdown-item" href="#">Something else here</a></li>
              </ul>
            </li>
          </ul>
          <form className="d-flex mt-3" role="search">
            <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
            <button className="btn btn-outline-success" type="submit">Search</button>
          </form>
        </div>
      </div>
    </div>
  </nav>
  )
}

export default NavBar