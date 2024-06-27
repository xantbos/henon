import itertools, os.path
from datetime import datetime
from dateutil.relativedelta import relativedelta # used for more precise accuracy than datetime deltas
from endpoints.endpoint import Endpoint

# Class for actual API interactions
class Frankfurter(Endpoint):

	# Setup function
	def __init__(self, currencies):
		# declarations
		self.databasename = "databases/frankfurter.json" # Allows easy modification
		self.base_api_url = "https://api.frankfurter.app" # In case of relocation
		self.session = {} # Presetup for merging later, master database replication for this endpoint
		super().__init__(currencies) # Run parent setup

	# Overarching endpoint handler
	# Generates a currency permutation list
	# Generates the url string with timestamp and from/to for frankfurter
	# Once the session data is combined, dumps it to json as a NoSQL db
	def obtain_endpoint_data(self, timestamp, currencies):
		# take the passed currencies and generate a pairing of each in both orders
		combined_lists = list(itertools.permutations(currencies, 2))

		# now we reach out to the endpoint to begin consuming data
		for a,b in combined_lists:
			data = self.request(f"{self.base_api_url}/{timestamp}..?from={a}&to={b}")
			if data:
				self.merge_new_rates_into_session(data.json())
			else:
				return False
		self.session["last_checked"] = self.date_to_string(datetime.now()) # update last checked
		self.dump_json(self.session) #update our database with the newly consumed data

	# Make a call attempt to see if there's any data since our last checked timestamp
	def obtain_since_last_checked(self):
		if self.obtain_endpoint_data(self.session["last_checked"], self.session["master_currency_list"]):
			self.session["last_checked"] = self.date_to_string(datetime.now())
		else: return False

	# Base source call
	# If database file doesn't exist, we generate a brand new one
	# If database exists, we simply read it and check to see if we need to update our NoSQL database
	def first_run(self, yearsback, currencies):
		if not self.check_for_datajson():
			# no database, initialize for endpoint consumptions and integration
			self.generate_new_session(currencies)			
			# generate timestamp string compliant with frankfurter's endpoints
			timestamp = self.date_to_string(datetime.now() - relativedelta(years=yearsback))
			if not self.obtain_endpoint_data(timestamp, currencies):
				return False
		else:
			self.session = self.read_json(self.databasename) # read our NoSQL db file instead of calling API
			if self.session["master_currency_list"] != currencies: # currency master list differs
				# nuke database, we need to rebuild based on the new currencies
				os.remove(self.databasename) # delete the file (optionally make a backup)
				if not self.first_run(yearsback,currencies): # call this method again to start from scratch
					return False

	# Takes a new root json taken from API and injects keys into session
	def merge_new_rates_into_session(self, newjson):
		baseCurrency = newjson["base"]
		for date in newjson["rates"]:
			for rate in newjson["rates"][date]:
				if not date in self.session["rates"]: self.session["rates"][date] = {}
				self.session["rates"][date][f"{baseCurrency}-{rate}"] = newjson["rates"][date][rate]