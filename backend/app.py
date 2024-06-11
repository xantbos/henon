from flask import Flask
from flask_restful import Resource, Api
from flask_cors import CORS
from endpoints.frankfurter import Frankfurter

# Set up our Flask Restful implementation
app = Flask(__name__)
api = Api(app)
# CORS for CORS
CORS(app, resources={r"/*": {"origins": "*"}})

# Root route, effectively unused
class Default(Resource):
	def get(self):
		return {'task': 'nothing'}

# Primary route
class CurrencyInformation(Resource):

	__name__ = "CurrencyInformation" # bypass to preload class on declaration

	# Setup function
	def __init__(self):
		self.valid_currencies = ['usd', 'cad', 'eur']
		self.frankfurter = Frankfurter(self.valid_currencies)

	# Might seem weird to have Frankfurter as a subclass when this could probably
	# just be a single class, however in the interest of keeping scaling options open,
	# this setup allows other APIs to be set up and included under 'CurrencyInformation'
	def get(self):
		return self.frankfurter.get()

# Declare our primary API for setup init purposes
cApi = CurrencyInformation()

# Create our routes through flask-restful
api.add_resource(cApi, '/currency')
api.add_resource(Default, '/')

# Script is run through python, not flask due to flask-restful
if __name__ == '__main__':
	app.run(port=65535)#debug=True)