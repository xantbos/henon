import json, requests, os.path
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta # used for more precise accuracy than datetime deltas
from abc import abstractmethod

# Parent inheritable
# Generic Endpoint Skeleton
class Endpoint(object):

	def __init__(self, currencies):
		# declarations
		self.datestring = "%Y-%m-%d" # Allows easy modification
		self.updateDelta = timedelta(weeks=4) # Quick update delay modification
		# init exec
		self.first_run(2, currencies) # Load data from API or db

	# Generic GET functionality
	def get(self):
		self.check_for_incremented_update() # do a quick check if we need to update
		return self.session # session is 1:1 with db

	# Conversion of object to string
	def date_to_string(self, dateobject):
		return dateobject.strftime(self.datestring)

	# Conversion of string to object
	def date_from_string(self, datestring):
		return datetime.strptime(datestring, self.datestring)

	# Comparison of last_checked stamp against today for update delta
	def check_for_incremented_update(self):
		# get today's date, get last checked
		# apply delta to last, compare diff
		today = datetime.now()
		target = self.date_from_string(self.session["last_checked"]) + self.updateDelta
		if today > target:
			self.obtain_since_last_checked()

	# when we detect no database, we assume session doesn't exist either
	# this creates the required keys for later merging and functions
	def generate_new_session(self, currencies):
		# preconfig our session/database
		self.session["last_checked"] = self.date_to_string(datetime.now())
		self.session["rates"] = {}
		self.session["master_currency_list"] = currencies

	# Checking for our NoSQL database file
	def check_for_datajson(self):
		return True if os.path.isfile(self.databasename) else False

	# Our primary requesting function
	# Directing it all here allows different implementations
	# Such as if we decided to use a different library, track outgoing requests, etc
	def request(self, url):
		try:
			data = requests.get(url)
		except requests.exceptions.ConnectionError as e:
			# handling for network issues
			pass
		except requests.exceptions.HTTPError as e:
			# handling for failed status code
			pass
		except requests.exceptions.Timeout as e:
			# handling for timeouts
			pass
		except Exception as e:
			# handling for any other cases
			pass
		else:
			return requests.get(url)
		return False

	# Function namesake, calculates the reverse rate 1/X and cuts decimals
	def calculate_reverse_rate(self, value):
		return round(1 / value, 5)

	# Reads a json file, currently exclusively assigned database
	def read_json(self):
		with open(self.databasename, 'r') as infile:
			content = json.load(infile)
		return content

	# Writes to a json file, currently exclusively assigned database
	def dump_json(self, data):
		with open(self.databasename, 'w') as outfile:
			json.dump(data, outfile, indent=2)

	@abstractmethod # force child class to implement this method, handle endpoint specific info
	def first_run(self, *args, **kwargs):
		pass

	@abstractmethod # force child class to implement this method, handle endpoint specific info
	def obtain_since_last_checked(self, *args, **kwargs):
		pass

	@abstractmethod # force child class to implement this method, handle endpoint specific info
	def obtain_endpoint_data(self, *args, **kwargs):
		pass