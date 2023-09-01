import logo from './logo.svg';
import './App.css';
import { useState,useEffect } from 'react';
import axios from 'axios';
import money_logo from './money-bag.svg';

function App() {
  const backend_url = "http://127.0.0.1:5000/";
  const [application_stage, setStage] = useState(1);
  const [approved_amt, setAmount] = useState([]);
  const [err_msg, setError] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [userdata, setUser] = useState([]);
  const [business_data, setBusiness] = useState({
    loan_amt:"",
    business_name:"",
    year_estd:"",
    accounting_provider:"",
    summary:""
  });

  const fetchUserInfo = () => {
    //Since implementing a login auth is not within the scope of this assignment, we will assume the user U1 is logged in.
    const user_id = { 'user_id': 'U1' };
    const customConfig = {
    headers: {
    'Content-Type': 'application/json'
    }};
    return axios.post(backend_url+'fetch_user_data',user_id,customConfig) 
    .then((response) => setUser(response.data));
  }

  useEffect(() => {
    fetchUserInfo();
    console.log(userdata["business_list"])
  }, [])

  
  const handleChange = (e)=>{
    const changedProp={}
    changedProp[e.target.name]=e.target.value
    setBusiness(prevState =>({...prevState ,...changedProp}))
    console.log(business_data)
  }

  const requestSheets=async (e)=>{
    e.preventDefault()

    //Since implementing a login auth is not within the scope of this assignment, we will assume the user U1 is logged in.
    const business_details = {...business_data,...{'user_id':'U1'}};
    const customConfig = {
    headers: {
    'Content-Type': 'application/json'
    }}
    console.log(business_details)
    const response_json=await axios.post(backend_url+'request_sheets',business_details,customConfig).then((response) => response.data)
    console.log(response_json)
    const {err,...body}=response_json
    console.log(err,body)
    if (err==null){
      setSheets(body['sheets'])
      setError([])
      setStage(2)
    }
    else{
      setError(err)
    }

  }

  const requestDecision=async (e)=>{
    e.preventDefault()

    //Since implementing a login auth is not within the scope of this assignment, we will assume the user U1 is logged in.
    const business_details = {...business_data,...{'user_id':'U1','sheets':sheets}}
    const customConfig = {
    headers: {
    'Content-Type': 'application/json'
    }}
    console.log(business_details)
    const response_json=await axios.post(backend_url+'request_decision',business_details,customConfig).then((response) => response.data)
    console.log(response_json)
    const {err,...body}=response_json
    console.log(err,body)
    if (err==null){
      setAmount(body['approved_amt'])
      setError([])
      setStage(3)
    }
    else{
      setError(err)
    }
  }

  const resetFields=(e)=>{
    e.preventDefault()

    setBusiness({
      loan_amt:"",
      business_name:"",
      year_estd:"",
      accounting_provider:"",
      summary:""
    })
    setSheets([])
    setAmount([])
    setError([])
    setStage(1)
  }
  return (
    <div className='flex flex-col px-20'>
      <h1 className='mt-5 justify-center text-2xl font-semibold'>Welcome {userdata["name"]?.split(' ')[0]}</h1>
      <div className='grid grid-cols-2 '>
        <div className='h-screen justify-center flex flex-col items-center'>
          <h1 className='-mt-20 text-2xl font-semibold justify-center'>Want a loan? Look no further!</h1>
          <img className='mt-10 animate-pulse' width={100} height={100} src={money_logo}/>
          <h1 className='mt-10 ml-5 text-2xl font-semibold justify-center'>Fill in the details to know more. </h1>
        </div>
        <div className='flex flex-col items-center'>
          {application_stage==1 && 
          <form onSubmit={requestSheets} className='flex flex-col w-full'>
            <input required onChange={handleChange} value={business_data.loan_amt} name="loan_amt"  type="number" placeholder="Loan Amount in $*" className="mt-5 border-2 border-blue-600 shadow appearance-none border rounded w-full py-4 px-5 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
            <select defaultValue='' required onChange={handleChange}  name="business_name"  type="text" className="mt-5 border-2 border-blue-600 shadow appearance-none border rounded w-full py-4 px-5 leading-tight focus:outline-none focus:shadow-outline">
              <option name='select' value="" disabled>Select business for which you want a loan*</option>
              {userdata["business_list"]?.map(item => {
                return (<option value={item}>{item}</option>);}
              )}
            </select>                  
            <input required onChange={handleChange} value={business_data.year_estd} name="year_estd"  type="number" placeholder="Year Established*" className="mt-5 border-2 border-blue-600 shadow appearance-none border rounded w-full py-4 px-5 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
            <select defaultValue='' required onChange={handleChange}  name="accounting_provider"  type="text" className="mt-5 border-2 border-blue-600 shadow appearance-none border rounded w-full py-4 px-5 leading-tight focus:outline-none focus:shadow-outline">
              <option value="" disabled>Select Accounting Provider*</option>
              <option value="Xero">Xero</option>
              <option value="MYOB">MYOB</option>
            </select>              
            <textarea required onChange={handleChange} value={business_data.summary} name="summary" placeholder="Summary of Profit or Loss by year*" className="mt-5 h-60 border-2 border-blue-600 shadow appearance-none border rounded w-full py-4 px-5 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"/>
            {err_msg!=null &&<p className='text-red-600 mt-2'>{err_msg}</p>}
            <button type='submit' className="bg-black max-w-fit text-white py-2 px-10 mt-10 rounded">Request Sheets</button>             
          </form>}
          {application_stage==2 &&
          <div>
            <p className='text-xl'>Please review your balance sheets before proceeding.</p>
            <div className='mt-5 h-[450px] overflow-y-scroll border-2 border-blue-600 shadow appearance-none border rounded w-full py-4 px-5 text-gray-700 leading-tight focus:outline-none focus:shadow-outline' >
            {Object.entries(sheets)?.map(item => {
                return (                  
                <div className='w-full'>
                  <h1 className='text-xl font-semibold mx-auto'>Balance Sheet for Year {item[0]}</h1>
                  { item[1].map(innerItem=>{
                    return(
                    <div>
                      <h1 className='mt-5 text-xl mx-auto'>Month : {innerItem['month']}</h1>
                      <h1 className='text-xl mx-auto'>Asset Value : {innerItem['assetsValue']}</h1>
                      <h1 className='text-xl mx-auto'>Profit or Loss : {innerItem['profitOrLoss']}</h1>
                    </div>
                    );})}         
                </div>
                );}
              )}
            </div>
            {err_msg!=null &&<p className='font-red-600 mt-2'>{err_msg}</p>}
            <button onClick={requestDecision} className="bg-black max-w-fit text-white py-2 px-10 mt-10 rounded">Send</button>
          </div>}
          {application_stage==3 && 
          <div className='h-screen flex flex-col justify-center'>
            {parseInt(approved_amt)>0 && <h1 className='text-2xl -mt-20'>Congrats!! Your loan has been approved for ${approved_amt}.</h1>}
            {parseInt(approved_amt)<=0 && <h1 className='text-2xl -mt-20'>Sorry. The loan could not be approved based on your finances.</h1>}
            <button onClick={resetFields} className="bg-black max-w-fit text-white py-2 px-10 mt-10 rounded">Reset</button>
          </div>}
        </div>    
      </div>
    </div>
    
  );
}

export default App;
