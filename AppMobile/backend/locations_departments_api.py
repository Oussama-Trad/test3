# Ajoute ces routes à la fin de backend/app.py
from flask import jsonify

@app.route('/api/locations-full', methods=['GET'])
def get_locations_full():
    locations = list(location_collection.find({}, {'_id': 1, 'nom': 1}))
    return jsonify([{'id': str(loc['_id']), 'nom': loc['nom']} for loc in locations])

@app.route('/api/departments-full', methods=['GET'])
def get_departments_full():
    departements = list(departement_collection.find({}, {'_id': 1, 'nom': 1}))
    return jsonify([{'id': str(dep['_id']), 'nom': dep['nom']} for dep in departements])
