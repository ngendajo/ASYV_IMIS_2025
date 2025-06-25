import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './pages/Layout';
import './App.css';
import Missing from './pages/Missing';
import RequireAuth from './pages/RequireAuth';
import useRefreshToken from './hooks/useRefreshToken';
import useAuth from './hooks/useAuth';
import Error from './pages/Error';
//import AuthCheck from './context/AuthCheck';
import Unauthorized from './pages/Unauthorized';

import Home from './pages/home/Home';
import NewsEvents from './pages/home/NewsEvents';
import AlumniStories from './pages/home/AlumniStories';
import StoryDetail from './pages/home/AlumniStoriesDetail.jsx';
import Container from './pages/Container';

import Dashboard from './pages/dashboard/Dashboard';
import PersonalProfile from './pages/profile/PersonalProfile';

import AddData from './pages/AddData';

import AlumniDirectory from './pages/directory/AlumniDirectory';
import CareerOpportunity from './pages/career/CareerOpportunity';
import CareerOpportunityStaff from "./pages/career/CareerOpportunityStaff";

import FurtherEducation from './pages/education/FurtherEducation';
import FurtherEducationStaff from './pages/education/FurtherEducationStaff';
// support and giving
import DonationOptions from './pages/support/DonationOptions.jsx';
import MentoringPrograms from './pages/support/MentoringPrograms.jsx';
// social and networking
import Events from './pages/social/Events';
import EventsDetail from './pages/social/EventsDetail';
import EventsCalendar from './pages/social/EventsCalendar';
import EventsGallery from './pages/social/EventsGallery';
import DiscussionForums from './pages/social/DiscussionForums';
// contact CRC staff
import Inquiry from './pages/contact/Inquiry.jsx';
import AlumniStoryPosts from './pages/contact/AlumniStoryPosts.jsx';
import AlumniJobPosts from './pages/contact/AlumniJobPosts.jsx';

import PersonalProfileStaff from './pages/profile/PersonalProfileStaff';
// import AddEventForm from './pages/social/AddEventForm.jsx';

import AddEventForm from './pages/social/AddEventForm.jsx';

import NewsForm from './pages/contact/AddNewsForm.jsx';
import ResumeBuilderPage from './pages/profile/ResumeBuilderPage';
import AddGrade from './pages/contact/AddGradeForm.jsx';
import Addcombination from './pages/contact/AddCombination.jsx';
import AddEp from './pages/contact/AddEps.jsx';
import AddAlumni from './pages/contact/AddAlumni.jsx';
import AddASYVInfoForAlumni from './pages/contact/AddASYVInfoForAlumni.jsx';
import AlumniBusness from './pages/contact/AlumniBusness.jsx';

function App() {
  const refresh = useRefreshToken();
  const {auth} = useAuth();

  useEffect(()=> {
    let fourMinutes = 1000 * 60 * 4

    let interval =  setInterval(()=> {
        
            if(auth?.accessToken){
              refresh()
            }
    }, fourMinutes)
    return ()=> clearInterval(interval)
//
}, [refresh,auth])
  return (
          <Routes>
            <Route path='/' element={<Layout />}>
              {/* public routes*/}
                <Route path='/home' element={<Home />}/>
                <Route path='/news_and_events' element={<NewsEvents />}/>
                <Route path='/alumni_stories' element={<AlumniStories />}/>
                <Route path='error' element={<Error />}/>
                <Route path='unauthorized' element={<Unauthorized />}/>
                <Route path='/stories-detail' element={<StoryDetail />}/>

                {/* we want to protect these routes*/}
                <Route element={<RequireAuth />}>
                  <Route path='/' element={<Container />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/personal_profile" element={<PersonalProfile />} />
                    <Route path="/add_data" element={<AddData />} />
                    <Route path="/alumni_directory" element={<AlumniDirectory />} />
                    <Route path="/career_opportunity" element={<CareerOpportunity />} />

                    <Route path="/career_opportunity_staff" element={<CareerOpportunityStaff />}/>
                    <Route path="/add_data" element={<AddData />} />

                    <Route path="/further_education" element={<FurtherEducation />} />
                    <Route path="/further_education_staff" element={<FurtherEducationStaff />} />
                    <Route path="/donation_options" element={<DonationOptions />} />
                    <Route path="/mentoring_programs" element={<MentoringPrograms />} />
                    <Route path="/events" element={<Events />} />
                    <Route path="/events-detail" element={<EventsDetail />} />
                    <Route path="/events-calendar" element={<EventsCalendar />} />
                    <Route path="/events-gallery" element={<EventsGallery />} />
                    <Route path="/discussion_forums" element={<DiscussionForums />} />
                    <Route path="/frequent_inquiries" element={<Inquiry />} />
                    <Route path="/alumni_story_posts" element={<AlumniStoryPosts />} />
                    <Route path='/alumni_business_posts' element={<AlumniBusness/>} />
                    <Route path="/alumni_job_posts" element={<AlumniJobPosts />} />
                    <Route path="/personal_profile_staff" element={<PersonalProfileStaff />} />
                   <Route path="/add-event" element={<AddEventForm />} /> 
          
                    <Route path="news_posts" element={<NewsForm />} />
                    <Route path="/personal_profile-resume" element={<ResumeBuilderPage />} />
                    <Route path="/add_grade" element={<AddGrade />} />
                    <Route path="/add_combination" element={<Addcombination />} />
                    <Route path="/add_eps" element={<AddEp />} />
                    <Route path="/add_alumni" element={<AddAlumni />} />
                    <Route path="/add-event" element={<AddEventForm />} />


                    
                    <Route path='add-alumni/info/:id' element={<AddASYVInfoForAlumni />}>
                        
                        {/* <Route path='addemployment' element={<AddEmployment />}/>
                        <Route path='study' element={<AddStudie />}/>
                        <Route path='story' element={<AddStory />}/>
                      </Route>
                      <Route path='add-alumni/:id' element={<EditAlumini />}/>

                    <Route element={<AuthCheck allowedRoles={["superuser","crc"]} />}>
                      <Route path='delete-alumni/:id' element={<DeleteAlumni />}/>
                      <Route path='delete-comb/:id' element={<Deletecombination/>}/> */}
                    </Route> 
                  </Route>
                </Route>

                {/* catch all */}
                <Route path='*' element={<Missing />} />
            </Route>
          </Routes>
  );
}

export default App;