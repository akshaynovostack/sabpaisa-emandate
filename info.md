{
consumerReferenceNumber: "", //subpaisa txnid
mandatePurpose: "", //tobe managed by NS
mandateEndDate: "", //tobe managed by NS
payerName: "", //from sabpaisa
mandateMaxAmount: "", //tobe managed by NS
mandateStartDate: "", //tobe managed by NS
panNo: "", //tobe managed by NS
mandateCategory: "", //tobe managed by NS
payerAccountNumber: "", //tobe managed by NS
payerAccountType: "", //tobe managed by NS  
payerBank: "", //tobe managed by NS
payerEmail: "", //from sabpaisa
payerMobile: "", //from sabpaisa
telePhone: "", //from sabpaisa
payerBankIfscCode: "", //tobe managed by NS
authenticationMode: "", //tobe managed by NS
frequency: "", //tobe managed by NS
npciPaymentBankCode: "", //use the first object from https://subscription.sabpaisa.in/subscription/REST/GetCommonData/0/RequestType 
schemeReferenceNumber: "",
emiamount: ""
}

###############################.env###############################
DATABASE_URL="mysql://sabpaisa:Sabpaisa@123@139.59.83.48:3306/e_mendate"
PORT=4000
SABPAISA_USERNAME=MERC29@SP
SABPAISA_PASSWORD=m7C38oK6lf3z
SABPAISA_AUTH_TOKEN=12adf3d1e4ac47f08356cb9139387aae
SABPAISA_SUB_BASEURL=https://stage-subscription-python.sabpaisa.in/api/
SABPAISA_SUB_TOKEN=4d93c7cf31324fcd9be6912dc06ffe9c
BASEURL=http://localhost:4000/
AUTHKEY=kaY9AIhuJZNvKGp2
IV=YN2v8qQcU3rGfA1y
###############################.env###############################