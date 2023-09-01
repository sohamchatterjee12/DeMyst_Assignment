from flask import Flask, request, jsonify
from myob_sheets import sheet_map

app = Flask(__name__)

myob_id_set=set(["M1"]) #Users existing in MYOB Database

myob_id_to_business_map={"M1":set(["Google"])} #Businesses belonging to each user

def get_balance_sheet(business_name):
    return sheet_map[business_name]
    
@app.route('/myob')
def accounting_software():
    data = request.get_json()

    sheets=None
    err_msg=None

    myob_id=data["provider_id"]
    business_name=data["business_name"]

    #Check if user exists in MYOB
    if myob_id not in myob_id_set:
        err_msg="User does not exist in Myob"
        response_json=jsonify({"sheets":sheets, "err":err_msg})
        return response_json

     
    #Check if selected business exists for user on MYOB
    if business_name not in myob_id_to_business_map[myob_id]:
        err_msg="User does not have selected business registered on Myob"
        response_json=jsonify({"sheets":sheets, "err":err_msg})
        return response_json
    
    sheets=get_balance_sheet(business_name)

    if not sheets:
        err_msg="Sheets dont exist for years for "+ business_name
        
    response_json=jsonify({"sheets":sheets, "err":err_msg})
    return response_json
    
 

if __name__ == '__main__':
    app.run(port=5001,host="0.0.0.0")