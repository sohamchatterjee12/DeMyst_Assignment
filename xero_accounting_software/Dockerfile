FROM python:3.11-slim
WORKDIR /xero_accounting_software
COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . .
CMD [ "python3", "-m" , "xero_accounting_software", "flask", "run"]