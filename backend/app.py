#!/usr/bin/python
# coding=utf-8

from flask import Flask
from flask_restful import Resource, Api
from flask_cors import CORS
from endpoints.frankfurter import Frankfurter

# change this to the url for the frontend to block unauthorized connections
# can optionally configure token handshakes to ensure no header spoofing
frontend_url = "*"

# Set up our Flask Restful implementation
app = Flask(__name__)
api = Api(app)
# CORS for CORS
# Can be customized to restrict access
CORS(app, resources={r"/*": {"origins": f"{frontend_url}"}})

# Insert any endpoint classes here.
# Can quickly add or remove with commenting
master_endpoint_list = [
Frankfurter,
]

# Convert the endpoint list into equivalent strings
string_endpoint_list = [x.__name__.lower() for x in master_endpoint_list]

# Root route, return all valid endpoints for consumption and displaying
class Default(Resource):
	def get(self):
		return {'endpoints': [x for x in string_endpoint_list]}

# Primary route
class CurrencyInformation(Resource):

	__name__ = "CurrencyInformation" # bypass to preload class on declaration

	# Setup function
	def __init__(self):
		self.valid_currencies = ['USD', 'CAD', 'EUR'] # list of currencies to process, potentially shift into a config.json
        
        # from the master list we generate initialized classes
        # this is for the GET functionality, and potentially other endpoints for rapid implementation
		self.endpoints = [simClass(self.valid_currencies) for simClass in master_endpoint_list]

	# Checks provided endpoint string against all loaded class names
    # On match, call the generic get
    # Potential for abuse, look into sanitization and other security measures since user input can't be trusted
	def get(self, endpoint):
		if endpoint.lower() in string_endpoint_list: # check the user's inputted endpoint exists in our list
			try:
				return self.endpoints[string_endpoint_list.index(endpoint.lower())].get() # call the default get
			except Exception as e: # this will either be called on a schema failure or general error from the class
				return {"error": str(e)}, 500  # troubleshooting purposes, we'll return the actual error
		else:
			return {"error": "Endpoint not found."}, 400 # straightforward, the user string was not valid in our list

# Declare our primary API for setup init purposes
cApi = CurrencyInformation()

# Create our routes through flask-restful
api.add_resource(cApi, '/<endpoint>') # dynamic endpoint as variable
api.add_resource(Default, '/')

# Script is run through python, not flask due to flask-restful
if __name__ == '__main__':
	app.run(port=65535)
	#app.run(host="0.0.0.0", debug=True)
