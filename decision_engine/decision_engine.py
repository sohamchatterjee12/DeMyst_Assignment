from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/decision_engine')
def decision_engine():
    data = request.get_json()
    pre_assessment=data["preAssessment"]/100
    loan_amt=data["loan_amt"]
    business_name=data["business_name"]
    year_estd=data["year_estd"]
    summary=data["summary"]
    sheets=data["sheets"]

    #Do the required calculations to calculate the decision coefficient.For mock purpose we are setting it to 1.
    decision_coefficient=1

    approved_amt=pre_assessment * decision_coefficient * int(loan_amt)
    response_json=jsonify({"approved_amt" : approved_amt })
    return response_json
 

if __name__ == '__main__':
    app.run(port=5003,host='0.0.0.0')
