"use client"
import Loading from "@/components/Loading"
import { useAppData } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import React from 'react';

const WhatApps = () => {
  const {loading,isAuth} = useAppData();

  const router = useRouter();

  useEffect(() =>{
    if(!isAuth && !loading){
        router.push("/login");
    }
  },[isAuth, router, loading]);

  if(loading){
    return <Loading/>;
  }
  return <div>WhatApps</div>;
}

export default WhatApps