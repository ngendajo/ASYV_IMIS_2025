import useAuth from '../../../../hooks/useAuth';
//import { Table } from '../Table';
import { BiEditAlt,BiExport } from "react-icons/bi";
import { RiDeleteBin5Line } from "react-icons/ri";
import { IoIosAdd } from "react-icons/io";
import { AiOutlineFileAdd } from "react-icons/ai";
import { ImProfile } from "react-icons/im";
import React, {useState, useEffect} from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Excel from 'exceljs';
import { saveAs } from 'file-saver';
//import { useNavigate } from 'react-router-dom';
import { PiPasswordFill } from "react-icons/pi";
import baseUrl from '../../../../api/baseUrl';
import baseUrlforImg from '../../../../api/baseUrlforImg';
import DynamicTable from "./dinamicTable/DynamicTable";

import { MdCancel } from "react-icons/md";

const columns = [
  { header: 'No', key: 'no' },
  { header: 'Email', key: 'email' },
  { header: 'First Name', key: 'first_name' },
  { header: 'Last Name', key: 'last_name' },
  { header: 'Phone number', key: 'phone1' },
  { header: 'Martal Status', key: 'marital_status' },
  { header: 'Gender', key: 'gender' },
  { header: 'Kids', key: 'kids' },
  { header: 'Father', key: 'father' },
  { header: 'Mother', key: 'mother' },
  { header: 'Place of Origin', key: 'place_of_birth' },
  { header: 'Current Residence', key: 'currresidence' },
  { header: 'Grade', key: 'grade_name' },
  { header: 'Family', key: 'family' },
  { header: 'Combination', key: 'combination_name' },
  { header: 'Enrishment Programs', key: 'eps' },
  { header: 'S4 Marks', key: 's4marks' },
  { header: 'S5 Marks', key: 's5marks' },
  { header: 'S6 Marks', key: 's6marks' },
  { header: 'National Exam Result', key: 'ne' },
  { header: 'Maximum Aggregate in NE', key: 'maxforne' },
  { header: 'Decision', key: 'decision' },
  { header: 'Life Status', key: 'life_status' }
];
const workSheetName = 'Alumni_Report';
const workBookName = 'Alumni_Report';

