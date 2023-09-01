import requests
from flask import Flask, request, jsonify
from flask_cors import CORS,cross_origin
import datetime



app = Flask(__name__)
CORS(app)

user_id_to_xero_id_map={"U1":"X1","U2":"X2"}
user_id_to_myob_id_map={"U3":"M1"}

accounting_provider_to_ids_map={"Xero":user_id_to_xero_id_map, "MYOB":user_id_to_myob_id_map}
accounting_provider_to_api_url_map={"Xero":"http://xero_service:5002/xero", "MYOB":"http://myob_service:5001/myob"}

user_id_to_business_map={"U1":["Tesla","SpaceX"],"U2":["Meta"],"U3":["Google"]}
user_id_to_name_map={"U1":"Elon Musk","U2":"Soham Chatterjee","U3":"Harshad Bhatia"}

def get_preassessment_value(sheets, loan_amt):
    previous_month_date=datetime.date.today().replace(day=1)-datetime.timedelta(days=1)
    previous_month=previous_month_date.month
    year=previous_month_date.year

    #If previous month was December then last 12 months are in a single year else we need to analyse both current and previous year
    if previous_month==12:
        years_to_analyse=[year]
    else:
        years_to_analyse=[str(year),str(year-1)]
    
    asset_value_sum=0
    profit_or_loss_sum=0
    count=0

    #Break loop once we have values from last 12 months
    for year in years_to_analyse:
        for month_values in sheets[year]:
            asset_value_sum+=int(month_values["assetsValue"])
            profit_or_loss_sum+=int(month_values["profitOrLoss"])
            count+=1
            if count==12:
                break
        if count==12:
            break
    
    average_asset_value=asset_value_sum/12

    if average_asset_value>int(loan_amt):
        preassessment=100
    elif profit_or_loss_sum>0:
        preassessment=60
    else:
        preassessment=20
    
    return preassessment
        


@app.route('/fetch_user_data', methods = ['GET', 'POST'])
@cross_origin()
def fetch_user_data():
    data = request.get_json()
    user_id=data["user_id"]

    name=user_id_to_name_map[user_id]
    business_list=user_id_to_business_map[user_id]
    response_json=jsonify({"name":name,"business_list":business_list, "err":""})
    return response_json

@app.route('/request_sheets', methods = ['GET', 'POST'])
@cross_origin()
def request_sheets():
    data = request.get_json()
    user_id=data["user_id"]
    business_name=data["business_name"]
    year_estd=data["year_estd"]
    summary=data["summary"]
    accounting_provider=data["accounting_provider"]

    #Check if user has account on the selected accouting provider
    if user_id not in accounting_provider_to_ids_map[accounting_provider]:
        response_json=jsonify({"msg":"Request Failed", "err":"Your account is not linked with "+ accounting_provider+". Please select a different Accounting Provider."})
        return response_json

    provider_id= accounting_provider_to_ids_map[accounting_provider][user_id]
    body_json={"provider_id":provider_id, "business_name":business_name}
    url=accounting_provider_to_api_url_map[accounting_provider]
    
    print(body_json)
    json_response=requests.get(url,json=body_json).json()

    return json_response
 
@app.route('/request_decision', methods = ['GET', 'POST'])
@cross_origin()
def request_decision():
    data = request.get_json()
    print(data)
    loan_amt=data["loan_amt"]
    business_name=data["business_name"]
    year_estd=data["year_estd"]
    summary=data["summary"]
    sheets=data["sheets"]

    preassessment=get_preassessment_value(sheets,loan_amt)
    body_json={**data,'preAssessment':preassessment}

    json_response=requests.get("http://decision_engine_service:5003/decision_engine",json=body_json).json()
    
    return json_response

if __name__ == '__main__':
    app.run(port=5000,host="0.0.0.0")