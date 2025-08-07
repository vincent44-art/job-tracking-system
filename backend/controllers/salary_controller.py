from flask import Blueprint, request
from datetime import datetime
from models import Salary, SalaryPayment
from extensions import db
from utils.auth import auth_required, role_required, get_current_user
from utils.response import success_response
from utils.error import bad_request, not_found

bp = Blueprint('salaries', __name__, url_prefix='/api/salaries')

@bp.route('/', methods=['GET'])
@auth_required
@role_required('admin', 'ceo')
def get_salaries():
    salaries = Salary.query.all()
    salaries_data = [{
        'id': salary.id,
        'employee': {
            'id': salary.employee.id,
            'firstName': salary.employee.first_name,
            'lastName': salary.employee.last_name
        },
        'baseSalary': salary.base_salary,
        'bonus': salary.bonus,
        'deductions': salary.deductions,
        'effectiveDate': salary.effective_date.isoformat(),
        'notes': salary.notes,
        'createdAt': salary.created_at.isoformat()
    } for salary in salaries]
    return success_response(salaries_data)

@bp.route('/', methods=['POST'])
@auth_required
@role_required('admin')
def create_salary():
    data = request.get_json()
    
    required_fields = ['employee_id', 'base_salary', 'effective_date']
    if not all(field in data for field in required_fields):
        return bad_request('Missing required fields')
    
    try:
        effective_date = datetime.fromisoformat(data['effective_date'])
    except ValueError:
        return bad_request('Invalid date format')
    
    salary = Salary(
        employee_id=data['employee_id'],
        base_salary=data['base_salary'],
        bonus=data.get('bonus', 0),
        deductions=data.get('deductions', 0),
        effective_date=effective_date,
        notes=data.get('notes')
    )
    
    db.session.add(salary)
    db.session.commit()
    
    return success_response({
        'id': salary.id,
        'employeeId': salary.employee_id,
        'baseSalary': salary.base_salary,
        'bonus': salary.bonus,
        'deductions': salary.deductions,
        'effectiveDate': salary.effective_date.isoformat(),
        'notes': salary.notes
    }, status_code=201)

@bp.route('/payments', methods=['GET'])
@auth_required
@role_required('admin', 'ceo')
def get_salary_payments():
    payments = SalaryPayment.query.all()
    payments_data = [{
        'id': payment.id,
        'salary': {
            'id': payment.salary.id,
            'employee': {
                'id': payment.salary.employee.id,
                'firstName': payment.salary.employee.first_name,
                'lastName': payment.salary.employee.last_name
            }
        },
        'amount': payment.amount,
        'paymentDate': payment.payment_date.isoformat(),
        'paymentMethod': payment.payment_method,
        'status': payment.status,
        'processedBy': {
            'id': payment.processed_by.id,
            'firstName': payment.processed_by.first_name,
            'lastName': payment.processed_by.last_name
        },
        'notes': payment.notes
    } for payment in payments]
    return success_response(payments_data)

@bp.route('/payments', methods=['POST'])
@auth_required
@role_required('admin')
def create_salary_payment():
    data = request.get_json()
    current_user = get_current_user()
    
    required_fields = ['salary_id', 'amount', 'payment_date', 'payment_method']
    if not all(field in data for field in required_fields):
        return bad_request('Missing required fields')
    
    try:
        payment_date = datetime.fromisoformat(data['payment_date'])
    except ValueError:
        return bad_request('Invalid date format')
    
    payment = SalaryPayment(
        salary_id=data['salary_id'],
        amount=data['amount'],
        payment_date=payment_date,
        payment_method=data['payment_method'],
        status='pending',
        processed_by_id=current_user.id,
        notes=data.get('notes')
    )
    
    db.session.add(payment)
    db.session.commit()
    
    return success_response({
        'id': payment.id,
        'salaryId': payment.salary_id,
        'amount': payment.amount,
        'paymentDate': payment.payment_date.isoformat(),
        'paymentMethod': payment.payment_method,
        'status': payment.status,
        'processedById': payment.processed_by_id,
        'notes': payment.notes
    }, status_code=201)

@bp.route('/payments/<int:payment_id>/toggle-status', methods=['POST'])
@auth_required
@role_required('admin')
def toggle_payment_status(payment_id):
    payment = SalaryPayment.query.get(payment_id)
    
    if not payment:
        return not_found('Payment not found')
    
    if payment.status == 'pending':
        payment.status = 'paid'
    elif payment.status == 'paid':
        payment.status = 'cancelled'
    else:
        payment.status = 'pending'
    
    db.session.commit()
    
    return success_response({
        'id': payment.id,
        'status': payment.status
    })