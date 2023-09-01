from flask import Flask, request, jsonify
from xero_sheets import sheet_map

app = Flask(__name__)

xero_id_set=set(["X1","X2"]) #Users existing in Xero Database

xero_id_to_business_map={"X1":set(["Tesla","SpaceX"]), "X2":set(["Meta"])} #Businesses belonging to each user

def get_balance_sheet(business_name):
    return sheet_map[business_name]
    
@app.route('/xero')
def accounting_software():
    data = request.get_json()

    sheets=None
    err_msg=None

    xero_id=data["provider_id"]
    business_name=data["business_name"]

    #Check if user exists in Xero
    if xero_id not in xero_id_set:
        err_msg="User does not exist in Xero"
        response_json=jsonify({"sheets":sheets, "err":err_msg})
        return response_json

     
    #Check if selected business exists for user on Xero
    if business_name not in xero_id_to_business_map[xero_id]:
        err_msg="User does not have selected business registered on Xero"
        response_json=jsonify({"sheets":sheets, "err":err_msg})
        return response_json
    
    sheets=get_balance_sheet(business_name)

    if not sheets:
        err_msg="Sheets dont exist for years for "+ business_name
      
    response_json=jsonify({"sheets":sheets, "err":err_msg})
    print(response_json)
    return response_json
    
 

if __name__ == '__main__':
    app.run(port=5002,host="0.0.0.0")