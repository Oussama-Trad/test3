from flask import Blueprint, request, jsonify
from flask_cors import CORS

bp_events = Blueprint('events', __name__)
CORS(bp_events)

@bp_events.route('/api/events', methods=['GET'])
def get_events_route():
    return get_events()

def get_events():
    from extensions import db, location_collection, departement_collection
    location_id = request.args.get('locationId')
    departement_id = request.args.get('departementId')
    print('DEBUG /api/events params:', location_id, departement_id)
    try:
        if not location_id or not departement_id:
            print('ERROR: locationId or departementId missing')
            return jsonify({'error': 'locationId and departementId are required'}), 400

        query = {
            '$or': [
                {'locationId': location_id, 'departementId': departement_id},
                {'locationId': 'all', 'departementId': departement_id},
                {'locationId': location_id, 'departementId': 'all'},
                {'locationId': 'all', 'departementId': 'all'}
            ]
        }
        print('DEBUG /api/events query:', query)
        events = list(db.event.find(query))
        print('DEBUG /api/events found:', len(events), 'events')
        # Ajout des noms de location et département
        for e in events:
            e['_id'] = str(e['_id'])
            # Ajout du nom de la location
            if 'locationId' in e and e['locationId'] != 'all':
                loc = location_collection.find_one({'_id': e['locationId']})
                if not loc:
                    # Peut-être que l'ID est string, il faut convertir
                    from bson import ObjectId
                    try:
                        loc = location_collection.find_one({'_id': ObjectId(e['locationId'])})
                    except Exception as ex:
                        print('ERROR location ObjectId:', ex)
                        loc = None
                e['location'] = loc['nom'] if loc and 'nom' in loc else e['locationId']
            else:
                e['location'] = 'Tous'
            # Ajout du nom du département
            if 'departementId' in e and e['departementId'] != 'all':
                dep = departement_collection.find_one({'_id': e['departementId']})
                if not dep:
                    from bson import ObjectId
                    try:
                        dep = departement_collection.find_one({'_id': ObjectId(e['departementId'])})
                    except Exception as ex:
                        print('ERROR departement ObjectId:', ex)
                        dep = None
                e['departement'] = dep['nom'] if dep and 'nom' in dep else e['departementId']
            else:
                e['departement'] = 'Tous'
        print('DEBUG /api/events response:', events)
        return jsonify(events)
    except Exception as e:
        print('ERROR /api/events:', str(e))
        return jsonify({'error': str(e)}), 500
