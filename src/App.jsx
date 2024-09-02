import { Navigate, Route,Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import {Toaster} from "react-hot-toast"
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";
import Bookmark from "./pages/bookmark/Bookmark";

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
	console.log(URL)
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
      	{authUser && <Sidebar/>}   
			<Routes>
				<Route path='/' element={authUser ? <HomePage /> : <Navigate to="/login"/>} />
				<Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/"/>} />
				<Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to="/"/>} />
				<Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to="/login"/>} />
				<Route path='/bookmark' element={authUser ? <Bookmark /> : <Navigate to="/login"/>} />
				<Route path='/profile/:username' element={authUser ? <ProfilePage /> : <Navigate to="/"/>} />
				<Route path='*' element={<Navigate to="/"/>} />
			</Routes>
		{authUser && <RightPanel/>}
		<Toaster/>
		</div>
	);
}

export default App