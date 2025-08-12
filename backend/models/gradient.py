from . import db

class Gradient(db.Model):
    __tablename__ = 'gradients'
    id = db.Column(db.Integer, primary_key=True)
    application_date = db.Column(db.Date, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255))
