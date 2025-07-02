import useAuth from "../hooks/useAuth";
//import { jwtDecode } from 'jwt-decode';
import TeacherDashBoard from './TeacherDashBoard';
import LibrarianDashBoard from './LibrarianDashBoard';
import AdminDashBoard from './AdminDashBoard';

export default function Dashboard() {
  const { auth } = useAuth();
  const user= auth.user;
  
  
  return (
    <div>
        {user.is_student ?
       <h2>Hello Student</h2>
       :
       <span>
        {user.is_teacher ?
        //<TeacherDashBoard/>
        <p>Hello Teacher</p>
        :
          <span>
            {user.is_librarian ?
        <LibrarianDashBoard/>:
          <span>
            {user.is_crc ?
        <LibrarianDashBoard/>:
          <span>
            <span>
            {user.is_superuser ?
        <AdminDashBoard/>:
          <span>
            <h2>Hello Visitor</h2>
          </span>
        }
          </span>
          </span>
        }
          </span>
        }
          </span>
        }
       </span>
       }
    </div>
  )
}
