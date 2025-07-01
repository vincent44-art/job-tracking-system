# run.py (Corrected Version)
from app import create_app, db
from app.models import User, Purchase, SellerAssignment, Sale, CarExpense, OtherExpense

# Create the app instance at the top level
app = create_app()

# This makes shell context convenient for debugging
@app.shell_context_processor
def make_shell_context():
    return {
        'db': db, 
        'User': User, 
        'Purchase': Purchase, 
        'SellerAssignment': SellerAssignment,
        'Sale': Sale,
        'CarExpense': CarExpense,
        'OtherExpense': OtherExpense
    }

# The app.run() command should still be inside this block
if __name__ == '__main__':
    app.run(debug=True, port=5001)