export default function ASYVInfo() {
    const [reports,setReports]=useState(false)
    const [data, setData] = useState([]); /*useState钩子声明了一个名为data的状态变量,用于存储获取到的校友信息数据. 对应的更新函数setData，初始值为一个空数组[] */
    const [datatodownload, setDatatodownload] = useState([]); 
    const {auth} = useAuth(); /* 使用 useAuth 钩子从上下文中获取了 auth 对象 */
  //const navigate=useNavigate();

  function epType(type){
    if(type==="A")
    {
      return "Arts Center";
    }
    if(type==="C")
    {
      return "Clubs";
    }
    if(type==="SC")
    {
      return "Science Center";
    }
    if(type==="S")
    {
      return "Sports";
    }
  }
  

  useEffect(() =>{ /* 用 useEffect 钩子定义了一个副作用函数。副作用函数是在组件渲染完成后执行的函数 */
    
    const getalumniusers = async () =>{
        try{
            const response = await axios.get(baseUrl+'/alumnilist/',{ /* 用 axios 库发送了一个异步 GET 请求*/
                headers: { /* 请求头 */
                    "Authorization": 'Bearer ' + String(auth.accessToken),
                    "Content-Type": 'multipart/form-data'
                },
                withCredentials:true
            });

            /*当请求成功后，通过遍历 response.data 中的每个元素，构建了一个 alumnilist 数组，其中每个元素包含了校友的相关信息*/
            var alumnilist=[]
            var i=1
            console.log(response.data)
            response.data.forEach(element => {
              alumnilist.push({
                id:i, 
                image:<img src={baseUrlforImg+element.image_url} alt="logo" className="user-image-icon" />,
                email:element.email,
                first_name:element.first_name,
                last_name:element.last_name,
                phone:element.phone1,
                grade:element.grade_name==null? <Link to={`/add-alumni/info/${element.id}`}><AiOutlineFileAdd className='icon'/></Link>:element.grade_name,
                family:element.family_name==null? <Link to={`/add-alumni/info/${element.id}`}><AiOutlineFileAdd className='icon'/></Link>:element.family_name,
                combination:element.combination_name==null? <Link to={`/add-alumni/info/${element.id}`}><AiOutlineFileAdd className='icon'/></Link>:element.combination_name,
                Action:<span> 
                  <Link to={`/alumniprofile/${element.id}`}><ImProfile className='icon'/></Link>
                  <Link to={`/add-alumni/${element.id}`}><BiEditAlt className='icon'/></Link>
                  {auth.user.is_superuser?
                    <Link to={`/delete-alumni/${element.id}`}>  <RiDeleteBin5Line className='icon'/></Link>:null  
                }
                      
                      <Link to={`/reset-alumn-password/${element.id}`}> <PiPasswordFill className='icon'/></Link>
                </span>
              })
              i+=1
            });
            setData(alumnilist); /* 使用 setData 更新了 data 的值为 alumnilist */
        }catch(err) {
            console.log(err);
        }
    }

    getalumniusers();

},[auth])

  useEffect(() =>{ /* 用 useEffect 钩子定义了一个副作用函数。副作用函数是在组件渲染完成后执行的函数 */
    function getEps(eps)
    {
      var epslist=" ";
    for(var i=0;i<eps.length;i++){
      if(i===eps.length-1){
        epslist+=eps[i].title+" from "+epType(eps[i].type)
      }else{
        epslist+=eps[i].title+" from "+epType(eps[i].type)+", "
      }
    }
    return epslist
    }
      const getusers = async () =>{
        try{
            const response = await axios.get(baseUrl+'/alumni/',{ /* 用 axios 库发送了一个异步 GET 请求*/
                headers: { /* 请求头 */
                    "Authorization": 'Bearer ' + String(auth.accessToken),
                    "Content-Type": 'multipart/form-data'
                },
                withCredentials:true
            });

            /*当请求成功后，通过遍历 response.data 中的每个元素，构建了一个 alumnilist 数组，其中每个元素包含了校友的相关信息*/
            
            var alumnilist2=[]
            var i=1
            //console.log(response.data)
            if(Array.isArray(response.data)){
            response.data.forEach(element => {
              alumnilist2.push({
               no:i,
               email:element.email,
                first_name:element.first_name,
                last_name:element.last_name,
                phone1:element.phone1, 
                marital_status:element.alumn===null?"Null":element.alumn.marital_status,
                gender:element.alumn===null?"Null":element.alumn.gender,
                kids:element.alumn===null?"Null":element.alumn.kids?"Yes":"No",
                father:element.alumn===null?"Null":element.alumn.father,
                mother:element.alumn===null?"Null":element.alumn.mother,
                place_of_birth:element.alumn===null?"Null":element.alumn.place_of_birth,
                currresidence:element.alumn===null?"Null":element.alumn.currresidence,
                grade_name:element.alumn===null?"Null":element.alumn.family.grade.grade_name,
                family:element.alumn===null?"Null":element.alumn.family.family_name,
                combination_name:element.alumn===null?"Null":element.alumn.combination.combination_name,
                eps:element.alumn===null?"Null":element.alumn.eps.length>0?getEps(element.alumn.eps):element.alumn.eps.length,
                s4marks:element.alumn===null?"Null":element.alumn.s4marks,
                s5marks:element.alumn===null?"Null":element.alumn.s5marks,
                s6marks:element.alumn===null?"Null":element.alumn.s6marks,
                ne:element.alumn===null?"Null":element.alumn.ne,
                maxforne:element.alumn===null?"Null":element.alumn.maxforne,
                decision:element.alumn===null?"Null":element.alumn.decision==="P"?"Pass":"Fail",
                life_status:element.alumn===null?"Null":element.alumn.life_status==="A"?"Alive":"Died"
              })
              i+=1
            })
          }
            setDatatodownload(alumnilist2);
            console.log(alumnilist2)
        }catch(err) {
            console.log(err);
            // navigate('/error');
        }
    }

    getusers();

},[auth])


const workbook = new Excel.Workbook();

  const saveExcel = async () => {
    try {
      const fileName = workBookName;

      // creating one worksheet in workbook
      const worksheet = workbook.addWorksheet(workSheetName);

      // add worksheet columns
      // each columns contains header and its mapping key from data
      worksheet.columns = columns;

      // updated the font for first row.
      worksheet.getRow(1).font = { bold: true };

      // loop through all of the columns and set the alignment with width.
      worksheet.columns.forEach(column => {
        column.width = column.header.length + 5;
        column.alignment = { horizontal: 'center' };
      });

      // loop through data and add each one to worksheet
      datatodownload.forEach(singleData => {
        worksheet.addRow(singleData);
      });

      // loop through all of the rows and set the outline style.
      worksheet.eachRow({ includeEmpty: false }, row => {
        // store each cell to currentCell
        const currentCell = row._cells;

        // loop through currentCell to apply border only for the non-empty cell of excel
        currentCell.forEach(singleCell => {
          // store the cell address i.e. A1, A2, A3, B1, B2, B3, ...
          const cellAddress = singleCell._address;

          // apply border
          worksheet.getCell(cellAddress).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });

      // write the content using writeBuffer
      const buf = await workbook.xlsx.writeBuffer();

      // download the processed file
      saveAs(new Blob([buf]), `${fileName}.xlsx`);
    } catch (error) {
      console.error('<<<ERRROR>>>', error);
      console.error('Something Went Wrong', error.message);
      // navigate('/error');
    } finally {
      // removing worksheet's instance to create new one
      workbook.removeWorksheet(workSheetName);
    }
  };
  function reportsDashbord(){
    setReports(!reports)
  }
  const [selectedOptions, setSelectedOptions] = useState(
    {
      first_name: false,
      last_name: false,
      phone1: false,
      email: false,
      grade_name: false,
      start_academic_year: false,
      end_academic_year: false,
      family_name: false,
      family_mother: false,
      family_mother_tel: false,
      combination_name: false,
      ep_title: false,
      ep_type: false,
      date_of_birth: false,
      gender: false,
      place_of_birth_district_or_country: false,
      place_of_birth_sector_or_city: false,
      life_status: false,
      marital_status: false,
      currresidence_district_or_country: false,
      currresidence_sector_or_city: false,
      kids: false,
      s4marks: false,
      s5marks: false,
      s6marks: false,
      ne: false,
      maxforne: false,
      decision: false,
      emp_title: false,
      emp_status: false,
      career: false,
      company: false,
      st_level: false,
      degree: false,
      university: false,
      country: false,
      scholarship: false,
      scholarship_details: false,
      st_status: false
    }
  );

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    if (name === 'all_items') {
      // If "All" checkbox is selected, update all other checkboxes accordingly
      const updatedOptions = {};
      for (const key in selectedOptions) {
        updatedOptions[key] = checked;
      }
      setSelectedOptions(updatedOptions);
    } else {
      setSelectedOptions({ ...selectedOptions, [name]: checked });
    }
  };

  const handleSubmitExecel = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post(
        `${baseUrl}/generate-report/`,
        selectedOptions,
        {
          headers: {
            Authorization: 'Bearer ' + String(auth.accessToken),
            'Content-Type': 'application/json',
          },
          responseType: 'blob', // Indicate response type as blob
        }
      );
  
      // Create a blob URL for the Excel file
      const url = window.URL.createObjectURL(new Blob([response.data]));
  
      // Create a link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'alumni_data.xlsx');
      document.body.appendChild(link);
  
      // Trigger the click event to start the download
      link.click();
  
      // Clean up the URL object after the download is initiated
      window.URL.revokeObjectURL(url);
      reportsDashbord()
    } catch (error) {
      console.error('Error downloading Excel file:', error);
    }
  };

  //console.log(selectedOptions)
  return (
    <div className='alumni-list-body'>
            <div>
              <div className='staff-header-right alumni-header-right'>
                <div onClick={saveExcel} className='export-staff'>
                  <span>Export xlsx</span><BiExport/>
                </div>
                <div className='add-staff'>
                  <Link to="/add-alumni" className='link'>Add Alumni</Link><IoIosAdd className='addicon'/>
                </div>
                <div className='add-staff'>
                  <span onClick={reportsDashbord} className='links'>Reports</span>
                </div>
              </div>
            </div>
            <DynamicTable mockdata={data} />
            {
              reports?
              <div className="popupreport">
                <div className="popup-innerreport">
                    <MdCancel className='cancellogin' onClick={reportsDashbord} />
                    
                   <center> <h3>Select Items</h3></center>
                   <center className='all_items'>
                    <label htmlFor="all_items">
                      <input
                        name='all_items'
                        type="checkbox"
                        onChange={handleCheckboxChange}
                      />
                      <span>All</span>
                    </label>
                  </center>
                    
                    <form onSubmit={handleSubmitExecel}>
                    <div className='reportitems'>
                      <label htmlFor="first_name"><input name='first_name' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.first_name || false}
                       /><span>First Name</span></label>
                      <label htmlFor="last_name"><input name='last_name' type="checkbox" onChange={handleCheckboxChange} 
                      checked={selectedOptions.last_name || false}
                      /><span>Last Name</span></label>
                      <label htmlFor="phone1"><input name='phone1' type="checkbox" onChange={handleCheckboxChange} 
                      checked={selectedOptions.phone1 || false}
                      /><span>Phone Number</span></label>
                      <label htmlFor="email"><input name='email' type="checkbox" onChange={handleCheckboxChange} 
                      checked={selectedOptions.email || false}
                      /><span>Email</span></label>
                      <label htmlFor="grade_name"><input name='grade_name' type="checkbox" onChange={handleCheckboxChange} 
                      checked={selectedOptions.grade_name || false}
                      /><span>Grade Name</span></label>
                      <label htmlFor="start_academic_year"><input name='start_academic_year' type="checkbox" onChange={handleCheckboxChange} 
                      checked={selectedOptions.start_academic_year || false}
                      /><span>Start Academic Year</span></label>
                      <label htmlFor="end_academic_year"><input name='end_academic_year' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.end_academic_year || false}
                      /><span>Graduation Year</span></label>
                      <label htmlFor="family_name"><input name='family_name' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.family_name || false}
                      /><span>Family Name</span></label>
                      <label htmlFor="family_mother"><input name='family_mother' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.family_mother || false}
                      /><span>Family Mother</span></label>
                      <label htmlFor="family_mother_tel"><input name='family_mother_tel' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.family_mother_tel || false}
                      /><span>Family Mother Phone</span></label>
                      <label htmlFor="combination_name"><input name='combination_name' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.combination_name || false}
                      /><span>Combination Name</span></label>
                      <label htmlFor="ep_title"><input name='ep_title' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.ep_title || false}
                      /><span>EP Title</span></label>
                      <label htmlFor="ep_type"><input name='ep_type' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.ep_type|| false}
                      /><span>EPs Types</span></label>
                      <label htmlFor="date_of_birth"><input name='date_of_birth' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.date_of_birth || false}
                      /><span>Date of Birth</span></label>
                      <label htmlFor="gender"><input name='gender' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.gender || false}
                      /><span>Gender</span></label>
                      <label htmlFor="place_of_birth_district_or_country"><input name='place_of_birth_district_or_country' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.place_of_birth_district_or_country || false}
                      /><span>place_of_birth_district_or_country</span></label>
                      <label htmlFor="place_of_birth_sector_or_city"><input name='place_of_birth_sector_or_city' type="checkbox" onChange={handleCheckboxChange} 
                      checked={selectedOptions.place_of_birth_sector_or_city || false}
                      /><span>place_of_birth_sector_or_city</span></label>
                      <label htmlFor="life_status"><input name='life_status' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.life_status || false}
                      /><span>life_status</span></label>
                      <label htmlFor="marital_status"><input name='marital_status' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.marital_status || false}
                      /><span>marital_status</span></label>
                      <label htmlFor="currresidence_district_or_country"><input name='currresidence_district_or_country' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.currresidence_district_or_country || false}
                      /><span>currresidence_district_or_country</span></label>
                      <label htmlFor="currresidence_sector_or_city"><input name='currresidence_sector_or_city' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.currresidence_sector_or_city || false}
                      /><span>currresidence_sector_or_city</span></label>
                      <label htmlFor="kids"><input name='kids' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.kids || false}
                      /><span>kids</span></label>
                      <label htmlFor="s4marks"><input name='s4marks' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.s4marks || false}
                      /><span>s4marks</span></label>
                      <label htmlFor="s5marks"><input name='s5marks' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.s5marks || false}
                      /><span>s5marks</span></label>
                      <label htmlFor="s6marks"><input name='s6marks' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.s6marks || false}
                      /><span>s6marks</span></label>
                      <label htmlFor="ne"><input name='ne' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.ne || false}
                      /><span>Natioanal Exam </span></label>
                      <label htmlFor="maxforne"><input name='maxforne' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.maxforne || false}
                      /><span>Maximum National Agregate</span></label>
                      <label htmlFor="decision"><input name='decision' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.decision|| false}
                      /><span>decision</span></label>
                      <label htmlFor="emp_title"><input name='emp_title' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.emp_title || false}
                      /><span>employment_title</span></label>
                      <label htmlFor="emp_status"><input name='emp_status' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.emp_status || false}
                      /><span>employment_status</span></label>
                      <label htmlFor="career"><input name='career' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.career || false}
                      /><span>Career</span></label>
                      <label htmlFor="company"><input name='company' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.company || false}
                      /><span>company</span></label>
                      <label htmlFor="st_level"><input name='st_level' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.st_level || false}
                      /><span>study_level</span></label>
                      <label htmlFor="degree"><input name='degree' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.degree || false}
                      /><span>degree</span></label>
                      <label htmlFor="university"><input name='university' type="checkbox"  onChange={handleCheckboxChange}
                      checked={selectedOptions.university || false}
                      /><span>university</span></label>
                      <label htmlFor="country"><input name='country' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.country || false}
                      /><span>country</span></label>
                      <label htmlFor="scholarship"><input name='scholarship' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.scholarship || false}
                      /><span>scholarship</span></label>
                      <label htmlFor="scholarship_details"><input name='scholarship_details' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.scholarship_details || false}
                      /><span>scholarship_details</span></label>
                      <label htmlFor="st_status"><input name='st_status' type="checkbox" onChange={handleCheckboxChange}
                      checked={selectedOptions.st_status || false}
                      /><span>study_status</span></label>
                    </div>
                      <center><button>Generate</button></center>
                    </form>
                </div>
            </div>:
            null
            }
      </div>
  )
}
