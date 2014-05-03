import urllib
import json
import json as simplejson

# code credit to stackoverflow user jimhark (http://stackoverflow.com/users/514485/jimhark)

googleGeocodeUrl = 'http://maps.googleapis.com/maps/api/geocode/json?'

def get_coordinates(query, from_sensor=False):
    query = query.encode('utf-8')
    params = {
        'address': query,
        'sensor': "true" if from_sensor else "false"
    }
    url = googleGeocodeUrl + urllib.urlencode(params)
    json_response = urllib.urlopen(url)
    response = simplejson.loads(json_response.read())
    if response['results']:
        location = response['results'][0]['geometry']['location']
        latitude, longitude = location['lat'], location['lng']
        print query, latitude, longitude
    else:
        latitude, longitude = -1000, -1000
        print query, "<no results>"
    return latitude, longitude

#######################################

partner_json_file = "../Database/partner_data.json"
output_file = "../Database/partner_data.js"

def load_json():
	with open(partner_json_file, 'r') as f:
		return json.load(f)

def get_address(partner):
	return partner['addressLine1'] + " " + partner['addressLine2'] + ", " + partner['city'] + " " +  partner['zip'] 

def make_partner_js():
	str_list = ['var partner_data = [']
	json_data = load_json()
	length = len(json_data)
	i = 0
	while i < length:
		partner = json_data[i]
		str_list.append(json.dumps(partner)[:-1] + ", \n")
		if "lat" not in partner:
			coord = get_coordinates(get_address(partner))
			str_list.append("\t\t\"lat_long\": [" + str(coord[0]) + ", " + str(coord[1]) + "]}")
			if not i == length-1:
				str_list.append(',\n')
			else:
				str_list.append("]")
		i += 1
	with open(output_file, 'w+') as f:
		f.write("".join(str_list))

make_partner_js()