import { Navigate, Route,Routes } from "react-router-dom";
import { lazy, Suspense } from "react";


const HomePage = lazy(()=>import("./pages/home/HomePage")) ;
const LoginPage = lazy(()=>import("./pages/auth/login/LoginPage")) ;
const SignUpPage = lazy(()=>import("./pages/auth/signup/SignUpPage")) ;
const Sidebar = lazy(()=>import("./components/common/Sidebar")) ;
const RightPanel = lazy(()=>import("./components/common/RightPanel")) ;
const NotificationPage = lazy(()=>import("./pages/notification/NotificationPage")) ;
const ProfilePage = lazy(()=>import("./pages/profile/ProfilePage")) ;
const Bookmark = lazy(()=>import("./pages/bookmark/Bookmark")) ;
const Search = lazy(()=>import("./pages/search/Search")) ;

import LoadingSpinner from "./components/common/LoadingSpinner";

import {Toaster} from "react-hot-toast"
import { useQuery } from "@tanstack/react-query";


function App() {

	const URL = import.meta.env.VITE_URL
	
	const {data:authUser,isLoading} = useQuery({
		// we use queryKey to give a unique name to our query and refer to it later
		queryKey:['authUser'],
		queryFn: async()=>{
			try {
				const res = await fetch(`${URL}/api/auth/me`,{credentials:"include"});
				const data = await res.json();
				if(data.error) return null
				if(!res.ok){
					throw new Error(data.error || "Something went wrong")
				}
				return data

			} catch (error) {
				throw new Error(error)
			}
		},
		// retry: false
	})

	if(isLoading) {
		return (
			<div className="h-screen flex justify-center items-center">
				<LoadingSpinner size="lg" />
			</div>
		)
	}

	


	return (
		<div className='flex max-w-6xl mx-auto'>
      {/* common component, bcoz it's not wrapped with Routes */}
      	{authUser &&  <Suspense fallback={<LoadingSpinner size="sm" />}><Sidebar/></Suspense>}   
			<Routes>
				<Route path='/' element={authUser ? <Suspense fallback={<LoadingSpinner size="sm" />}><HomePage /></Suspense> : <Navigate to="/login"/>} />
				<Route path='/search' element={authUser ?  <Suspense fallback={<LoadingSpinner size="sm" />}><Search /></Suspense>  : <Navigate to="/login"/>} />
				<Route path='/login' element={!authUser ?  <Suspense fallback={<LoadingSpinner size="sm" />}><LoginPage /></Suspense> : <Navigate to="/"/>} />
				<Route path='/signup' element={!authUser ? <Suspense fallback={<LoadingSpinner size="sm" />}><SignUpPage /></Suspense> : <Navigate to="/"/>} />
				<Route path='/notifications' element={authUser ?  <Suspense fallback={<LoadingSpinner size="sm" />}><NotificationPage /></Suspense> : <Navigate to="/login"/>} />
				<Route path='/bookmark' element={authUser ?  <Suspense fallback={<LoadingSpinner size="sm" />}><Bookmark /></Suspense> : <Navigate to="/login"/>} />
				<Route path='/profile/:username' element={authUser ?  <Suspense fallback={<LoadingSpinner size="sm" />}><ProfilePage /></Suspense> : <Navigate to="/"/>} />
				<Route path='*' element={<Navigate to="/"/>} />
			</Routes>
		{authUser && <Suspense fallback={<LoadingSpinner size="sm" />}><RightPanel/></Suspense>}
		<Toaster/>
		</div>
	);
}

export default App