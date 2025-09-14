from flask_restful import Resource, reqparse
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.it_alert import ITAlert, AlertSeverity
from ..models.user import User
from ..utils.helpers import make_response_data


class ITIncidentsResource(Resource):
    @jwt_required()
    def post(self):
        # Check role
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or user.role.value not in ['it', 'admin']:
            return make_response_data(success=False, message="Access denied", status_code=403)

        parser = reqparse.RequestParser()
        parser.add_argument('title', type=str, required=True, help='Incident title')
        parser.add_argument('description', type=str, help='Incident description')
        parser.add_argument('severity', type=str, required=True, choices=[e.value for e in AlertSeverity], help='Incident severity')
        parser.add_argument('event_ids', type=list, location='json', required=True, help='Related event IDs')
        parser.add_argument('assigned_to', type=str, help='Assigned to email')
        parser.add_argument('suggested_actions', type=list, location='json', help='Suggested remediation actions')

        args = parser.parse_args()

        alert = ITAlert(
            event_ids=args['event_ids'],
            title=args['title'],
            description=args['description'],
            severity=AlertSeverity(args['severity']),
            assigned_to=args['assigned_to'],
            suggested_actions=args['suggested_actions']
        )

        from ..extensions import db
        db.session.add(alert)
        db.session.commit()

        return make_response_data(data=alert.to_dict(), message="Incident created successfully", status_code=201)
